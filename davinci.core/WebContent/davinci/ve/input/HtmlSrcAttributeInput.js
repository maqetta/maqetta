dojo.provide("davinci.ve.input.HtmlSrcAttributeInput");
dojo.require("davinci.ve.input.SmartInput");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("davinci.ui.widgets.OpenFileDialog");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "veLang");
var langObj = dojo.i18n.getLocalization("davinci.ve", "veLang");

dojo.declare("davinci.ve.input.HtmlSrcAttributeInput", davinci.ve.input.SmartInput, {
	
	show: function(widgetId){
	this._widget = davinci.ve.widget.byId(widgetId);

	var definition = [
	    { 
          type: "tree",
	      data: "file",
	      model: "davinci.ui.widgets.ResourceTreeModel",
	      filters: "davinci.ui.widgets.OpenFileDialog.filter",
	      link : { target: "textValue",
        	targetFunction : function (input){
			  var path=new davinci.model.Path(input.getPath());
			  return path.relativeTo(new davinci.model.Path(this._widget._edit_context._srcDocument.fileName), true).toString(); // ignore the filename to get the correct path to the image
          }}
	    },
	    {
		      id: "textValue",
	          type: "textBox",
	          label: langObj.typeFileUrl,
	          data: "textValue"	    	
        },
	    {
	          type: "textBox",
	          label: langObj.typeAltText,
	          data: "altText"	    	
	        }
	  ];
	  
	  var data={
			  file  : null,
			  textValue : this._widget._srcElement.getAttribute('src') || '', 
			  altText: this._widget.attr('alt') || ''
      };
	
		davinci.ui.Panel.openDialog( {
			definition: definition,
			data: data,
			title:langObj.selectSource,
			contextObject: this,
			onOK : function ()
			{
				if(data.textValue!="")
					this.updateWidget(data.textValue,data.altText);
			
			}
		});
	},
	
//	show: function(widgetId){
//
//		this._widget = davinci.ve.widget.byId(widgetId);
//		if (!this._inline) {
//			var callBackObj = this;
//			var fileDialog = new davinci.ui.Panel( {
//						definition : [
//						              {
//						                  type: "tree",
//						                  data: "file",
//						                  model: "davinci.ui.widgets.ResourceTreeModel",
//						                  filters: "davinci.ui.widgets.OpenFileDialog.filter"
//						                }						],
//						data:{file  : null},
//						style:"height:100%;"
//					});
//				dojo.connect(fileDialog,"onClick", this, function(event){
//					if(event && event.getPath())
//						fileDialog.attr("value", event.getPath());
//					else
//						fileDialog.attr("value", "");
//					callBackObj.updateDialog(event.getPath());
//				});
//				
//				var okButton =   dojo.doc.createElement("button");
//				var span =   dojo.doc.createElement("span");
//				var div =  dojo.doc.createElement("div", {style:"height:100%"}); 
//				div.appendChild(fileDialog.domNode);
//				var container =  new dijit.layout.ContentPane({style :'height: 210px;'});
//				container.domNode.appendChild(div);
//				var topDiv =  dojo.doc.createElement("div");
//				var div2 =  dojo.doc.createElement("div");
//				div2.style.padding = "5px";
//				topDiv.appendChild(container.domNode);
//				topDiv.appendChild(div2);
//				div2.appendChild(span);
//				topDiv.appendChild(okButton);
//				span.innerHTML = '<table><tr>' +
//				'<td>URL</td><td><input id="srcFileURLInputBox"/></td>'+
//				'</tr><tr id="altTextRowForSrc">'+
//				'<td>Alternate text:</td><td><input id="altTextInputBox"/></td>'+
//				'</tr></table>';
//				var dialog = new dijit.Dialog({
//									id: 'SelectFileHtmlImageTag',
//					      			title: "Select a source",
//					      			content: topDiv,
//					      			style: "width: 370px; height: 350px;", // no height
//					      			onCancel: function(e) {
//										callBackObj.destroy();
//				                    },
//				                    onChange: function(e) {
//				                    	callBackObj.updateDialog();
//				                    }
//					  			});
//				
//				var textBox = new dijit.form.TextBox({
//				    name: "fileUrl",
//				    value: "" /* no or empty value! */,
//				    placeHolder: "type file url"
//				}, 'srcFileURLInputBox');
//				var altTextBox = new dijit.form.TextBox({
//				    name: "altText",
//				    value: "" /* no or empty value! */,
//				    placeHolder: "type alternate text"
//				}, 'altTextInputBox');
//				
//				var button = new dijit.form.Button({
//                    label: "Ok",
//                    onClick: function() {
//    					var value = fileDialog.attr('value');
//    					callBackObj._selectedFile = value;
//						dialog.hide();
//						callBackObj.updateWidget();
//                    }
//                },
//                okButton);
//				var altTextRow = dojo.byId('altTextRowForSrc');
//				if (this._widget.type ===  'html.iframe' )
//					altTextRow.style.visibility = 'hidden';
//				dialog.show();
//				//var src = this._widget.attr('src'); 
//				var src = this._widget._srcElement.getAttribute('src');
//				var altText = this._widget.attr('alt');
//				if (src && src != '')
//					textBox.attr('value', src);
//				if (altText && altText != '')
//					altTextBox.attr('value', altText);
//
//			this._inline = dialog;
//			
//		}
//
//	},
//	
	destroy: function(){
		if (this._inline){
			this._inline.destroyDescendants();
			this._inline.destroy();
			delete this._inline;
		}
	},
	
	updateDialog: function(value){
		
		if(value && value!=""){
			var obj = dijit.byId('srcFileURLInputBox');
			var path=new davinci.model.Path(value);
			var value=path.relativeTo(new davinci.model.Path(this._widget._edit_context._srcDocument.fileName), true).toString(); // ignore the filename to get the correct path to the image
			obj.attr('value', value);

		}
		
	},

//	updateWidget : function(){	
//	
//		var obj = dijit.byId('srcFileURLInputBox');
//		var value = obj.attr('value');
//		var altTextObj = dijit.byId('altTextInputBox');
//		var altText = altTextObj.attr('value');
//		if(value && value!=""){
//			var values={};
//			values['src']=value;
//			values['alt']=altText;
//			var context=this._widget.getContext();
//			command = new davinci.ve.commands.ModifyCommand(this._widget, values, context);
//			this._widget._edit_context.getCommandStack().execute(command);
//			this._widget=command.newWidget;	
//			this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
//			context.select(this._widget, null, false); // redraw the box around the
//		}
//		
//		this.destroy();
//	}
	updateWidget : function(value,altText){	
		
			var values={};
			values['src']=value;
			values['alt']=altText;
			var context=this._widget.getContext();
			command = new davinci.ve.commands.ModifyCommand(this._widget, values, context);
			this._widget._edit_context.getCommandStack().execute(command);
			this._widget=command.newWidget;	
			this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
			context.select(this._widget, null, false); // redraw the box around the
	}
	
	
	
	

	
});