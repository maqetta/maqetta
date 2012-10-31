define(["dojo/_base/declare",
        "dijit/_Widget",
        "davinci/library",
        "davinci/Runtime",
        "davinci/Workbench",
        "system/resource",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common"
  ],function(declare, _Widget, Library,Runtime, Workbench, Resource,uiNLS, commonNLS){
	return declare("davinci.ui.widgets.ThemeSelection", [_Widget], {
	    
	    workspaceOnly : true,
	    message: 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.',
	    
	    /* setup basic DOM */
	    buildRendering: function(){
	        var div = dojo.doc.createElement("div");
	        this._select = dojo.doc.createElement("select");
	        div.appendChild(this._select);
	        this._warnDiv = dojo.doc.createElement("div");
	        div.appendChild(this._warnDiv);
	        this.domNode = div;
	        dojo.style(this._select, "width","180px");
	        dojo.style(this.domNode, "width","100%");
	        dojo.connect(this._select, "onchange", this, "_onChange");
	    },
	
	    /* populate the theme selection, depends on the "workspaceOnly" attribute being set post create */
	    postCreate : function(){
	    	
	        this._themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
	        this._themeCount = this._themeData.length;
	        for (var i = 0; i < this._themeData.length; i++){
	            var op = dojo.doc.createElement("option");
	            op.value =this._themeData[i].name;
	            op.text = this._themeData[i].name;
	            this._select.appendChild(op);
	            
	        }
	        if(this._selection)
	            this._selectValue(this._selection);
	    },
	    
	    _setBaseAttr : function(base){
	        this._base = base;
	    },
	    
	    _getBaseAttr : function(){
	        return this._base;
	    },
	    
	    _getNumberOfThemesAttr : function(){
	        return this._themeCount;
	    },
	    
	    _setValueAttr : function(value){

	    	if(!this._hasValue(value)) return;
	    	
	        this._selection = value;
	        if(value && value.name){
	            this._selection = value.name; 
	        }
	        this._selectValue(this._selection);
	    },
	    
	    _hasValue : function(themeName){
	        
	        for(var i=0;i<this._select.children.length;i++){
	            if(this._select.children[i].value==themeName){
	                return true;
	            }
	        }
	        return false;
	    },
	    
	    _selectValue : function(value){
	        
	        var found = false;
	        for(var i=0;i<this._select.children.length;i++){
	            if(this._select.children[i].selected)
	                this._select.children[i].selected = false;
	            
	            if(!found && this._select.children[i].value==value){
	                this._select.children[i].selected = true;
	                var found = true;
	            }
	        }
	        
	        if(!found && value!=null){
	            var op = dojo.doc.createElement("option");
	            op.value = value;
	            op.text = value;
	            op.selected = true;
	            this._select.appendChild(op);   
	        }
	    },
	    _getValueAttr : function(){
	        var name = dojo.attr(this._select, "value");
	        
	        for(var i=0;i<this._themeData.length;i++){
	            if(this._themeData[i]['name'] == name )
	                return this._themeData[i];
	            
	        }
	            
	        return null;
	    },
	    
	    _setWorkspaceOnlyAttr : function(value){
	        this.workspaceOnly = value;
	    },
	    
	    onChange : function(){
	        
	    },
	    
	    _onChange :function(){
	        
	        var currentValue = this._getValueAttr();
	        if( currentValue==null  ||  this._blockChange)
	            return;
	        this.value = currentValue;
	        this._cookieName = 'maqetta_'+currentValue.name+'_'+currentValue.version;
	        var warnCookie = dojo.cookie(this._cookieName);
	        if (this.dojoVersion && currentValue.version !== this.dojoVersion && !warnCookie){
	            this._warnDiv.innerHTML = '<table>' + 
	                                            '<tr><td></td><td>'+this.message+'</td><td></td></tr>'+
	                                             '<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.ok">Ok</button><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.cancel">Cancel</button></td><td></td></tr>'+
	                                       '</table>';
	            var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
	            var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
	            dojo.connect(ok, "onClick", this, "_warnOk");
	            dojo.connect(cancel, "onClick", this, "_warnCancel");
	            
	            
	        } else {
	            this.onChange();
	        }
	        
	        
	        
	    },
	    _getThemeDataAttr : function(){
	        return this._themeData;
	    },
	    
	    _warnOk: function(){
	        dojo.cookie(this._cookieName, "true");
	        this._destroy();
	        this.onChange();
	        
	    },
	    
	    _warnCancel: function(){
	        this._destroy();
	        this.onClose();
	        
	    },
	    
	    _destroy: function(){
	        var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
	        dojo.disconnect(ok);
	        ok.destroy();
	        var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
	        dojo.disconnect(cancel);
	        cancel.destroy();
	    }
	    
	    
	});

});