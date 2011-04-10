dojo.provide("dojox.form.Rating");

dojo.require("dijit.form._FormWidget");

dojo.declare("dojox.form.Rating",
	dijit.form._FormWidget,{
	// summary:
	//		A widget for rating using stars.
	//
	// required: Boolean
	//		TODO: Can be true or false, default is false.
	// required: false,

	templateString: null,
	
	// numStars: Integer/Float
	//		The number of stars to show, default is 3.
	numStars: 3,
	// value: Integer/Float
	//		The current value of the Rating
	value: 0,

	constructor:function(/*Object*/params){
		// Build the templateString. The number of stars is given by this.numStars,
		// which is normally an attribute to the widget node.
		dojo.mixin(this, params);
		
		// TODO actually "dijitInline" should be applied to the surrounding div, but FF2
		// screws up when we dojo.query() for the star nodes, it orders them randomly, because of the use
		// of display:--moz-inline-box ... very strange bug
		// Since using ul and li in combintaion with dijitInline this problem doesnt exist anymore.
		
		// The focusNode is normally used to store the value, i dont know if that is right here, but seems standard for _FormWidgets
		var tpl = '<div dojoAttachPoint="domNode" class="dojoxRating dijitInline">' +
					'<input type="hidden" value="0" dojoAttachPoint="focusNode" /><ul>${stars}</ul>' +
				'</div>';
		// The value-attribute is used to "read" the value for processing in the widget class
		var starTpl = '<li class="dojoxRatingStar dijitInline" dojoAttachEvent="onclick:onStarClick,onmouseover:_onMouse,onmouseout:_onMouse" value="${value}"></li>';
		var rendered = "";
		for(var i = 0; i < this.numStars; i++){
			rendered += dojo.string.substitute(starTpl, {value:i+1});
		}
		this.templateString = dojo.string.substitute(tpl, {stars:rendered});
	},

	postCreate: function(){
		this.inherited(arguments);
		this._renderStars(this.value);
	},

	_onMouse: function(evt){
		if(this._hovering){
			var hoverValue = +dojo.attr(evt.target, "value");
			this.onMouseOver(evt, hoverValue);
			this._renderStars(hoverValue, true);
		}else{
			this._renderStars(this.value);
		}
	},

	_renderStars: function(value, hover){
		// summary: Render the stars depending on the value.
		dojo.query(".dojoxRatingStar", this.domNode).forEach(function(star, i){
			if(i + 1 > value){
				dojo.removeClass(star, "dojoxRatingStarHover");
				dojo.removeClass(star, "dojoxRatingStarChecked");
			}else{
				dojo.removeClass(star, "dojoxRatingStar" + (hover ? "Checked" : "Hover"));
				dojo.addClass(star, "dojoxRatingStar" + (hover ? "Hover" : "Checked"));
			}
		});
	},

	onStarClick:function(/* Event */evt){
		// summary: Connect on this method to get noticed when a star was clicked.
		// example: dojo.connect(widget, "onStarClick", function(event){ ... })
		var newVal = +dojo.attr(evt.target, "value");
		this.setAttribute("value", newVal == this.value ? 0 : newVal);
		this._renderStars(this.value);
		this.onChange(this.value); // Do I have to call this by hand?
	},
	
	onMouseOver: function(/*evt, value*/){
		// summary: Connect here, the value is passed to this function as the second parameter!
	},
	
	setAttribute: function(/*String*/key, /**/value){
		// summary: When calling setAttribute("value", 4), set the value and render the stars accordingly.
		this.inherited("setAttribute", arguments);
		if (key=="value"){
			this._renderStars(this.value);
			this.onChange(this.value); // Do I really have to call this by hand? :-(
		}
	}
});
