define([
	"dojo/_base/declare",
	"dojo/_base/xhr",
	"dojo/_base/connect",
	"davinci/Runtime",
	"davinci/model/Model",
//	"davinci/Workbench",
	"davinci/model/Path",
	"davinci/ve/utils/URLRewrite"
], function(declare, xhr, connect, Runtime, Model, /*Workbench,*/ Path, URLRewrite) {

return declare("davinci.model.resource.Resource", Model, {

	/**  
	 * @class davinci.model.resource.Resource
	 * @constructor 
	 * @extends davinci.model.Model
	 */
	constructor: function() {
		this.elementType = "Resource";
		this.name = "";
		this.parent = null;
	},

	getName: function() {
		return this.name;
	},

	getPath: function() {
		if (this.parent) {
			return this.parent.getPath() + "/" + this.name;
		}
		return this.name;
	},

	readOnly: function() {
		if (this.hasOwnProperty("_readOnly")) {
			return this._readOnly || (this.parent != null && this.parent.readOnly());
		}
		if( this.parent) {
			return this.parent.readOnly();
		}
		return false;
	},

	getURL: function() {
		
		var path = this.getPath();
		if(path.indexOf("./") == 0 ) {
			path = path.substring(2, path.length);
		}
		var userWorkspaceUrl = Runtime.getUserWorkspaceUrl();
		
		/* need a special flavor or URI Rewrite to encode files with # */
		return  URLRewrite.encodeURI(userWorkspaceUrl + path);
	},

	rename: function(newName) {
		var newPath = new Path(this.getPath()).removeLastSegments().append(newName);
		return xhr.get({
			url: "cmd/rename", 
			handleAs: "text", 
			content: {oldName: this.getPath(), newName: newPath.toString()} 
		}).then(function() {
			this.name = newName;
			connect.publish("/davinci/resource/resourceChanged", ["renamed", this]);
		}.bind(this));
	},

	getParentFolder: function() {
		if (this.elementType == "File") {
			return this.parent;
		}
		return this;
	},

	isVirtual: function() {
		return (this.libraryId != null);
	},

	visit: function(visitor, dontLoad) {
		var dontVisitChildren = visitor.visit(this);
		if (!this._isLoaded && this.elementType == "Folder" && !dontLoad) {
			this.getChildren(dojo.hitch(this, function() { 
				dojo.forEach(this.children, function(child) { child.visit(visitor,dontLoad); });
			}));
		} else if (this.children && !dontVisitChildren) {
			dojo.forEach(this.children, function(child) {
				child.visit(visitor, dontLoad);
			});
		}
	},

	deleteResource: function(localOnly) {
		if (localOnly) {
			var found = -1,
				dfd = new Deferred(),
				children = this.parent.children;
			children.some(function(child) {
				if(child.getName()==this.getName()) {
					found = i;
				}				
			}, this);

			if (found == -1) {
				dfd.reject();
			} else {
				children.splice(found, 1);
				dojo.publish("/davinci/resource/resourceChanged", ["deleted", this]);
				dfd.accept();
			}
			return dfd;
		}
		return xhr.get({
			url: "cmd/deleteResource",
			handleAs: "text",
			content: {path: this.getPath()}
		});
	}

});
});