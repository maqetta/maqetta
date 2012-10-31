define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "davinci/ve/widgets/MutableStore",
        "dijit/form/ComboBox",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare,  _WidgetBase, MutableStore, ComboBox, veNLS,commonNLS){
	var MultiInputDropDown = declare("davinci.ve.widgets.MultiInputDropDown",  [_WidgetBase], {
		
		/* change increment for spinners */
		numberDelta: 1,
		insertPosition: 1,
		data: null,

		postCreate: function(){
			this.domNode.removeAttribute("data-dojo-type");
			this.domNode.removeAttribute("dojoType");	// backwards compat
			var topSpan = dojo.doc.createElement("div");
			this._run = {};
			if(!this.data ){
				this.data=[
				           {value:""}, 
				           {value:"auto"}, 
				           {value:"0px"},
			               {value:MultiInputDropDown.divider}, 
			               {value:"Remove Value",run:function(){this.set('value','')}}, 
			               {value:MultiInputDropDown.divider}, 
			               {value:"Help", run:function(){alert("help!")}}
			               ];
			}else{
				this.data.push({value:MultiInputDropDown.divider});
				this.data.push({value:"Remove Value",run:function(){this.set('value','')}});
			}
			var displayValues = [];
			for(var i = 0;i<this.data.length;i++){
				displayValues.push(this.data[i].value);
				if(this.data[i].run){
					this._run[this.data[i].value] = this.data[i].run;
				}
			}
			this._store = new MutableStore({values:displayValues, divider: MultiInputDropDown.divider});
			this._dropDown = new ComboBox({store:this._store, required: false, style:"width:100%"});
			var buttonDiv = dojo.doc.createElement("div");
			dojo.style(buttonDiv, "float", "right");
			this._plus = dojo.doc.createElement("button");
			dojo.addClass(this._plus,"incrementButton");
			dojo.addClass(this._plus,"propertyButton");		
			
			buttonDiv.appendChild(this._plus);
			this._minus = dojo.doc.createElement("button");
			dojo.addClass(this._minus,"decrementButton");
			dojo.addClass(this._minus,"propertyButton");		
			buttonDiv.appendChild(this._minus);
			topSpan.appendChild(buttonDiv);
			
			var div = dojo.create("div", {'class':"propInputWithIncrDecrButtons"});
			div.appendChild(this._dropDown.domNode)
			topSpan.appendChild(div);
		
			div =  dojo.doc.createElement("div");
			dojo.style(div, "clear", "both");
			
			topSpan.appendChild(div);
			
			this._currentValue = this._store.getItemNumber(0);
			
			dojo.connect(this._dropDown, "onKeyUp", this, "_updateSpinner");
			dojo.connect(this._dropDown, "onChange", this, "_onChange");
			dojo.connect(this._plus, "onclick", this, "_plusButton", false);
			dojo.connect(this._minus, "onclick", this, "_minusButton", false);
			
			this._updateSpinner();
			this.domNode.appendChild(topSpan);
			
		},
		_setReadOnlyAttr: function(isReadOnly){
			
			this._isReadOnly = isReadOnly;
			this._dropDown.set("disabled", isReadOnly);
			dojo.attr(this._plus, "disabled", isReadOnly);
			dojo.attr(this._minus, "disabled", isReadOnly);
		},
		
		
		onChange: function(event){
			
			
		},
		_getValueAttr: function(){
			
			return this._dropDown.get("value");
			
		},
		
		_setValueAttr: function(value,priority){
			this._dropDown.set("value", value, true);
			this._currentValue = this._dropDown.get("value");
			
			this._onChange(this._currentValue);
			
			if(!priority)
				this.onChange();
			
		}, 
		
		_changeValue: function(value, delta){
			var split = value.split(" ");
			var result="";
			for(var i=0;i<split.length;i++){
				if(i>0)
					result+=" ";
				var bits = split[i].match(/([-\d\.]+)([a-zA-Z%]*)/);
				if(!bits){
					result+=split[i];
				}else{
					if(bits.length == 1){
						result+=bits[0]; 
					}else{
						for(var z=1;z<bits.length;z++){
							if(!isNaN(bits[z]) && bits[z]!=""){
								result+= parseFloat(bits[z]) + delta;
							}else{
								result +=bits[z];
							}
						}
					}
				}
			}
			return result;
		},
		
		_plusButton: function (){
			var oldValue = this._dropDown.get("value");
			var newString = this._changeValue(oldValue, this.numberDelta);
			this._store.modifyItem(oldValue, newString);
			this._dropDown.set("value", newString);
			
		},
		
		_minusButton: function(){
			var oldValue = this._dropDown.get("value");
			var newString = this._changeValue(oldValue, -1* this.numberDelta);
			this._store.modifyItem(oldValue, newString);
			this._dropDown.set("value", newString);
			
		},
		
		_updateSpinner: function(){
			
			var value = this._dropDown.get("value");
			
			var	numbersOnlyRegExp = /(-?)(\d+){1}/;
			var numberOnly = numbersOnlyRegExp.exec(value);
			if(numberOnly && numberOnly.length){
				this._minus.disabled = this._plus.disabled = false;
				//dojo.removeClass(this._minus, "dijitHidden");
				//dojo.removeClass(this._plus, "dijitHidden");
			}else{
				//dojo.addClass(this._minus, "dijitHidden");
				//dojo.addClass(this._plus, "dijitHidden");
				
				this._minus.disabled = this._plus.disabled = true;
			}
			return true;
		},
		

		
		_onChange: function(event){
			
			var similar;
			
			if(event in this._run){
				this._dropDown.get("value", this._store.getItemNumber(0));
				dojo.hitch(this,this._run[event])();
			}else if (event == MultiInputDropDown.divider){
				this._dropDown.get("value", this._store.getItemNumber(0));
			}else if(similar = this._store.findSimilar(event)){
				this._store.modifyItem(similar, event);
			}else if(!this._store.contains(event)){
				this._store.insert(this.insertPosition, event);
			}
			
			if(this._currentValue!=this._dropDown.get("value")){
				this._currentValue=this._dropDown.get("value");
				this.onChange(event);
			}
			this._updateSpinner();
		}	

	});

	return dojo.mixin(MultiInputDropDown, {divider: "---"});
});