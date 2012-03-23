define([
	"dojo/_base/declare",
	"davinci/model/resource/Resource",
	"davinci/review/model/resource/File",
	"davinci/Runtime",
	"davinci/Workbench"
], function(declare, Resource, reviewFile, Runtime, Workbench) {

return declare("davinci.review.model.resource.Folder", Resource, {

	isDraft:false,
	closed: false,
	width:0,
	height:0,

	constructor: function(proc) {
		dojo.mixin(this, proc);
		this.elementType = "ReviewVersion";
		this.dueDate = this.dueDate == "infinite" ? this.dueDate : dojo.date.locale.parse(this.dueDate,{
			selector:'date',
			formatLength:'long',
			datePattern:'MM/dd/yyyy', 
			timePattern:'HH:mm:ss'
		});
	},

	getChildren: function(onComplete, sync) {
		if (!this._isLoaded) {
			if (this._loading) {
				this._loading.push(onComplete);
				return;
			}
			this._loading=[];
			this._loading.push(onComplete);
			var designerName = this.designerId || "";
			var location = Workbench.location().match(/http:\/\/.*:\d+\//);
			Runtime.serverJSONRequest({
				url: location + "maqetta/cmd/listReviewFiles",
				content:{
					'designer':designerName,
					'version':this.timeStamp
				},
				sync:sync,
				load : dojo.hitch(this, function(responseObject, ioArgs) {
					this.children=[];
					for (var i=0; i<responseObject.length; i++) {
						var child = new reviewFile(responseObject[i].path, this);
						this.children.push(child);
					}
					this._isLoaded=true;
					dojo.forEach(this._loading,function(item) {
						(item)(this.children);
					}, this);
					delete this._loading;
				})
			});
			return;
		}
		onComplete(this.children);
	},

	getPath: function() {
		if (this.parent) {
			return this.parent.getPath() + "/" + this.timeStamp;
		}
		return this.timeStamp;
	}

});
});


