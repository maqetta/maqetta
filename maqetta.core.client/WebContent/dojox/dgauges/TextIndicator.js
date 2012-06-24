define(["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/sniff", "dojo/_base/array", "dojo/on", "dojox/gfx", "./IndicatorBase"],
	function(lang, declare, has, array, on, gfx, IndicatorBase){

	/*=====
	var IndicatorBase = dojox.dgauges.IndicatorBase;
	=====*/
	return declare("dojox.dgauges.ScaleIndicatorBase", IndicatorBase, {
		//	summary:
		//		This type of indicator is used to render text.
		//		To render an arbitrary text, set the value property.
		//		To render the value of a value indicator or a range indicator, set the indicator property.
		//		Setting the indicator property takes precedence on setting the value property.
		//		When the indicator property is set, the text is automatically updated on value changes.

		font: null,
		x: 0,
		y: 0,
		align: "middle",
		color: "black",
		indicator: null,
		labelFunc: null,
		
		constructor: function(){
			this.addInvalidatingProperties(["indicator"]);

			var resetProps = ["x", "y", "font", "align", "color", "labelFunc"];
			array.forEach(resetProps, lang.hitch(this, function(entry){
				this.watch(entry, this._resetText);
			}));
			
			this.watch("indicator", lang.hitch(this, this._indicatorChanged));
		},

		postscript: function(mixin){
			this.inherited(arguments);
			if(mixin && mixin.indicator){
				this._indicatorChanged("indicator", null, mixin.indicator);
			}
		},
		
		_resetText: function(){
			this._textCreated = false;
			this.invalidateRendering();
		},
		
		_valueWatcher: null,
		
		_indicatorChanged: function(name, oldValue, newValue){
			if(this._valueWatcher){
				this._valueWatcher.unwatch();
			}
			this._valueWatcher = newValue.watch("value", lang.hitch(this, this.refreshRendering));
		},
		
		_getFont: function(){
			var font = this.font;
			if(!font && this._gauge){
				font = this._gauge.font;
			}
			if(!font){
				font = gfx.defaultFont;
			}
			return font;
		},
		
		_textCreated: false,
		_textInstance: null,
		
		_createText: function(group, font, color, text, x, y, align){
			var text = group.createText({
				x: x,
				y: y,
				text: text,
				align: align
			}).setFont(font).setFill(color);
			return text;
		},
		
		refreshRendering: function(){
			if(this._gfxGroup == null){
				return;
			}
			var text;
			if(this.indicator){
				text = this.indicator.value;
			}else{
				text = this.value;
			}
			if(this.labelFunc){
				text = this.labelFunc(text);
			}
			var iOsVersion = has("iphone");
			// Workaround for a bug on iOS version < 5.0: Recreate the text every time
			if(!this._textCreated || (iOsVersion != undefined && iOsVersion < 5)){
				this._gfxGroup.clear();
				var font = this._getFont();
				this._textInstance = this._createText(this._gfxGroup, font, font.color ? font.color : this.color, "", this.x, this.y, this.align);
				this._textCreated = true;
			}
			this._textInstance.setShape({
				text: text
			});
			
			return this._textInstance;
		}
	})
});
