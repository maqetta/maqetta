dojo.provide("davinci.ui.UserLibraries");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");

dojo.require("davinci.library");
dojo.require("davinci.ve.RebuildPage");

dojo.declare("davinci.ui.UserLibraries",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/UserLibraries.html"),
	widgetsInTemplate: true,
	
	/* templated attach points, custom input section */
	
	/* check box for rewrite dojo */
	_tableDiv : null,

	buildRendering : function(){
		this.inherited(arguments);
		this._handles = [];
		this._allLibs = davinci.library.getInstalledLibs();
		this._userLibs = davinci.library.getUserLibs();
		var uiArray = [];
		
		uiArray.push("<table cellspacing='0' cellpadding='0' width='100%'><tr><td class='header'></td><td class='header'>Library</td><td class='header'>Version</td><td class='header'>Workspace Location</td></tr>");
		uiArray.push("<tr></tr>");
		this.libraries = {};
		/* build UI table */
		for(var i =0;i<this._allLibs.length;i++){
			this._allLibs[i].initRoot = this._getLibRoot(this._allLibs[i]['id'],this._allLibs[i]['version']);
			var name = this._allLibs[i]['id']; // may want to use a better name here eventually
			this._allLibs[i].checked = false;
			
			if(this._getUserLib(this._allLibs[i]['id'],this._allLibs[i]['version'])!=null){
				this._allLibs[i].checked = true;
			}
			var checkedString = this._allLibs[i].checked?"checked":"";
			uiArray.push("<tr>");
			uiArray.push("<td class='columna'><input type='checkbox' libItemCheck='"+ i +"'"+ checkedString +"></input></td>");
			uiArray.push("<td class='columnb'>" + name + "</td>");
			uiArray.push("<td class='columnc'>" + this._allLibs[i]['version'] + "</td>");
			uiArray.push("<td class='columnd'><input type='text' value='" + this._allLibs[i].initRoot + "' libItemPath='"+i+ "'></input></td>");
			
			uiArray.push("</tr>");
			
		}
		uiArray.push("</table>");
		var html =  uiArray.join("");
		dojo.place(html, this._tableDiv);
	
	},

	_getLibRoot: function( id, version){
		return this._getUserLib(id,version) || this._getGlobalLib(id,version);
	},
	
	_getGlobalLib: function( id, version){
		
		for(var i=0;i<this._allLibs.length;i++){
			if(this._allLibs[i].id==id && this._allLibs[i].version==version)
				return this._allLibs[i]['root'];
		}
		return null;
	},
	_destroy: function(){
		var containerNode = this.domNode;
		dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
			w.destroy();
		});
		while(containerNode.firstChild){
			dojo._destroyElement(containerNode.firstChild);
		}
		this.topDiv = dojo.doc.createElement("div");
		this.container.appendChild(this.topDiv);
		dojo.forEach(this._handles,dojo.disconnect);
		this._handles = [];
	},
	
	_getUserLib:function(id,version){
		for(var i=0;i<this._userLibs.length;i++){
			if(this._userLibs[i].id==id && this._userLibs[i].version==version)
				return this._userLibs[i]['root'];
		}
		
	},
	_makeChange : function(values){
		
		if(values.length){
			var isOk = davinci.library.modifyLib(values);
			davinci.resource.resourceChanged("updated", davinci.resource.getRoot());
			dojo.publish("/davinci/ui/libraryChanged");
		}
		
		var pages = davinci.resource.findResource("*.html", true, null, true);
		
		var pageBuilder = new davinci.ve.RebuildPage();
		for(var i=0;i<pages.length;i++){
			var newSource = pageBuilder.rebuildSource(pages[i].getContents(), pages[i]);
			pages[i].setContents(newSource, false);
		}
		this.onClose();
	},
	_processChanges : function(){
		
		var changes = [];
		function searchM (id,version){
			for(var i=0;i<changes.length;i++){
				if(changes[i].id == id && changes[i].version == version)
					return changes[i];
			}
		}
		var nodeList = dojo.query("[libItemCheck]", this.domNode );
		for(var i =0;i<nodeList.length;i++){
			var element = parseInt(dojo.attr(nodeList[i], "libItemCheck"));
			var value = dojo.attr(nodeList[i], "checked");
			if(this._allLibs[element]['checked']!= value){
				//this._updateInstall(this._allLibs[element], value);
				
				var item = searchM(this._allLibs[element]['id'],this._allLibs[element]['version'])
				if(!item){
					item = {id:this._allLibs[element]['id'], version:this._allLibs[element]['version']};
					changes.push(item);
				}
				item.installed = value;
			}
		
		}
		nodeList = dojo.query("[libItemPath]", this.domNode );
		for(var i =0;i<nodeList.length;i++){
			var element = parseInt(dojo.attr(nodeList[i], "libItemPath"));
			var value = dojo.attr(nodeList[i], "value");
			if(this._allLibs[element]['initRoot']!= value){
				//this._updateInstall(this._allLibs[element], value);
				
				var item = searchM(this._allLibs[element]['id'],this._allLibs[element]['version'])
				if(!item){
					item = {id:this._allLibs[element]['id'], version:this._allLibs[element]['version']};
					changes.push(item);
				}
				item.path = value;
				item.oldPath = this._allLibs[element]['initRoot'];
			}
		
		}
		this._makeChange(changes);
	},

	okButton : function(){
		this._processChanges();
		this.onClose();
	},
	cancelButton : function(){
		
		this.onClose();
	},
	_rewriteDojo : function(){
		
		var checked = dojo.attr(this.__rewriteDojo, "checked");
		dojo.attr(this.__rewriteDojoURL, "disabled", !checked);
		
	}
	

});