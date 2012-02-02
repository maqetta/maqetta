define(["system/Orion"

 ],function(Orion){
	

	return declare("system.model.Folder", null,{

		/**  
		 * @class davinci.model.resource.Resource
		 * @constructor 
		 * @extends davinci.model.Model
		 */
		constructor: function(name, parent) {
			this.elementType = "Folder";
			this.name = name;
			this.parent = parent;
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
			while(path.indexOf(".") == 0 || path.indexOf("/") == 0) {
				path = path.substring(1, path.length);
			}
			var loc = davinci.Workbench.location();;
			if (loc.charAt(loc.length-1) == '/') {
				loc = loc.substring(0,loc.length-1);
			}
			return loc + '/user/' + Runtime.userName + '/ws/workspace/' + path;
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

		getChildren: function(onComplete, sync) {
			if (!this._isLoaded) {
				if (this._loading) {
					this._loading.push(onComplete);
					return;
				}
				this._loading=[];
				this._loading.push(onComplete);
				this.children = Orion.listFiles(this.name + "/*", onComplete)
				return;
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
				var i = this.parent.children.indexOf(this);
				this.parent.children.splice(i, 1);
				dojo.publish("/davinci/resource/resourceChanged",["deleted",this]);
			} else {
				//TODO: refresh the resource in the tree if it is a dir -- delete may have been partial.
				alert(response);
			}
		}

	});


});