define(["dojo/_base/declare",
        "./AddFiles",
        "../../model/Path",
        "system/resource",
//        "dojox/form/uploader/FileList",
        "dijit/ProgressBar",
        "dojo/i18n!../nls/ui"
],function(declare, AddFiles, Path, Resource, ProgressBar, uiNLS){
	return declare(AddFiles, {
		_getCommand: function() {
			return this.inherited(arguments) + "&explodeZip=1";
		},

		onClose : function(){},

		postCreate: function() {
			dojo.style(this.zipWarning, "display", "block");

			var folder=Resource.getRoot();

			if (this.selectedResource) {
				folder = this.selectedResource.elementType == 'Folder' ? this.selectedResource : this.selectedResource.parent;
			}
//			dijit.byId('fileDialogParentFolder').set('value',folder.getPath());
			this.fileDialogParentFolder.innerHTML=folder.getPath();

			this.uploader.set("multiple", false);
			this.uploader.set("label", uiNLS.selectZip);
			this.uploader.set("url", this._getCommand(folder));

//			new FileList({uploader:this.uploader}, this.filelist);

			var uploadHandler, uploadBtn = this.uploadBtn;
			uploadBtn.set("disabled", true);

			var uploader = this.uploader;

			dojo.connect(this.uploader, 'onChange', function (files) {
				if (uploadHandler) {
					dojo.disconnect(uploadHandler);
				}
				uploadHandler = dojo.connect(uploadBtn, "onClick", this, function(){
					uploader.set("disabled", true);
					this.progress = new ProgressBar({
					}, this.zipWarning);
					uploader.upload();
				});
				if (uploadBtn.oldText) {
					uploadBtn.containerNode.innerText = uploadBtn.oldText;
				}
				var filename = files[0].name,
					isZip = /\.zip$/i.test(filename);
				this.filelist.innerText = isZip ? dojo.replace("Selected: {0}", [filename]) : ""; // FIXME: i18n
				uploadBtn.set("disabled", !isZip);
			}.bind(this));

			var setDone = function(){
				dojo.disconnect(uploadHandler);
				this.onClose();
			}.bind(this);

			dojo.connect(this.uploader, "onProgress", this, function(obj){
				this.progress.set("value", obj.percent);
			});
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
		}
	});
});
