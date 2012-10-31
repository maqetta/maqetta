define(["dojo/_base/declare",
     
        "dijit/_WidgetBase",
        "dijit/form/ComboBox",
        "davinci/ve/widgets/ColorStore",
        "davinci/ve/widgets/ColorPickerFlat",
        "dijit/TooltipDialog",
        
        "dojo/i18n!davinci/ve/nls/ve",
        "dijit/popup"
       
],function(declare,  _WidgetBase, ComboBox, ColorStore, ColorPickerFlat, TooltipDialog, veNLS){
 var colorPicker = declare("davinci.ve.widgets.ColorPicker", [_WidgetBase], {
		
		/* change increment for spinners */
		numberDelta: 1,
		insertPosition: 9,
		data: null,
		
		postCreate: function(){
			
			this.inherited(arguments);

			this.domNode.removeAttribute("data-dojo-type");
			this.domNode.removeAttribute("dojoType"); // backwards compat

			this._statics = ["", davinci.ve.widgets.ColorPicker.divider, veNLS.colorPicker, veNLS.removeValue];
			this._run = {};
			if(!this.data ){
				this.data=[{value:this._statics[0]},
					{value:this._statics[2], run:this._chooseColorValue},
					{value:this._statics[3], run:function(){this.set('value','')}},
					{value:this._statics[1]},   
					{value:'transparent'},
					{value:'black'},
					{value:'white'},
					{value:'red'},
					{value:'green'},
					{value:'blue'}];
			}else{
				this.data.push({value:davinci.ve.widgets.ColorPicker.divider});
				this.data.push({value:veNLS.removeValue,run:function(){this.set('value','');}});
			}
			var displayValues = [];
			for(var i = 0;i<this.data.length;i++){
				displayValues.push(this.data[i].value);
				if(this.data[i].run){
					this._run[this.data[i].value] = this.data[i].run;
				}
			}
			
			this._store = new ColorStore({values:displayValues, noncolors:this._statics});
			this._dropDown = new ComboBox({store:this._store, required: false, autoComplete:false, labelType:'html', labelAttr:'label', style:'width:100%'});
			dojo.connect(this._dropDown, "onChange", this, "_onChange");
			var top = dojo.doc.createElement("div");
			dojo.addClass(top, 'colorPicker');
			this._selectedColor = dojo.doc.createElement("div");
			this._selectedColor.innerHTML = "&nbsp;";
			dojo.addClass(this._selectedColor, 'colorPickerSelected');
			dojo.connect(this._selectedColor,'onclick',dojo.hitch(this,function(event){
				this._chooseColorValue();
			}));
			top.appendChild(this._selectedColor);
			var combo_container = dojo.doc.createElement("div");
			dojo.addClass(combo_container, 'colorPickerComboContainer');
			combo_container.appendChild(this._dropDown.domNode);
			top.appendChild(combo_container);
			
			this._colorPickerFlat = new ColorPickerFlat({});
			
			this.domNode.appendChild(top);
		},
		_chooseColorValue: function(){
			/* make the color value its original */
			
			this._dropDown.set("value", this._value, true);

			var content = this._colorPickerFlat;
			var	dialog = new TooltipDialog({id: 'maqetta_prop_tooltip_color_picker', title: veNLS.selectColor, content: content});
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
			
	//FIXME: Remove code below and replace with call to davinci.ve.widgets.ColorPickerFlat.show
			
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
								var oldValue = target._dropDown.get("value");
								target._dropDown.set("value", colorpicker.get("value"));
							}
							
							closePopup();
							dialog.destroy();
							/*
							if(!colorpicker.canceled && oldValue!=colorpicker.get("value")) 
								target.onChange();
						    */
						}
					});
	
					opened = true;
	
					dijit.focus(dialog.containerNode);
				};
			};
			if(this._value in dojo.Color.named){
				
				var value = dojo.colorFromString(this._value);
				content.set('value', value.toHex());
			}else{
				content.set('value', this._value || "", true);
			}
			popup(this)();
	
	
		},
		_setReadOnlyAttr: function(isReadOnly){
			this._isReadOnly = isReadOnly;
			this._dropDown.set("disabled", isReadOnly);
		},
		
		
		onChange: function(event){
			//this._value = this._dropDown.get("value");
			
		},
		_getValueAttr: function(){
			return this._dropDown.get("value");
		},
		
		_setValueAttr: function(value,priority){
			
			this._dropDown.set("value", value, true);
			dojo.style(this._selectedColor, "backgroundColor", value);
			
			if(value in dojo.Color.named){
				var v = dojo.colorFromString(value);
				this._colorPickerFlat.set('value', v.toHex(), priority);
			}else {
				this._colorPickerFlat.set('value', value, priority);
			}
			this._onChange(value, priority);
	
		}, 
		
		_onChange: function(event, priority){
			
			if(event in this._run){
				//this._dropDown.set("value", this._store.getItemNumber(0));
				dojo.hitch(this,this._run[event])();
			}else if (event == davinci.ve.widgets.ColorPicker.divider){
				this._dropDown.set("value", this._store.getItemNumber(0));
			}else if(!this._store.contains(event)){
				this._store.insert(this.insertPosition, event);
				dojo.style(this._selectedColor, "backgroundColor", event);
			}else{
				dojo.style(this._selectedColor, "backgroundColor", event);
			}
			
			if(this._value!=event && !(event in this._run)){
				this._value=event;
				if(!priority)
					this.onChange(event);
			}
		}	
	});
 	return dojo.mixin(colorPicker, {divider:"---"});
});