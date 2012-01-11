dojo.provide("davinci.ui.widgets.NewFile");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");
dojo.require("dojox.widget.Standby");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.DropDownButton");

dojo.declare("davinci.ui.widgets.NewFile",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewFile.html"),
	treeCollapsed:true,

	fileDialogFileName : null,
	fileTree : null,
	__okButton : null,
	dialogSpecificClass : null,
	_fileDialog : null, 
	
	postMixInProperties : function() {
		var langObj = this.langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.cancel =true;
		this.inherited(arguments);
	},
	
	postCreate : function(){
		this.inherited(arguments);
		dojo.connect(this.fileDialogFileName, "onkeyup", this, '_checkValid');
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._updateFields));
		
		/* set initial value */
		if(!this.value){
			this._setValueAttr(this._getForcedRootAttr());
		}
		this.fileTree.watch("selectedItem", dojo.hitch(this, this._checkValid));
		
		this.arrowNode = this.fileDialogDetailsArrow;
		this.connect(this.arrowNode, 'onclick', dojo.hitch(this,function(e){
			this._tree_collapse_expand(!this.treeCollapsed);
		}));
		this._tree_collapse_expand();
		
		if(this.dialogSpecificClass){
			var c = dojo.getObject(this.dialogSpecificClass);
			this.dialogSpecificWidget = new c({dialogSpecificButtonsSpan:this.dialogSpecificButtonsSpan}, this.dialogSpecificOptionsDiv);
		}
		
		var connectHandle = dojo.connect(this._fileDialog, "onkeypress", this, function(e){
			if(e.charOrCode===dojo.keys.ENTER){
				// XXX HACK This is to circumvent the problem where the Enter key
				//   isn't handled.  Normally, the Dijit Dialog handles that for
				//   us, but our dialog classes are messed up right now.  Hence
				//   this.
				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false,
						false, 0, null);
				this.__okButton._onClick(evt);
			}
		
		});
		this._whereMenu = new dijit.Menu({style: "display: none;"});
		this._whereDropDownButton = new dijit.form.DropDownButton({
			className: "whereDropDown",
            dropDown: this._whereMenu,
			iconClass: "fileDialogWhereIcon"
        });
		this.fileDialogWhereDropDownCell.appendChild(this._whereDropDownButton.domNode);
	},
	
	startup: function(){
		if(this.dialogSpecificWidget && this.dialogSpecificWidget.startup){
			this.dialogSpecificWidget.startup();
		}
	},

	/**
	 * Update this.collapsed to the given value and add/remove classes in DOM tree
	 * @param {boolean} treeCollapsed  New value for treeCollapsed
	 */
	_tree_collapse_expand: function(treeCollapsed){
		if(typeof treeCollapsed != 'undefined'){
			this.treeCollapsed = treeCollapsed;
		}
		var table = dojo.query('.fileFolderTable',this.domNode)[0];
		var folderContainer = dojo.query('.folderContainer',this.domNode)[0];
		var showSpan = dojo.query('.folder_details_show_arrow',this.domNode)[0];
		var hideSpan = dojo.query('.folder_details_hide_arrow',this.domNode)[0];
		if(table){
			if(this.treeCollapsed){
				dojo.addClass(table, 'treeCollapsed');
				dojo.removeClass(table, 'treeExpanded');
				dojo.addClass(folderContainer, 'dijitHidden');
				dojo.removeClass(showSpan, 'dijitHidden');
				dojo.addClass(hideSpan, 'dijitHidden');
			}else{
				dojo.addClass(table, 'treeExpanded');
				dojo.removeClass(table, 'treeCollapsed');
				dojo.removeClass(folderContainer, 'dijitHidden');
				dojo.addClass(showSpan, 'dijitHidden');
				dojo.removeClass(hideSpan, 'dijitHidden');
			}
		}
		this.fileDialogDetailsArrow.title = this.treeCollapsed ? this.langObj.newFileShowFiles : this.langObj.newFileHideFiles;
	},	
	
	_setValueAttr: function(value){
		/* full resource expected */
		if (value==this._value) {
			return;
		}
		this._value = value;
		var path = [];
		for(var i=value; i.parent; i = i.parent) {
			path.unshift(i);
		}
		return this.fileTree.set("path", path);
	},
	
	_setNewFileNameAttr: function(name){
		this.fileDialogFileName.set('value', name);
	},
	
	_getForcedRootAttr: function(){
		
		if(this._forcedRoot) {
			return this._forcedRoot;
		}
		
		var base = davinci.Runtime.getProject();
		var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		
		if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
			var fullPath = new davinci.model.Path(davinci.Runtime.getProject()).append(prefs.webContentFolder);
			
			var folder = system.resource.findResource(fullPath.toString());
			return folder;
		}
		return system.resource.findResource(davinci.Runtime.getProject());
	},
	
	_setForcedRootAttr : function(value){
		this._forcedRoot = value;
	},
	
	_updateFields : function(){
		
		var resources = this.fileTree.get('selectedItems');
		var resource = (resources!=null && resources.length > 0)? resources[0] : null;
		var folderResource;
		var projectNameLength = ("./" + davinci.Runtime.getProject()).length + 1;
		if(resource==null){
			folderResource = this._getForcedRootAttr();
		}else if(resource.elementType=="Folder"){
			folderResource = resource;
		}else{
			this.fileDialogFileName.set( 'value', resource.getName());
			folderResource = resource.parent;
		}
		if(this._whereDropDownButton && this._whereMenu){
			var folderPathString = folderResource.getPath().substring(projectNameLength);
			var folderNameString = folderResource.getName();
			var trimmed = dojo.trim(folderPathString);
			var whereValue = trimmed.length==0 ? this.langObj.root : folderNameString;
	        this._whereDropDownButton.attr( 'label', whereValue);
	        this._whereMenu.attr( 'value', folderPathString);
			this._whereMenu.destroyDescendants();
			var menuItem;
			var done = false;
			var infiniteLoopCheck = 0;	// Just being paranoid about some weird case where done is never true
			do{
				var trimmed = dojo.trim(folderPathString);
				if(trimmed.length == 0){
					done = true;
					folderNameString = this.langObj.root;
				}
				menuItem = new dijit.MenuItem({label: folderNameString, value: folderPathString, onClick:dojo.hitch(this, function(label, value, e){
					this._whereMenu.attr('value', value);
					this._whereDropDownButton.attr( 'label', label);
					var folderPath = new davinci.model.Path(davinci.Runtime.getProject()).append(value);
					var folder = system.resource.findResource(folderPath.toString());
					this.fileTree.set("selectedItems", [folder]);
				}, folderNameString, folderPathString)});
				this._whereMenu.addChild(menuItem);
				if(!done){
					folderResource = folderResource.parent;
					folderPathString = folderResource.getPath().substring(projectNameLength);
					folderNameString = folderResource.getName();
				}
				infiniteLoopCheck++;
			} while(!done && infiniteLoopCheck < 100);
		}
	},
	
	_checkValid: function() {
		// make sure the project name is OK.
		var name = this.fileDialogFileName.get('value'),
			valid = name && name.length > 0,
			folderName = this._whereMenu.attr('value'),
			parent = system.resource.findResource(davinci.Runtime.getProject() + 
					(folderName ? '/' + folderName : '')),
			resource;
		if (parent) {
			valid = valid && !parent.readOnly();
		}
		
		resource = parent.getChild(name);
		if (resource) {
			valid = valid && !resource.readOnly();
		}
		
		this.__okButton.set('disabled', !valid);
		return valid;
	},
	
	_okButton : function(e){

		var fullPath = (new davinci.model.Path(davinci.Runtime.getProject())).append(this._whereMenu.attr('value')).append(this.fileDialogFileName.get( 'value'));

		this.value =  fullPath.toString();
		this.cancel = false;
		this.onClose();
	},
		
	_newFolder : function(){
		var resources = this.fileTree.get('selectedItems');
		var resource = (resources!=null && resources.length > 0)? resources[0] : null;
		
		davinci.ui.Resource.newFolder(resource, dojo.hitch(this,function(newFolder){
			this.fileTree.set("selectedItems", [newFolder]);
		}));
		
	},
	
	_getValueAttr : function(){
		return this.value;
	},
	
	cancelButton: function(){
		this.cancel = true;
		this.onClose();
	},
	
	_createResource : function(){
		var folderName = this._whereMenu.attr('value');
		var fileName = this.fileDialogFileName.get( 'value');
		var resource = system.resource.findResource(folderName + "/" + fileName);
		if(resource) return resource;
		var folder = system.resource.findResource(folderName);
		return folder.createResource(fileName);
	},
	
	onClose : function(){}

});