dojo.provide("davinci.ui.widgets.ThemeSelection");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.ThemeStore");

dojo.declare("davinci.ui.widgets.ThemeSelection", [dijit._Widget], {
	
	workspaceOnly : true,
	

	buildRendering: function(){
		this._themeData = [];
		var themes = davinci.resource.findResource("*.theme",true,"./themes",this.workspaceOnly);
		this._themeCount = themes.length;
		this._select = dojo.doc.createElement("select");
		for (var i = 0; i < themes.length; i++){
			var contents = themes[i].getContents();
			var t = eval(contents);
			t.file = themes[i];
			this._themeData.push(t);
			var op = dojo.doc.createElement("option");
			op.value = t.className;
			op.text = t.className;
			this._select.appendChild(op);
			
		}
		
		this.domNode = this._select;
		dojo.style(this.domNode, "width:100%;");
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
		this.onChange();
		
		
		
	},
	_getThemeDataAttr : function(){
		return this._themeData;
	}
});