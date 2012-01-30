define(["dojo/_base/declare",
        "davinci/workbench/WidgetLite",
        "davinci/ui/Panel",
        "dijit/layout/ContentPane",
        "dijit/Dialog",
        "davinci/model/Path",
        "davinci/ve/widgets/HTMLStringUtil",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dijit/TooltipDialog",
        "dijit/form/TextBox",
        "dijit/layout/ContentPane",
       

   ],function(declare, WidgetLite, Panel, ContentPane, Dialog, Path, HTMLStringUtil, uiNLS, commonNLS){
		return declare("davinci.ui.widgets.FileFieldDialog", WidgetLite, {
			buildRendering: function(){
				this.domNode =   dojo.doc.createElement("div",{style:"width:100%"});
				this._textField = HTMLStringUtil.getId();
				this._button = HTMLStringUtil.getId();
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
					var fileDialog = new Panel( {
							definition : [
							              {
							                  type: "tree",
							                  data: "file",
							                  model: system.resource,
							                  filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');",
							                  style: "height: 150px;width:100%"
		
							                }						],
							data:data,
							style:"height:100%;width:100%"
						});
		//			dojo.connect(fileDialog,"onClick", this, function(event){
		//				if(event && event.getPath())
		//					fileDialog.attr("value", event.getPath());
		//				else
		//					fileDialog.attr("value", "");
		//			});
					
					var okButton =   dojo.doc.createElement("button");
					
					var langObj = uiNLS;
					var dijitLangObj = commonNLS;
					var div =  dojo.doc.createElement("div", {style:"height:100%;"});
					div.appendChild(fileDialog.domNode);
					okButton.innerHTML = dijitLangObj.buttonOk;
					var container =  new ContentPane({style :'overflow:hidden'});
					container.domNode.appendChild(div);
					var topDiv =  dojo.doc.createElement("div");
					topDiv.appendChild(container.domNode);
					topDiv.appendChild(okButton);
					var dialog = new Dialog({
						      			title: langObj.selectFile,
						      			content: topDiv
						  			});
			
					dialog.show();
					dojo.connect(okButton, "onclick", this, function(){  
						fileDialog.saveData();
						var value = data.file.getPath(); 
						var _textField = dojo.byId(this._textField);
						dojo.attr(_textField, "value", value);
						dialog.hide();
						this._onChange();
					}, true);
				});
				
			//	this._textField = dojo.byId(this._textField);
				var _textField = dojo.byId(this._textField);
				dojo.connect(_textField,"onchange", this,"_onChange");
				
			},
			_setBaseLocationAttr : function(baseLocation){
				// this is the directory to make everything relative to. also the first directory to show
			
				this._baseLocation = baseLocation;
				
			},
			_setValueAttr : function(value){
				 if(this.value!= value ){
					this.value = value;
					var _textField = dojo.byId(this._textField);
					dojo.attr(_textField, "value", value);
				 }
			},
			_onChange : function(){
				var _textField = dojo.byId(this._textField);
				var v1 = dojo.attr(_textField, "value");
				
				var path=new Path(v1);
				var value=path.relativeTo(new Path(this._baseLocation), true).toString(); // ignore the filename to get the correct path to the image
				
				/*
				if(v1 && v1!="")
					value = "url('" + value + "')";
				else 
					value = "";
				*/
				if(this.value!=value){
					
					this.value = value;
					var _textField = dojo.byId(this._textField);
					dojo.attr(_textField, 'value', this.value);
					this.onChange(value);
				}
			},
			
			onChange : function(event){},
			
			_getValueAttr : function(){
				return  dojo.attr(this._textField, "value");
				
			}
			
		});
});