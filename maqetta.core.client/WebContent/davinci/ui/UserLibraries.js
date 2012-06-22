define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/Workbench",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/MenuItem",
        "dijit/Menu",
        "davinci/library",
        "dijit/form/ComboBox",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "davinci/model/Path",
        "system/resource",
        "davinci/ve/RebuildPage",
        "dojo/text!./templates/UserLibraries.html",
        "davinci/Theme"
        
], function(declare, _Templated, _Widget, Workbench, Button, TextBox, RadioButton, MenuItem, Menu, Library, 
			ComboBox, uiNLS, commonNLS, Path, Resource, RebuildPage, templateString, Theme
			){
	
	return declare("davinci.ui.UserLibraries", [_Widget, _Templated], {
		
		widgetsInTemplate: true,

		uiNLS: uiNLS,

		postMixInProperties: function() {
			dojo.mixin(this, commonNLS);
			this.inherited(arguments);
		},
		
		/* templated attach points, custom input section */
		
		/* check box for rewrite dojo */
		_tableDiv: null,

		templateString: templateString,
		
		buildRendering: function(){
			this.inherited(arguments);
			this._handles = [];
			this._allLibs = Library.getInstalledLibs();
			this._userLibs = Library.getUserLibs(this.getResourceBase());
			var uiArray = [
			    "<table cellspacing='0' cellpadding='0' width='100%'><tr><td class='header'></td><td class='header'>"+uiNLS.library+"</td><td class='header'>"+uiNLS.version+"</td><td class='header'>"+uiNLS.workspaceLocation+"</td></tr>",
				"<tr></tr>"
			];
			this.libraries = {};
			/* build UI table */
			for(var i =0;i<this._allLibs.length;i++){
				this._allLibs[i].initRoot = this._getLibRoot(this._allLibs[i].id,this._allLibs[i].version);
				var name = this._allLibs[i].id; // may want to use a better name here eventually
				this._allLibs[i].checked = false;
				
				if(this._getUserLib(this._allLibs[i].id,this._allLibs[i].version)!=null){
					this._allLibs[i].checked = true;
				}
				var checkedString = this._allLibs[i].checked?"checked":"";
				uiArray.push("<tr>");
				uiArray.push("<td class='columna'><input type='checkbox' libItemCheck='"+ i +"'"+ checkedString +"></input></td>");
				uiArray.push("<td class='columnb'>" + name + "</td>");
				uiArray.push("<td class='columnc'>" + this._allLibs[i].version + "</td>");
				
				if(this._allLibs[i].initRoot!=null){
					uiArray.push("<td class='columnd'><input type='text' value='" + this._allLibs[i].initRoot + "' libItemPath='"+i+ "'></input></td>");
				}else{
					uiArray.push("<td class='columnd'></td>");
				}
				uiArray.push("</tr>");
				
			}
			uiArray.push("</table>");
			var html =  uiArray.join("");
			dojo.place(html, this._tableDiv);
		
		},
		/* returns the base resource for this change (folder)
		 * this is essentially the 'project', since any settings applied to a root
		 * folder cascade to its children.
		 * 
		 *  
		 */
		getResourceBase: function(){
			// returns the base folder for this change.
			
			if(Workbench.singleProjectMode()) {
				return Resource.getRoot().getName();
			}
		},

		_getGlobalLib: function( id, version){
			for(var i=0;i<this._allLibs.length;i++){
				if(this._allLibs[i].id==id && this._allLibs[i].version==version) {
					return this._allLibs[i].root;
				}
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
		
		_getLibRoot: function(id,version){
			for(var i=0;i<this._userLibs.length;i++){
				if(this._userLibs[i].id==id && this._userLibs[i].version==version)
					return this._userLibs[i].root;
			}
			return this._getGlobalLib(id,version);
		},
		
		_getUserLib: function(id,version){
			for(var i=0;i<this._userLibs.length;i++){
				if(this._userLibs[i].id==id && this._userLibs[i].version==version)
					return true;
			}
			
		},
		_makeChange: function(values){
			if(values.length){
				var isOk = Library.modifyLib(values);
				
				var resourceChanges = [];
				/* compile a list of parent directories that may have changed from the library change 
				 * 
				 * Need to scan for 3 areas for resource notification
				 * 1) parent directory of change
				 * 2) original directory of change
				 * 3) new directory
				 * 
				 * */
				for(var i=0;i<values.length;i++){
					/* check parent */
					var baseDirectory = (new Path(values[i].base).append(values[i].oldPath)).removeLastSegments(1);
					var found = false
					var basePath = new Path(values[i].base);
					for(var j=0;j<resourceChanges.length && !found;j++){
						if(resourceChanges[j].equals(basePath)) {
							found = true;
						}
					}
					if(!found) {
						resourceChanges.push(basePath);
					}
				}

				dojo.subscribe("/davinci/ui/libraryChanged", this, function(){			
					var pages = Resource.findResource("*.html", true, this.getResourceBase(), true);
					var pageBuilder = new RebuildPage();
					
					for(var i=0;i<pages.length;i++){
						/* dont process theme editor pages */
						if(Theme.isThemeHTML(pages[i])) {
							continue;
						}
						
						var newSource = pageBuilder.rebuildSource(pages[i].getText(), pages[i]);
						pages[i].setContents(newSource, false);
					}
					this.onClose();
				});

				for(var i=0;i<resourceChanges.length;i++){
					Resource.resourceChanged("reload", resourceChanges[i].toString());
					Library.themesChanged(resourceChanges[i].toString());
				}
				
				// this event will trigger a "/davinci/ui/libraryChanged" event and run the code above
				dojo.publish("/davinci/ui/libraryChanged/start");
			}
		},

		_processChanges: function(){
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
				if(this._allLibs[element].checked != value){
					//this._updateInstall(this._allLibs[element], value);
					
					var item = searchM(this._allLibs[element].id,this._allLibs[element].version)
					if(!item){
						item = {id:this._allLibs[element].id, version:this._allLibs[element].version};
						changes.push(item);
					}
					item.installed = value;
					item.base = this.getResourceBase();
				}
			
			}
			nodeList = dojo.query("[libItemPath]", this.domNode );
			for(var i =0;i<nodeList.length;i++){
				
				var element = parseInt(dojo.attr(nodeList[i], "libItemPath"));
				var value = dojo.attr(nodeList[i], "value");
				if(this._allLibs[element].initRoot != value){
					//this._updateInstall(this._allLibs[element], value);
					
					var item = searchM(this._allLibs[element].id,this._allLibs[element].version)
					if(!item){
						item = {id:this._allLibs[element].id, version:this._allLibs[element].version};
						changes.push(item);
					}
					item.path = value;
					item.oldPath = this._allLibs[element].initRoot;
					item.base = this.getResourceBase();
				}
			}
			this._makeChange(changes);
		},

		okButton: function(){
			this._processChanges();
		},
		cancelButton: function(){
			this.onClose();
		},
		_rewriteDojo: function(){
			var checked = dojo.attr(this.__rewriteDojo, "checked");
			dojo.attr(this.__rewriteDojoURL, "disabled", !checked);
		}
	});
});


