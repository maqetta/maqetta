dojo.provide("davinci.ve.widgets.Background");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.OpenFileDialog");
dojo.require("davinci.ve.widgets.BackgroundDialog");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.ve.widgets.Background", [davinci.workbench.WidgetLite], {
	buildRendering: function(){
		this.domNode =   dojo.doc.createElement("div",{style:"width:100%"});
		this._textField = davinci.ve.widgets.HTMLStringUtil.getId();
		this._button = davinci.ve.widgets.HTMLStringUtil.getId();
		var template="<div style='float:right;'><button type='button' style='font-size:1em;' id='" + this._button + "'>...</button></div>";
		template += "<div style='margin-right:35px;padding:1px 0;'><input style='width:100%; padding:1.5px 0;' type='text' id='" + this._textField + "'></input></div>";
		this.domNode.innerHTML = template;
		this.inherited(arguments);
	},

	startup : function(){
		this.inherited(arguments);
	
		this._button = dojo.byId(this._button);
		dojo.connect(this._button,"onclick",this,function(){
			var background = new davinci.ve.widgets.BackgroundDialog({'value': this.value});
			
			davinci.Workbench.showModal(background, "Background", 'width: 320px; opacity:0', function(){
				
			});
		});
		
		this._textField = dojo.byId(this._textField);
		dojo.connect(this._textField,"onchange", this,"_onChange");
		
	},
	/*
	 * This is the base location for the file in question.  Used to caluclate relativity for url(...)
	 */
	_setBaseLocationAttr : function(baseLocation){
		this._baseLocation = baseLocation;
		
	},
	_setValueAttr : function(value){
		 
		// value is now an array if there are more than one of a given property for the selected rule
		
		if(this.value!= value ){
			this.value = value;
			/* check if array or single value.  If its a single value we'll just set the text box to that value */
			if(!dojo.isArray(value))
				dojo.attr(this._textField, "value", value);
			else{
				// JON- this is where your regular expression will need to pick a value, and manipulate it for whatever format.
			}
		 }
	},
	_onChange : function(){
		
		
		var v1 = dojo.attr(this._textField, "value");
		/* calculate the relativity of url */
		var path=new davinci.model.Path(v1);
		var value=path.relativeTo(new davinci.model.Path(this._baseLocation), true).toString(); // ignore the filename to get the correct path to the image
		
		if(v1 && v1!="")
			value = "url('" + value + "')";
		else 
			value = "";
		
		if(this.value!=value){
			
			this.value = value;
			dojo.attr(this._textField, 'value', this.value);
			this.onChange(value);
		}
	},
	
	onChange : function(event){},
	
	_getValueAttr : function(){
		return  dojo.attr(this._textField, "value");
		
	}
	
});