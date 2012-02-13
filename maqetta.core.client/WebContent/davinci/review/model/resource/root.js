define([
	"dojo/_base/declare",
	"davinci/model/resource/Resource",
	"davinci/model/resource/Folder",
	"davinci/Runtime",
	"davinci/Workbench"
], function(declare, Resource, Folder, Runtime, Workbench) {

var root = declare(Resource, {

	constructor: function(args) {
		this.elementType = "ReviewRoot";
		this.name = "root";
		this.parent = null;
	},

	findFile: function(version, fileName) {
		var children;
		var result = null;
		this.getChildren(function(c) { children= c; }, true);
		var node;
		dojo.forEach(children, function(item) {
			if (item.timeStamp == version) {
				node = item;
			}
		});
		if (node != null) {
			node.getChildren(function(c) { children= c; }, true);
			dojo.forEach(children, function(item) {
				if (item.name == fileName) { 
					result = item;
				}
			});
		}
		return result;
	},

	findVersion: function(version) {
		var node;
		dojo.forEach(this.children, function(item) {
			if (item.timeStamp == version) {
				node =item;
			}
		});
		return node;
	},

	getChildren: function(onComplete,sync) {
		if (!this._isLoaded) {
			if (this._loading) {
				this._loading.push(onComplete);
				return;
			}
			this._loading = [];
			this._loading.push(onComplete);
			var designerName = Runtime.commenting_designerName || "";
			var location = Workbench.location().match(/http:\/\/.*:\d+\//);
			/*
			Runtime.serverJSONRequest({
				url:  location + "maqetta/cmd/listVersions",
				content:{'designer':designerName},
				sync:sync,
				load : dojo.hitch(this, function(responseObject, ioArgs) {
					this.children=[];
					for (var i=0; i<responseObject.length; i++) {
						var child = new Folder(dojo.mixin({
							name:responseObject[i].versionTitle,
							parent:this
						},responseObject[i]));
						this.children.push(child);
					}
					this._isLoaded=true;
					dojo.forEach(this._loading,function(item) {
						(item)(this.children);
					},this);
					delete this._loading;
				})
			});
			*/
			return;
		}
		onComplete(this.children);
	},

	getPath: function() {
		return ".review/snapshot";
	}

});

return dojo.setObject("davinci.review.model.resource.root", new root());

});
     
