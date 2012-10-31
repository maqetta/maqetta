define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/promise/all",
        "../Workbench",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/RadioButton",
        "dijit/MenuItem",
        "dijit/Menu",
        "../library",
        "dijit/form/ComboBox",
        "dojo/i18n!./nls/ui",
        "dojo/i18n!dijit/nls/common",
        "../model/Path",
        "system/resource",
        "../ve/RebuildPage",
        "dojo/text!./templates/UserLibraries.html",
        "../Theme"
        
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, all, Workbench, Button, TextBox, RadioButton, MenuItem, Menu, Library, 
			ComboBox, uiNLS, commonNLS, Path, Resource, RebuildPage, templateString, Theme
			){
	
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		postMixInProperties: function() {
			dojo.mixin(this, commonNLS);
			dojo.mixin(this, uiNLS);
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
			    "<table cellspacing='0' cellpadding='0' width='100%'>",
			    "<tr><td class='header'></td><td class='header'>{library}</td><td class='header'>{version}</td><td class='header'>{workspaceLocation}</td></tr>",
				"<tr></tr>"
			];
			this.libraries = {};
			/* build UI table */
			this._allLibs.forEach(function (lib, i) {				
				lib.initRoot = this._getLibRoot(lib.id,lib.version);
				var name = lib.id; // may want to use a better name here eventually
				lib.checked = false;
				
				if(this._getUserLib(lib.id, lib.version)){
					lib.checked = true;
				}
				var rowCss = "";
				var checkedString = lib.checked || lib.required ? "checked" : "";
				if(lib.required){
					uiArray.push("<tr style='display:none'>");
				}else{
					uiArray.push("<tr>");
				}
				uiArray.push("<td class='columna'><input type='checkbox' libItemCheck='"+ i +"'"+ checkedString +"></input></td>");
				
				uiArray.push("<td class='columnb'>" + name + "</td>");
				uiArray.push("<td class='columnc'>" + lib.version + "</td>");
				
				if(lib.initRoot){
					uiArray.push("<td class='columnd'><input type='text' value='" + lib.initRoot + "' libItemPath='"+i+ "'></input></td>");
				}else{
					uiArray.push("<td class='columnd'></td>");
				}
				uiArray.push("</tr>");
			}, this);
			uiArray.push("</table>");
			var html = dojo.replace(uiArray.join(""), uiNLS);
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
			var libRoot;
			if (!this._userLibs.some(function (lib) {
				if(lib.id == id && lib.version == version) {
					libRoot = lib.root;
					return true;
				}
			})) {
				this._allLibs.some(function (lib) {
					if(lib.id == id && lib.version == version) {
						libRoot = lib.root;
						return true;
					}
				});
			}
			return libRoot;
		},
		
		_getUserLib: function(id,version){
			return this._userLibs.some(function (lib) {
				return lib.id == id && lib.version == version;
			});
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
//					/* check parent */
// unused?			var baseDirectory = new Path(values[i].base).append(values[i].oldPath).removeLastSegments(1);
					var basePath = new Path(values[i].base);
					var found = resourceChanges.some(function(path) {
						return path.equals(basePath);
					});
					if(!found) {
						resourceChanges.push(basePath);
					}
				}

				dojo.subscribe("/davinci/ui/libraryChanged", this, function(){			
					Resource.findResourceAsync("*.html", true, this.getResourceBase(), true).then(function(pages){
						var pageBuilder = new RebuildPage(),
							promises = [];
						pages.forEach(function(page) {
							/* don't process theme editor pages */
							if(Theme.isThemeHTML(page)) {
								return;
							}
							
							promises.push(pageBuilder.rebuildSource(page.getContentSync(), page).then(function(newSource) {
								page.setContents(newSource, false);								
							}));
						});
						all(promises).then(function() {
							this.onClose();
						});
					}.bind(this));
				});

				resourceChanges.forEach(function (path) {
					var loc = path.toString();
					Resource.resourceChanged("reload", loc);
					Library.themesChanged(loc);
				});
				
				// this event will trigger a "/davinci/ui/libraryChanged" event and run the code above
				dojo.publish("/davinci/ui/libraryChanged/start");
			}
		},

		_processChanges: function(){
			var changes = [];
			function searchM (id,version){
				for(var i=0;i<changes.length;i++){
					if(changes[i].id == id && changes[i].version == version) {
						return changes[i];
					}
				}
			}
			dojo.query("[libItemCheck]", this.domNode).forEach(function (node) {
				var element = parseInt(dojo.attr(node, "libItemCheck")),
					value = dojo.attr(node, "checked"),
					lib = this._allLibs[element];
				if(lib.checked != value){
					//this._updateInstall(this._allLibs[element], value);
					var item = searchM(lib.id, lib.version);
					if(!item){
						item = {id: lib.id, version: lib.version};
						changes.push(item);
					}
					item.installed = value;
					item.base = this.getResourceBase();
				}
			}, this);
			dojo.query("[libItemPath]", this.domNode).forEach(function (node) {
				var element = parseInt(dojo.attr(node, "libItemPath")),
					value = dojo.attr(node, "value"),
					lib = this._allLibs[element];
				if(lib.initRoot != value){
					//this._updateInstall(this._allLibs[element], value);
					var item = searchM(lib.id, lib.version);
					if(!item){
						item = {id: lib.id, version: lib.version};
						changes.push(item);
					}
					item.path = value;
					item.oldPath = lib.initRoot;
					item.base = this.getResourceBase();
				}
			}, this);
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


