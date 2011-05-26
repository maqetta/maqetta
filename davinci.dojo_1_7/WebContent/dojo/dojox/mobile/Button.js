define(["dojo/_base/array", "dojo/_base/html","dijit/_WidgetBase", "dijit/form/_FormWidgetMixin", "dijit/form/_ButtonMixin"], function(darray, html, WidgetBase,FormWidgetMixin,ButtonMixin){

	return dojo.declare("dojox.mobile.Button", [dijit._WidgetBase, dijit.form._FormWidgetMixin, dijit.form._ButtonMixin], {
		// summary:
		//	Non-templated BUTTON widget with a thin API wrapper for click events and setting the label
		//
		// description:
		//              Buttons can display a label, an icon, or both.
		//              A label should always be specified (through innerHTML) or the label
		//              attribute.  It can be hidden via showLabel=false.
		// example:
		// |    <button dojoType="dijit.form.Button" onClick="...">Hello world</button>

		baseClass: "mblButton",

		// duration: Number
		//	duration of selection, milliseconds or -1 for no post-click CSS styling
		duration: 1000,

		_onClick: function(e){
			var ret = this.inherited(arguments);
			if(ret && this.duration >= 0){ // if its not a button with a state, then emulate press styles
				var button = this.focusNode || this.domNode;
				var newStateClasses = (this.baseClass+' '+this["class"]).split(" ");
				newStateClasses = dojo.map(newStateClasses, function(c){ return c+"Selected"; });
				dojo.addClass(button, newStateClasses);
				setTimeout(function(){
					dojo.removeClass(button, newStateClasses);
				}, this.duration);
			}
			return ret;
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = dojo.create("button", {"type": this.type});
			}
			this.inherited(arguments);
			this.focusNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.domNode, "onclick", "_onClick");
		}
	});

});
