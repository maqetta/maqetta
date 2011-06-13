dojo.provide("davinci.ve.widgets.ColorPicker");

dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.ComboBox");
dojo.require("dojox.widget.ColorPicker");
dojo.require("davinci.ve.widgets.ColorStore");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.Button");
dojo.require("davinci.ve.widgets.ColorPickerFlat");

dojo.declare("davinci.ve.widgets.ColorPicker", [dijit._Widget], {
	
	/* change increment for spinners */
	numberDelta : 1,
	insertPosition : 9,
	data : null,
	
	postCreate : function(){
		
		this.inherited(arguments);
		
		var statics = ["", davinci.ve.widgets.ColorPicker.divider, "Color picker....", "Remove Value"];
		this._run = {};
		if(!this.data ){
			this.data=[{value:statics[0]}];
			this.data.push({value:statics[2],run:this._chooseColorValue});
			this.data.push({value:statics[3],run:function(){this.attr('value','')}});
			this.data.push({value:statics[1]});   
			this.data.push({value:'black'});
			this.data.push({value:'white'});
			this.data.push({value:'red'});
			this.data.push({value:'green'});
			this.data.push({value:'blue'});
			
		              
		}else{
			this.data.push({value:davinci.ve.widgets.ColorPicker.divider});
			this.data.push({value:"Remove Value",run:function(){this.attr('value','')}});
		}
		var displayValues = [];
		for(var i = 0;i<this.data.length;i++){
			displayValues.push(this.data[i].value);
			if(this.data[i].run){
				this._run[this.data[i].value] = this.data[i].run;
			}
		}
		
		this._store = new davinci.ve.widgets.ColorStore({values:displayValues, noncolors:statics});
		this._dropDown = new dijit.form.ComboBox({store:this._store, required: false, labelType:'html', labelAttr:'label', style:'width:100%'});
		dojo.connect(this._dropDown, "onChange", this, "_onChange");
		var top = dojo.doc.createElement("div");
		dojo.addClass(top, 'colorPicker');
		this._selectedColor = dojo.doc.createElement("div");
		this._selectedColor.innerHTML = "&nbsp;"
		dojo.addClass(this._selectedColor, 'colorPickerSelected');
		dojo.connect(this._selectedColor,'onclick',dojo.hitch(this,function(event){
			this._chooseColorValue();
		}));
		top.appendChild(this._selectedColor);
		var combo_container = dojo.doc.createElement("div");
		dojo.addClass(combo_container, 'colorPickerComboContainer');
		combo_container.appendChild(this._dropDown.domNode);
		top.appendChild(combo_container);
		this.domNode.appendChild(top);
	},
	_chooseColorValue : function(){
		/* make the color value its original */
		
		this._dropDown.attr("value", this._value, true);
		
		
		
		var content = new davinci.ve.widgets.ColorPickerFlat({});
		var	dialog = new dijit.TooltipDialog({title: 'select a color', content: content});
		dijit.popup.moveOffScreen(dialog.domNode);
		var opened = false;
		var closePopup = function(target){ return function(){
			
			if(opened){
				opened = false;
				dijit.popup.close(dialog);
				//this.box.focus();
			}
		};
		}(this);


		//dialog.connect(dialog, "onBlur", dojo.hitch(this, cancelPopup));
		dialog.connect(content, "onCancel", dojo.hitch(this, closePopup));
		dialog.connect(content, "onClose", dojo.hitch(this, closePopup));
		
		
		var colorpicker = dijit.byNode(dojo.query("[widgetId]", dialog.domNode)[0]);
		
		var popup = function(target) {
			return function(){
				if(this._isReadOnly)
					return;
//				dojo.connect(colorPicker,"onclick", this, function(val){ this.box.value = val; });

				dijit.popup.open({
					parent: target._dropDown,
					popup: dialog,
					around: target._dropDown.domNode,
					orient:
						// TODO: add user-defined positioning option, like in Tooltip.js
						target.isLeftToRight() ? {'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'}
						: {'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'},
					onClose: function(){
						if(!colorpicker.canceled){
							var oldValue = target._dropDown.attr("value");
							target._dropDown.attr("value", colorpicker.attr("value"));
						}
						
						closePopup();

						if(!colorpicker.canceled && oldValue!=colorpicker.attr("value")) 
							target.onChange();
					}
				});

				opened = true;

				dijit.focus(dialog.containerNode);
			};
		};
		if(this._value in dojo.Color.named){
			
			var value = dojo.colorFromString(this._value)
			content.attr('value', value.toHex());
		}else if(this._value!=null && this._value!=''){
			content.attr('value', this._value);
		}
		popup(this)();


	},
	_setReadOnlyAttr: function(isReadOnly){
		this._isReadOnly = isReadOnly;
		this._dropDown.attr("disabled", isReadOnly);
	},
	
	
	onChange : function(event){
		this._oldvalue = this._value;
		this._value = this._dropDown.attr("value");
		
	},
	_getValueAttr : function(){
		return this._dropDown.attr("value");
	},
	
	_setValueAttr : function(value,priority){
		this._dropDown.attr("value", value, true);
		this._currentValue = this._dropDown.attr("value");
		dojo.style(this._selectedColor, "backgroundColor", value);
		this._onChange(this._currentValue);
		if(!priority)
			this.onChange();
		
	}, 
	
	_onChange : function(event){
		
		var similar = null;
		
		if(event in this._run){
			//this._dropDown.attr("value", this._store.getItemNumber(0));
			dojo.hitch(this,this._run[event])();
		}else if (event == davinci.ve.widgets.ColorPicker.divider){
			this._dropDown.attr("value", this._store.getItemNumber(0));
		}else if(!this._store.contains(event)){
			this._store.insert(this.insertPosition, event);
			dojo.style(this._selectedColor, "backgroundColor", event);
		}else{
			dojo.style(this._selectedColor, "backgroundColor", event);
		}
		
		if(this._currentValue!=this._dropDown.attr("value")){
			this._currentValue=this._dropDown.attr("value");
			this.onChange(event);
		}
	}	

});
davinci.ve.widgets.ColorPicker.divider = "---";