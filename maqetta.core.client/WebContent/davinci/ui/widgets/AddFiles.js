define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "../../model/Path",
        "system/resource",
        "dojox/form/uploader/FileList", 
       	"dojox/form/Uploader",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/AddFiles.html",
        "dijit/form/Button"
],function(declare, _Templated, _Widget, Path, Resource, FileList, Uploader, uiNLS, commonNLS, templateString){
	return declare("davinci.ui.widgets.AddFiles", [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,

		selectedResource: null,
		uiNLS: uiNLS,

		postCreate: function() {
			var folder=Resource.getRoot();

			if (this.selectedResource) {
				folder = this.selectedResource.elementType == 'Folder' ? this.selectedResource : this.selectedResource.parent;
			}
//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
			this.fileDialogParentFolder.innerHTML=folder.getPath();

			this.uploader.set("url", 'cmd/addFiles?path=' + folder.getPath()); 

			var list = new FileList({uploader:this.uploader}, this.filelist);

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
				dojo.forEach(dataArray, function(data){
					
					/* 
					 * need to add to the client side without a server call, mimic the results of a server call
					 * private API call since this is all part of the resource package.
					 * 
					 *  */
					folder._appendFiles([{isDir:false, isLib:false, isNew:false,name:data.file}]);
					var changed = new Path(folder.getPath()).append(data.file);
					Resource.resourceChanged('updated', changed.toString());
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
