dojo.provide("davinci.ui.widgets.ThemeSelection");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.ThemeStore");

dojo.declare("davinci.ui.widgets.ThemeSelection", [dijit._Widget], {
	
	workspaceOnly : true,
	message: 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.',

	buildRendering: function(){
		this._themeData = [];
		var themes = davinci.resource.findResource("*.theme",true,"./themes",this.workspaceOnly);
		this._themeCount = themes.length;
		var div = dojo.doc.createElement("div");
		this._select = dojo.doc.createElement("select");
		for (var i = 0; i < themes.length; i++){
			var contents = themes[i].getText();
			var t = eval(contents);
			t.file = themes[i];
			this._themeData.push(t);
			var op = dojo.doc.createElement("option");
			op.value = t.className;
			op.text = t.className;
			this._select.appendChild(op);
			
		}
		
		div.appendChild(this._select);
		this._warnDiv = dojo.doc.createElement("div");
		this._warnDiv.innerHTML = '<table>' + 
								'<tr><td></td><td>'+this.message+'</td><td></td></tr>'+
								'<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.ok">Ok</button><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.cancel">Cancel</button></td><td></td></tr>'+
							'</table>';
		div.appendChild(this._warnDiv);
		this.domNode = div;
		dojo.style(this._warnDiv, "display","none");
		dojo.style(this._select, "width","180px");
		dojo.style(this.domNode, "width","100%");
		dojo.connect(this._select, "onchange", this, "_onChange");
	},
	
	
	_getNumberOfThemesAttr : function(){
		return this._themeCount;
	},
	
	_setValueAttr : function(value){
		var selection = value;
		if(value && value.className){
			selection = value.className; 
		}
		var found = false;
		for(var i=0;i<this._select.children.length;i++){
			if(this._select.children[i].selected)
				this._select.children[i].selected = false;
			
			if(!found && this._select.children[i].value==selection){
				this._select.children[i].selected = true;
				var found = true;
			}
		}
		
		if(!found && selection!=null){
			var op = dojo.doc.createElement("option");
			op.value = selection;
			op.text = selection;
			op.selected = true;
			this._select.appendChild(op);	
		}
	},
	_getValueAttr : function(){
		var className = dojo.attr(this._select, "value");
		
		for(var i=0;i<this._themeData.length;i++){
			if(this._themeData[i]['className'] == className )
				return this._themeData[i];
			
		}
			
		return null;
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
		if (currentValue.version !== this.dojoVersion && !warnCookie){
			dojo.style(this._warnDiv, "display", "block");
			var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
			var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
			dojo.connect(ok, "onClick", this, "_warnOk");
			dojo.connect(cancel, "onClick", this, "_warnCancel");
			
			
		} else {
			this._destroy();
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