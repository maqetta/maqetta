define([
	"dojo/_base/declare",
	"davinci/model/resource/Resource",
	"davinci/review/model/resource/File",
	"dojo/_base/xhr",
	"dojo/date/stamp"
], function(declare, Resource, reviewFile, xhr, stamp) {

return declare("davinci.review.model.resource.Folder", Resource, {

	isDraft: false,
	closed: false,
	width: 0,
	height: 0,

	constructor: function(proc) {
		dojo.mixin(this, proc);
		this.elementType = "ReviewVersion";
		this.dueDate = this.dueDate == "infinite" ? this.dueDate : stamp.fromISOString(this.dueDate);
	},

	//deprecated
	getChildrenSync: function(onComplete, sync) {
		this.getChildren(onComplete);
	},

	getChildren: function(onComplete, onError) {
		if (this._isLoaded) {
			onComplete.call(null, this.children);
		} else {
			if (this._loading) {
				this._loading.then(
					function(){ onComplete.call(null, this.children); }.bind(this),
					onError);
			} else {
				var designerName = this.designerId || "";
				this._loading = xhr.get({
					url: "cmd/listReviewFiles",
					handleAs: "json",
					content: {
						designer: designerName,
						version: this.timeStamp
					}
				}).then(function(responseObject, ioArgs) {
					this.children = responseObject.map(function(file){
						return new reviewFile(file.path, this);
					}, this);
					this._isLoaded=true;
					onComplete.call(null, this.children);
					delete this._loading;
				}.bind(this),
				onError);
			}
		}
	},
	
	getPath: function() {
		if (this.parent) {
			return this.parent.getPath() + "/" + this.timeStamp;
		}
		return this.timeStamp;
	}
});
});


