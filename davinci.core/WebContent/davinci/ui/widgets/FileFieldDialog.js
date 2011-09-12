dojo.provide("davinci.ui.widgets.FileFieldDialog");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.OpenFileDialog");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.declare("davinci.ui.widgets.FileFieldDialog", [davinci.workbench.WidgetLite], {
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
		var data={file  : null};
		this._button = dojo.byId(this._button);
		dojo.connect(this._button,"onclick",this,function(){
			var fileDialog = new davinci.ui.Panel( {
					definition : [
					              {
					                  type: "tree",
					                  data: "file",
					                  model: davinci.resource,
					                  filters: "davinci.ui.widgets.OpenFileDialog.filter",
					                  style: "height: 210px;overflow:auto;"

					                }						],
					data:data,
					style:"height:100%;"
				});
//			dojo.connect(fileDialog,"onClick", this, function(event){
//				if(event && event.getPath())
//					fileDialog.attr("value", event.getPath());
//				else
//					fileDialog.attr("value", "");
//			});
			
			var okButton =   dojo.doc.createElement("button");
			
			var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
			var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
			var div =  dojo.doc.createElement("div", {style:"height:100%"});
			div.appendChild(fileDialog.domNode);
			okButton.innerHTML = dijitLangObj.buttonOk;
			var container =  new dijit.layout.ContentPane({style :'width: 100%; height: 250px;'});
			container.domNode.appendChild(div);
			var topDiv =  dojo.doc.createElement("div");
			topDiv.appendChild(container.domNode);
			topDiv.appendChild(okButton);
			var dialog = new dijit.Dialog({
				      			title: langObj.selectFile,
				      			content: topDiv,
				      			style: "width: 350px"
				  			});
	
			dialog.show();
			dojo.connect(okButton, "onclick", this, function(){  
				fileDialog.saveData();
				var value = data.file.getPath(); 
				dojo.attr(this._textField, "value", value);
				dialog.hide();
				this._onChange();
			}, true);
		});
		
		this._textField = dojo.byId(this._textField);
		dojo.connect(this._textField,"onchange", this,"_onChange");
		
	},
	_setBaseLocationAttr : function(baseLocation){
		// this is the directory to make everything relative to. also the first directory to show
	
		this._baseLocation = baseLocation;
		
	},
	_setValueAttr : function(value){
		 if(this.value!= value ){
			this.value = value;
			dojo.attr(this._textField, "value", value);
		 }
	},
	_onChange : function(){
		var v1 = dojo.attr(this._textField, "value");
	
		var path=new davinci.model.Path(v1);
		var value=path.relativeTo(new davinci.model.Path(this._baseLocation), true).toString(); // ignore the filename to get the correct path to the image
		
		if(value && value!="")
			value = "url('" + value + "')";
		
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