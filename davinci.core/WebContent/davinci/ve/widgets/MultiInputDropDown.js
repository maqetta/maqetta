dojo.provide("davinci.ve.widgets.MultiInputDropDown");


dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Select");
dojo.require("davinci.ve.widgets.MultiTypeStore");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.TextBox");
dojo.require("davinci.ve.widgets.MutableStore");
dojo.require("dijit.MenuSeparator");


dojo.declare("davinci.ve.widgets.MultiInputDropDown",  [dijit._Widget], {
	
	/* change increment for spinners */
	numberDelta : 1,
	insertPosition : 1,
	data : null,
	
	postCreate : function(){
		var topSpan = dojo.doc.createElement("div");
		this._run = {};
		if(!this.data ){
			this.data=[
			           {value:""}, 
			           {value:"auto"}, 
			           {value:"0px"},
		               {value:davinci.ve.widgets.MultiInputDropDown.divider}, 
		               {value:"Remove Value",run:function(){this.attr('value','')}}, 
		               {value:davinci.ve.widgets.MultiInputDropDown.divider}, 
		               {value:"Help", run:function(){alert("help!")}}
		               ];
		}else{
			this.data.push({value:davinci.ve.widgets.MultiInputDropDown.divider});
			this.data.push({value:"Remove Value",run:function(){this.attr('value','')}});
		}
		var displayValues = [];
		for(var i = 0;i<this.data.length;i++){
			displayValues.push(this.data[i].value);
			if(this.data[i].run){
				this._run[this.data[i].value] = this.data[i].run;
			}
		}
		this._store = new davinci.ve.widgets.MutableStore({values:displayValues, divider:davinci.ve.widgets.MultiInputDropDown.divider});
		this._dropDown = new dijit.form.ComboBox({store:this._store, required: false, style:"width:100%"});
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
		this._dropDown.attr("disabled", isReadOnly);
		dojo.attr(this._plus, "disabled", isReadOnly);
		dojo.attr(this._minus, "disabled", isReadOnly);
	},
	
	
	onChange : function(event){
		
		
	},
	_getValueAttr : function(){
		
		return this._dropDown.attr("value");
		
	},
	
	_setValueAttr : function(value,priority){
		this._dropDown.attr("value", value, true);
		this._currentValue = this._dropDown.attr("value");
		
		this._onChange(this._currentValue);
		
		if(!priority)
			this.onChange();
		
	}, 
	
	_plusButton : function (){
		
		var oldValue = this._dropDown.attr("value");
		
		var split = oldValue.split(/(\d+)/);
		var newString = ""
		for(var i = 0;i<split.length;i++){
			if(!isNaN(split[i]) && split[i]!=""){
				newString+= parseFloat(split[i]) + this.numberDelta;
			}else{
				newString +=split[i];
			}
		}
		
		this._store.modifyItem(oldValue, newString);
		this._dropDown.attr("value", newString);
		
	},
	_updateSpinner : function(){
		
		var value = this._dropDown.attr("value");
		
		var	numbersOnlyRegExp = new RegExp(/(-?)(\d+)/);
		var numberOnly = numbersOnlyRegExp.exec(value);
		if(numberOnly && numberOnly.length>0){
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
	
	_minusButton : function(){
		var oldValue = this._dropDown.attr("value");
		
		var split = oldValue.split(/(\d+)/);
		var newString = ""
		for(var i = 0;i<split.length;i++){
			if(!isNaN(split[i]) && split[i]!=""){
				newString+= parseFloat(split[i]) - this.numberDelta;
			}else{
				newString +=split[i];
			}
		}
		
		this._store.modifyItem(oldValue, newString);
		this._dropDown.attr("value", newString);
		
	},
	
	_onChange : function(event){
		
		var similar = null;
		
		if(event in this._run){
			this._dropDown.attr("value", this._store.getItemNumber(0));
			dojo.hitch(this,this._run[event])();
		}else if (event == davinci.ve.widgets.MultiInputDropDown.divider){
			this._dropDown.attr("value", this._store.getItemNumber(0));
		}else if(similar = this._store.findSimilar(event)){
			this._store.modifyItem(similar, event);
		}else if(!this._store.contains(event)){
			this._store.insert(this.insertPosition, event);
		}
		
		if(this._currentValue!=this._dropDown.attr("value")){
			this._currentValue=this._dropDown.attr("value");
			this.onChange(event);
		}
		this._updateSpinner();
	}	

});
davinci.ve.widgets.MultiInputDropDown.divider = "---";