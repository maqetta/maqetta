define(["dojo/_base/declare",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetBase",
		"dijit/_WidgetsInTemplateMixin",
        "../../model/Path",
        "system/resource",
        "dojox/form/uploader/FileList", 
       	"dojox/form/Uploader",
        "dojo/i18n!../nls/ui",
        "dojo/text!./templates/AddFiles.html",
        "dijit/form/Button"
],function(declare, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin, Path, Resource, FileList, Uploader, uiNLS, templateString){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: templateString,
		uiNLS: uiNLS,

		_assignCommand: function() {
			var cmd = "cmd/addFiles?path=" + encodeURIComponent(folder.getPath()),
				explode = this.explodeZip.get("value");
			if (explode) {
				cmd += "&explodeZip=1";
			}
			dojo.style(this.zipWarning, "display", explode ? "block" : "none");
			this.uploader.set("url", cmd);
		},

		postCreate: function() {
			var folder=Resource.getRoot();

			if (this.selectedResource) {
				folder = this.selectedResource.elementType == 'Folder' ? this.selectedResource : this.selectedResource.parent;
			}
//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
			this.fileDialogParentFolder.innerHTML=folder.getPath();

			this._assignCommand();
			dojo.connect(this.explodeZip, "onChange", this, this._assignCommand);

			new FileList({uploader:this.uploader}, this.filelist);

			var uploadHandler, uploadBtn = this.uploadBtn;
			uploadBtn.set("disabled", true);

			var uploader = this.uploader;

			dojo.connect(this.uploader, 'onChange', function (files) {
				if (uploadHandler) {
					dojo.disconnect(uploadHandler);
				}
				uploadHandler = dojo.connect(uploadBtn, "onClick", null, function(){
					uploader.set("disabled", true);
					uploader.upload();
				});
				if (uploadBtn.oldText) {
					uploadBtn.containerNode.innerText = uploadBtn.oldText;
				}
				uploadBtn.set("disabled", !files.length);
			});

			var setDone = function(){
				uploader.set("disabled", false);
				dojo.disconnect(uploadHandler);
				uploadBtn.oldText = uploadBtn.containerNode.innerText;
				uploadBtn.containerNode.innerText = uiNLS.done;
				uploadBtn.set("disabled", true);
			};

			dojo.connect(this.uploader, "onComplete", function(dataArray){
				dataArray.forEach(function(data){
					// need to add to the client side without a server call, mimic the results of a server call
					// private API call since this is all part of the resource package.
					var type, changed = new Path(folder.getPath());
					if (data.file.indexOf("/") == -1) {
						folder._appendFiles([{isDir: false, isLib: false, isNew: false, name: data.file}]);						
						changed.append(data.file);
						type = "updated";
					} else {
						//FIXME: Could iterate through results and create hierarchies without fetching from server
						folder.getChildrenSync(function(){}, true);
						type = "reload";
					}
					Resource.resourceChanged(type, changed.toString());
				});
				setDone();
			});
			dojo.connect(this.uploader, "onError", function(args){
				//FIXME: post error message
				console.error("Upload error: ", args);
				setDone();
			});
		},

		_cancelButton: function(){
			this.onClose();
		},
	});
});
