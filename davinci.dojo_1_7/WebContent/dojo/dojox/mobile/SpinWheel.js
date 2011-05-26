define(["dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./SpinWheelSlot"],function(darray,dbase,WidgetBase,Container,Contained,ScrollableMixin,SpinWheelSlot){
	// module:
	//		dojox/mobile/SpinWheel
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.SpinWheel", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		slotClasses: [],
		slotProps: [],
		centerPos: 0,

		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "mblSpinWheel");
			this.centerPos = Math.round(this.domNode.offsetHeight / 2);

			this.slots = [];
			for(var i = 0; i < this.slotClasses.length; i++){
				this.slots.push(((typeof this.slotClasses[i] =='string') ? dojo.getObject(this.slotClasses[i]) : this.slotClasses[i])(this.slotProps[i]));
				this.addChild(this.slots[i]);
			}
			dojo.create("DIV", {className: "mblSpinWheelBar"}, this.domNode);
		},

		startup: function(){
			this.inherited(arguments);
			var _this = this;
			setTimeout(function(){
				_this.reset();
			}, 0);
		},

		getValue: function(){
			// return array of slot values
			var a = [];
			dojo.forEach(this.getChildren(), function(w){
				if(w instanceof dojox.mobile.SpinWheelSlot){
					a.push(w.getValue());
				}
			}, this);
			return a;
		},

		setValue: function(a){
			// set slot values from array
			var i = 0;
			dojo.forEach(this.getChildren(), function(w){
				if(w instanceof dojox.mobile.SpinWheelSlot){
					w.setValue(a[i]);
					w.setColor(a[i]);
					i++;
				}
			}, this);
		},

		reset: function(){
			dojo.forEach(this.getChildren(), function(w){
				if(w instanceof dojox.mobile.SpinWheelSlot){
					w.setInitialValue();
				}
			}, this);
		}
	});
});
