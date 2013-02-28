define([
	"dojo/_base/declare",
	"dojo/_base/xhr",
	"dojo/_base/connect",
	"dojo/Deferred",
	"davinci/Runtime",
	"davinci/model/Model",
	"davinci/model/Path"
], function(declare, xhr, connect, Deferred, Runtime, Model, Path) {

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
		this._id = dijit.getUniqueId("maqFileResource");
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
		return  userWorkspaceUrl + path;
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
		return !!this.libraryId;
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
		var promise,
			modifyModel = function(){
				var name = this.getName();
				this.parent.children.some(function(child, i, children) {
					if(child.getName() == name) {
						children.splice(i, 1);
						return true;
					}				
				});
	
				connect.publish("/davinci/resource/resourceChanged", ["deleted", this]);
			}.bind(this);

		if (localOnly) {
			promise = new Deferred();
			modifyModel();
			promise.resolve();
		} else {
			promise = xhr.get({
				url: "cmd/deleteResource",
				handleAs: "text",
				content: {path: this.getPath()}
			}).then(
				modifyModel,
				function(){
					//TODO: refresh the resource in the tree if it is a dir -- delete may have been partial.
				}
			);
		}
		return promise;
	},

	getId: function() {
		return this._id;
	}
});
});