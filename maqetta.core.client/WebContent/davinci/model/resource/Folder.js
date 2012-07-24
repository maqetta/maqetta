 /**  
  * @class davinci.model.resource.Folder
    * @constructor 
    * @extends davinci.model.resource.Resource
  */
define([
	"dojo/_base/declare",
	"dojo/_base/xhr",
	"davinci/Runtime", // TODO: remove this
	"davinci/model/resource/Resource",
	"davinci/model/resource/File"
], function(declare, xhr, Runtime, Resource, File) {

var Folder = declare(Resource, {

	constructor: function(name, parent) {
		this.elementType = "Folder";
		this.name = name;
		this.parent = parent;
	},

	reload: function(){
		// mark this folder as dirty and reload it next time
		this._isLoaded = false;
	},

	createResource: function(name, isFolder, localOnly) {
		var file;
		if (name != null) {
			file = isFolder ? new Folder(name, this) : new File(name, this);
		} else {
			file = this;
			isFolder = this.elementType == "Folder";
		}
		var response = localOnly ?
			"OK" :
			Runtime.serverJSONRequest({
				url: "cmd/createResource",
				handleAs: "text",
				content: {path: file.getPath(), isFolder: isFolder},
				sync:true
			});
		if (response == "OK" && name != null) {
			this.children.push(file);
			delete file.libraryId;
			delete file.libVersion;
			delete file._readOnly;
			dojo.publish("/davinci/resource/resourceChanged", ["created", file]);
			return file;
		}else if(response=="EXISTS"){
			/* resource already exists on server, so just be gracefull about it. */
			this.children.push(file);
			delete file.libraryId;
			delete file.libVersion;
			delete file._readOnly;
			dojo.publish("/davinci/resource/resourceChanged", ["created", file]);
			return file;
		}else if (response != "OK"){
			throw "Folder.createResource failed: name=" + name + "response=" + response;
//				alert("ALERT1"+response);
		} else {
			delete file.libraryId;
			delete file.libVersion;
			delete file._readOnly;
			return this;
		}
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
				this._loading = xhr.get({
					url: "cmd/listFiles",
					content: {path: this.getPath()},
					sync: false,
					handleAs: "json"
				}).then(
					function(responseObject){
						this.setChildren(responseObject);
						this._isLoaded = true;
						onComplete.call(null, this.children);
						delete this._loading;
					}.bind(this),
					onError);
			}
		}
	},

	// deprecated
	getChildrenSync: function(onComplete, sync) {
//		console.log("Folder.getChildrenSync is deprecated");
		if (!this._isLoaded) {
			if (this._loadingCallbacks) {
				this._loadingCallbacks.push(onComplete);
				return;
			}
			this._loadingCallbacks=[];
			this._loadingCallbacks.push(onComplete);
			Runtime.serverJSONRequest({
				url: "cmd/listFiles",
				content: {path: this.getPath()},
				sync: sync,
				load: dojo.hitch(this, function(responseObject, ioArgs) {
					this.setChildrenSync(responseObject);
					dojo.forEach(this._loadingCallbacks,function(item) {
						(item)(this.children);
					}, this);
					delete this._loadingCallbacks;
				})
			});
			return;
		}
		onComplete(this.children);
	},

	setChildren: function(responseObject) {
		this.children = [];
		this._appendFiles(responseObject);
	},

	// deprecated
	setChildrenSync: function(responseObject) {
		this.children = [];
		this._appendFiles(responseObject, true);
	},

	_appendFiles: function(responseObject, sync){
		responseObject.forEach(function(item){
			var child = sync ? this.getChildSync(item.name) : this._getChild(item.name);
			var hasChild = child != null;

			if (item.isDir || item.isLib) {
				if(!hasChild) {
					child = new Folder(item.name,this);
				}
				if (item.isLib) {
					child.isLibrary = true;
				}
			} else {
				if(!hasChild) {
					child = new File(item.name,this);
				}
			}
			child.link = item.link;
			child.isNew = item.isNew;
			child._readOnly = item.readOnly;
			child.setDirty(item.isDirty);
			if(item.libraryId){
				child.libraryId = item.libraryId;
				child.libVersion = item.libVersion;
			}
			if(!hasChild) {
				this.children.push(child);
			}
		}, this);
		this._isLoaded = true;
	},

	getMarkers: function(markerTypes,allChildren) {
		var result = [];
		this.visit({visit: function (resource) {
			if (resource.elementType=="File") {
				markers = resource.getMarkers(markerTypes);
				result.concat(markers);
			} else if (!allChildren) {
				return true;
			}
		}}, true);
		return result;
	},

	// deprecated
	getChildSync: function(name) {
//		console.log("Folder.getChildSync is deprecated sync=" + !this._isLoaded);
		if(!this._isLoaded || (this.children.length < 1)) {
			/*
			 * Force a reload of the folder, if we are asking for a child but there are no childeren 
			 * we may have problem.
			 * This is an attempt to fix issue #2635 
			 */
			this._isLoaded = false;
			this.getChildrenSync(function(item) { this.children = item; }, true);
		}
		return this._getChild(name);
	},

	// assumes children have already been retrieved
	_getChild: function(name){
		if (!this.__CASE_SENSITIVE) {
			name = name.toLowerCase();
		}

		var result;
		this.children.some(function(child){
			var childName = child.getName();
			if (!this.__CASE_SENSITIVE) {
				childName = childName.toLowerCase();
			}

			var match = childName == name;
			if (match) {
				result = child;
			}

			return match;
		});

		return result;
	}

});

davinci.model.resource.root = new Folder(".", null);
return Folder;

});
  
