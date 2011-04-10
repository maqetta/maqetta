dojo.provide("davinci.ve.widgets.ColorPicker");

dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.widget.ColorPicker");



dojo.declare("davinci.ve.widgets.ColorPicker", [dijit._Widget], {
	_NULL_VALUE: "...",
	postCreate: function(){
		this.inherited(arguments);
		
		var handler = function(val,id){
			dojo.byId(id).value = val;
		};
		
		this.box = new dijit.form.TextBox({	   name: this.name, 
											   value: (this.selected || this._NULL_VALUE),
											   style:"display:inline-block;width:100%;height:14px;font-size:9pt;padding-top:1px;padding-bottom:1px;"});
			

//FIXME: destroy singleton somewhere
//TODO: pass in color value
		var	dialog = new dijit.TooltipDialog({title: 'select a color', content: '<div dojoType="dojox.widget.ColorPicker"></div>'});
		dijit.popup.moveOffScreen(dialog.domNode);
		var opened = false,
		closePopup = function(target){ return function(){
			if(opened){
				opened = false;
				dijit.popup.close(dialog);
				//this.box.focus();
			}
		};
		}(this);
		
		dialog.connect(dialog, "onBlur", dojo.hitch(this, closePopup));

		var colorpicker = dijit.byNode(dojo.query("[widgetId]", dialog.domNode)[0]);

		var popup = function(target) {
			return function(){
				if(this._isReadOnly)
					return;
//				dojo.connect(colorPicker,"onclick", this, function(val){ this.box.value = val; });

				dijit.popup.open({
					parent: this.box,
					popup: dialog,
					around: this.box.domNode,
					orient:
						// TODO: add user-defined positioning option, like in Tooltip.js
						this.isLeftToRight() ? {'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'}
						: {'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'},
					onExecute: function(){
							debugger;
						var oldValue = this.parent.attr("value");
						this.parent.attr("value", colorpicker.attr("value"));
						closePopup();
						if(oldValue!=colorpicker.attr("value")) 
							target.onChange();
					},
					onCancel: function(){
						dijit.popup.close(dialog);
						this.parent.focus();
					},
					onClose: function(){
						var oldValue = target.box.attr("value");
						target.box.attr("value", colorpicker.attr("value"));
						closePopup();
						if(oldValue!=colorpicker.attr("value")) 
							target.onChange();
					}
				});

				opened = true;

				dijit.focus(dialog.containerNode);
			};
		};
	//	dojo.connect(this.box,"onChange",this,"onChange"); //FIXME: no this.onChange method?
		//this.box.className = "colorPickerText";
		
		
		dojo.connect(this.box,"onClick",this,popup(this));
		dojo.connect(this.box,"onKeyDown",this,popup(this));
		
		this.domNode.appendChild( this.box.domNode);
		this.domNode.style.display="inline-block";
		this.attr("readOnly", false);
	},
	
	onChange: function(){
		this._showColor();
	},

	_showColor: function(){
		var value = this.box.attr("value");
		
		if(value==this._NULL_VALUE){
			
			this.box.domNode.style.backgroundColor= null;
		}else{
			this.box.domNode.style.backgroundColor=value;
			
		}
		
	},
	_setReadOnlyAttr: function(isReadOnly){
		this._isReadOnly = isReadOnly;
		this.box.attr("readOnly", isReadOnly);
		
	},
	_setValueAttr: function (value, isPriority){
		if(value!="" && value!=null) 
			this.box.attr("value",value, isPriority);
		else
			this.box.attr("value",this._NULL_VALUE, isPriority);
		
		this._showColor();
	},
	_getValueAttr: function (){
		var v = this.box.attr("value");
		return v==this._NULL_VALUE ? null : v ;
	}
});