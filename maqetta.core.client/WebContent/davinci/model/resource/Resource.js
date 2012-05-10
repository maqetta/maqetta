define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/model/Model",
//	"davinci/Workbench",
	"davinci/model/Path"
], function(declare, Runtime, Model, /*Workbench,*/ Path) {

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
		return userWorkspaceUrl + path;
	},

	rename: function(newName) {
		var path = new Path(this.getPath()).removeLastSegments();
		var newPath = path.append(newName);
		var response = Runtime.serverJSONRequest({
			url:"./cmd/rename", 
			handleAs:"text", 
			sync:true,
			content:{'oldName':this.getPath(), 'newName' : newPath.toString()} 
		});
		this.name = newName;
		dojo.publish("/davinci/resource/resourceChanged", ["renamed",this]);
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
		var response="OK";
		if (!localOnly) {
			response = davinci.Runtime.serverJSONRequest({
				url: "cmd/deleteResource", handleAs: "text",
				content: {path: this.getPath()}, sync: true
			});
		}
		if (response == "OK") {
			var found=-1;
			for(var i=0;i<this.parent.children.length && found==-1;i++){
				if(this.parent.children[i].getName()==this.getName())
					found = i;
			}
			
			this.parent.children.splice(found, 1);
			dojo.publish("/davinci/resource/resourceChanged",["deleted",this]);
		} else {
			//TODO: refresh the resource in the tree if it is a dir -- delete may have been partial.
			alert(response);
		}
	}

});
});