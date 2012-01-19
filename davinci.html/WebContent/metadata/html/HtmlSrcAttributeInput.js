dojo.provide("davinci.libraries.html.html.HtmlSrcAttributeInput");
dojo.require("davinci.ve.input.SmartInput");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("davinci.ui.widgets.OpenFileDialog");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.libraries.html.html", "html");
var langObj = dojo.i18n.getLocalization("davinci.libraries.html.html", "html");

dojo.declare("davinci.libraries.html.html.HtmlSrcAttributeInput", davinci.ve.input.SmartInput, {
    //Added this so we can re-use this class for elements that do not support an "alt" attribute (such as AUDIO, EMBED, and VIDEO)
    supportsAltText: true,
    
	show: function(widgetId){
        this._widget = davinci.ve.widget.byId(widgetId);
        
        var definition = [
            { 
              type: "tree",
              data: "file",
              model: system.resource,
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
            }
          ];
        
        var data={
                file  : null,
                textValue : this._widget._srcElement.getAttribute('src') || ''
        };

        if (this.supportsAltText) {
            definition.push({
                  type: "textBox",
                  label: langObj.typeAltText,
                  data: "altText"           
                });
            data.altText = this._widget.attr('alt') || '';
        }
          
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

	updateWidget : function(value,altText){	
	    var values={};
		values['src']=value;
		if (this.supportsAltText) {
		    values['alt']=altText;
		}
		var context=this._widget.getContext();
		command = new davinci.ve.commands.ModifyCommand(this._widget, values, null, context);
		this._widget._edit_context.getCommandStack().execute(command);
		this._widget=command.newWidget;	
		this._widget._edit_context._focuses[0]._selectedWidget = this._widget; // get the focus on the current node
		context.select(this._widget, null, false); // redraw the box around the
	}
});