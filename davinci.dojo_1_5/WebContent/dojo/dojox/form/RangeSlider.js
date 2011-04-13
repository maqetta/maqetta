dojo.provide("dojox.form.RangeSlider");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.VerticalSlider");
dojo.require("dojox.fx");

(function(){

	// make these functions once:
	var sortReversed = function(a, b){ return b - a; },
		sortForward = function(a, b){ return a - b; }
	;

	dojo.declare("dojox.form._RangeSliderMixin", null, {

		value: [0,100],
		postMixInProperties: function(){
			this.inherited(arguments);
			this.value = dojo.map(this.value, function(i){ return parseInt(i, 10); });
		},
	
		postCreate: function(){
			this.inherited(arguments);
			// we sort the values!
			// TODO: re-think, how to set the value
			this.value.sort(this._isReversed() ? sortReversed : sortForward);

			// define a custom constructor for a SliderMoverMax that points back to me
			var _self = this;
			var mover = function(){
				dijit.form._SliderMoverMax.apply(this, arguments);
				this.widget = _self;
			};
			dojo.extend(mover, dijit.form._SliderMoverMax.prototype);

			this._movableMax = new dojo.dnd.Moveable(this.sliderHandleMax,{ mover: mover });
			dijit.setWaiState(this.focusNodeMax, "valuemin", this.minimum);
			dijit.setWaiState(this.focusNodeMax, "valuemax", this.maximum);
		
			// a dnd for the bar!
			var barMover = function(){
				dijit.form._SliderBarMover.apply(this, arguments);
				this.widget = _self;
			};
			dojo.extend(barMover, dijit.form._SliderBarMover.prototype);
			this._movableBar = new dojo.dnd.Moveable(this.progressBar,{ mover: barMover });
		},
	
		destroy: function(){
			this.inherited(arguments);
			this._movableMax.destroy();
			this._movableBar.destroy(); 
		},
	
		_onKeyPress: function(/*Event*/ e){
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey){ return; }
		
			var focusedEl = e.currentTarget,
				minSelected = false,
				maxSelected = false,
				k = dojo.keys
			;
		
			if(focusedEl == this.sliderHandle){
				minSelected = true;
			}else if(focusedEl == this.progressBar){
				maxSelected = minSelected = true;
			}else if(focusedEl == this.sliderHandleMax){
				maxSelected = true;
			}
			
			switch(e.keyCode){
				case k.HOME:
					this._setValueAttr(this.minimum, true, maxSelected);
					break;
				case k.END:
					this._setValueAttr(this.maximum, true, maxSelected);
					break;
				// this._descending === false: if ascending vertical (min on top)
				// (this._descending || this.isLeftToRight()): if left-to-right horizontal or descending vertical
				case ((this._descending || this.isLeftToRight()) ? k.RIGHT_ARROW : k.LEFT_ARROW):
				case (this._descending === false ? k.DOWN_ARROW : k.UP_ARROW):
				case (this._descending === false ? k.PAGE_DOWN : k.PAGE_UP):
					if(minSelected && maxSelected){
						this._bumpValue([
							{'change': e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, 'useMaxValue': true},
							{'change': e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, 'useMaxValue': false}
						]);
					}else if(minSelected){
						this._bumpValue(e.keyCode == k.PAGE_UP ? this.pageIncrement : 1, true);
					}else if(maxSelected){
						this._bumpValue(e.keyCode == k.PAGE_UP ? this.pageIncrement : 1);
					}
					break;
				case ((this._descending || this.isLeftToRight()) ? k.LEFT_ARROW : k.RIGHT_ARROW) :
				case (this._descending === false ? k.UP_ARROW : k.DOWN_ARROW):
				case (this._descending === false ? k.PAGE_UP : k.PAGE_DOWN):
					if (minSelected && maxSelected){
						this._bumpValue([
							{ change: e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, useMaxValue: false },
							{ change: e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, useMaxValue: true }
						]);
					}else if(minSelected){
						this._bumpValue(e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1);
					}else if(maxSelected){
						this._bumpValue(e.keyCode == k.PAGE_DOWN ? -this.pageIncrement : -1, true);
					}
					break;
				default:
					dijit.form._FormValueWidget.prototype._onKeyPress.apply(this, arguments);
					this.inherited(arguments);
					return;
			}
			dojo.stopEvent(e);
		},
	
		_onHandleClickMax: function(e){
			if(this.disabled || this.readOnly){ return; }
			if(!dojo.isIE){
				// make sure you get focus when dragging the handle
				// (but don't do on IE because it causes a flicker on mouse up (due to blur then focus)
				dijit.focus(this.sliderHandleMax);
			}
			dojo.stopEvent(e);
		},
	
		_onClkIncBumper: function(){
			this._setValueAttr(this._descending === false ? this.minimum : this.maximum, true, true);
		},
	
		_bumpValue: function(signedChange, useMaxValue){

			// we pass an array to _setValueAttr when signedChange is an array
			var value = dojo.isArray(signedChange) ? [
					this._getBumpValue(signedChange[0].change, signedChange[0].useMaxValue),
					this._getBumpValue(signedChange[1].change, signedChange[1].useMaxValue)
				] 
				: this._getBumpValue(signedChange, useMaxValue)

			this._setValueAttr(value, true, 
				// conditional passed the valueAttr
				!dojo.isArray(signedChange) && 
				((signedChange > 0 && !useMaxValue) || (useMaxValue && signedChange < 0))
			);
		},
	
		_getBumpValue: function(signedChange, useMaxValue){
			var s = dojo.getComputedStyle(this.sliderBarContainer),
				c = dojo._getContentBox(this.sliderBarContainer, s),
				count = this.discreteValues,
				myValue = !useMaxValue ? this.value[0] : this.value[1]
			;

			if(count <= 1 || count == Infinity){ count = c[this._pixelCount]; }
			count--;

			if((this._isReversed() && signedChange < 0) || (signedChange > 0 && !this._isReversed())){
				myValue = !useMaxValue ? this.value[1] : this.value[0];
			}
			
			var value = (myValue - this.minimum) * count / (this.maximum - this.minimum) + signedChange;
			if(value < 0){ value = 0; }
			if(value > count){ value = count; }
			
			return value * (this.maximum - this.minimum) / count + this.minimum;
		},
	
		_onBarClick: function(e){
			if(this.disabled || this.readOnly){ return; }
			if(!dojo.isIE){
				// make sure you get focus when dragging the handle
				// (but don't do on IE because it causes a flicker on mouse up (due to blur then focus)
				dijit.focus(this.progressBar);
			}
			dojo.stopEvent(e);	
		},
	
		_onRemainingBarClick: function(e){
			if(this.disabled || this.readOnly){ return; }
			if(!dojo.isIE){
				// make sure you get focus when dragging the handle
				// (but don't do on IE because it causes a flicker on mouse up (due to blur then focus)
				dijit.focus(this.progressBar);
			}

			// now we set the min/max-value of the slider!
			var abspos = dojo.coords(this.sliderBarContainer, true),
				bar = dojo.coords(this.progressBar, true),
				relMousePos = e[this._mousePixelCoord] - abspos[this._startingPixelCoord],
				leftPos = bar[this._startingPixelCount],
				rightPos = leftPos + bar[this._pixelCount],
				isMaxVal = this._isReversed() ? relMousePos <= leftPos : relMousePos >= rightPos,
				p = this._isReversed() ? abspos[this._pixelCount] - relMousePos : relMousePos
			;

			this._setPixelValue(p, abspos[this._pixelCount], true, isMaxVal);
			dojo.stopEvent(e);
		},
	
		_setPixelValue: function(/*Number*/ pixelValue, /*Number*/ maxPixels, /*Boolean*/ priorityChange, /*Boolean*/ isMaxVal){
			if(this.disabled || this.readOnly){ return; }
			var myValue = this._getValueByPixelValue(pixelValue, maxPixels);
			this._setValueAttr(myValue, priorityChange, isMaxVal);
		},
	
		_getValueByPixelValue: function(/*Number*/ pixelValue, /*Number*/ maxPixels){
			pixelValue = pixelValue < 0 ? 0 : maxPixels < pixelValue ? maxPixels : pixelValue;
			var count = this.discreteValues;
			if(count <= 1 || count == Infinity){ count = maxPixels; }
			count--;
			var pixelsPerValue = maxPixels / count;
			var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
			return (this.maximum-this.minimum)*wholeIncrements/count + this.minimum;
		},
	
		_setValueAttr: function(/*Array or Number*/ value, /*Boolean, optional*/ priorityChange, /*Boolean, optional*/ isMaxVal){
			// we pass an array, when we move the slider with the bar
			var actValue = this.value;
			if(!dojo.isArray(value)){
				if(isMaxVal){
					if(this._isReversed()){
						actValue[0] = value;
					}else{
						actValue[1] = value;
					}
				}else{
					if(this._isReversed()){
						actValue[1] = value;
					}else{
						actValue[0] = value;
					}
				}
			}else{
				actValue = value;
			}
			// we have to reset this values. don't know the reason for that
			this._lastValueReported = "";
			this.valueNode.value = this.value = value = actValue;
			dijit.setWaiState(this.focusNode, "valuenow", actValue[0]);
			dijit.setWaiState(this.focusNodeMax, "valuenow", actValue[1]);
		
			this.value.sort(this._isReversed() ? sortReversed : sortForward);
			
			// not calling the _setValueAttr-function of dijit.form.Slider, but the super-super-class (needed for the onchange-event!)
			dijit.form._FormValueWidget.prototype._setValueAttr.apply(this, arguments);
			this._printSliderBar(priorityChange, isMaxVal);
		},
	
		_printSliderBar: function(priorityChange, isMaxVal){
			var percentMin = (this.value[0] - this.minimum) / (this.maximum - this.minimum);
			var percentMax = (this.value[1] - this.minimum) / (this.maximum - this.minimum);
			var percentMinSave = percentMin;
			if(percentMin > percentMax){
				percentMin = percentMax;
				percentMax = percentMinSave;
			}
			var sliderHandleVal = this._isReversed() ? ((1-percentMin)*100) : (percentMin * 100);
			var sliderHandleMaxVal = this._isReversed() ? ((1-percentMax)*100) : (percentMax * 100);
			var progressBarVal = this._isReversed() ? ((1-percentMax)*100) : (percentMin * 100);
			if (priorityChange && this.slideDuration > 0 && this.progressBar.style[this._progressPixelSize]){
				// animate the slider
				var percent = isMaxVal ? percentMax : percentMin;
				var _this = this;
				var props = {};
				var start = parseFloat(this.progressBar.style[this._handleOffsetCoord]);
				var duration = this.slideDuration / 10; // * (percent-start/100);
				if(duration === 0){ return; }
				if(duration < 0){ duration = 0 - duration; }
				var propsHandle = {};
				var propsHandleMax = {};
				var propsBar = {};
				// hui, a lot of animations :-)
				propsHandle[this._handleOffsetCoord] = { start: this.sliderHandle.style[this._handleOffsetCoord], end: sliderHandleVal, units:"%"};
				propsHandleMax[this._handleOffsetCoord] = { start: this.sliderHandleMax.style[this._handleOffsetCoord], end: sliderHandleMaxVal, units:"%"};
				propsBar[this._handleOffsetCoord] = { start: this.progressBar.style[this._handleOffsetCoord], end: progressBarVal, units:"%"};
				propsBar[this._progressPixelSize] = { start: this.progressBar.style[this._progressPixelSize], end: (percentMax - percentMin) * 100, units:"%"};
				var animHandle = dojo.animateProperty({node: this.sliderHandle,duration: duration, properties: propsHandle}); 
				var animHandleMax = dojo.animateProperty({node: this.sliderHandleMax,duration: duration, properties: propsHandleMax}); 
				var animBar = dojo.animateProperty({node: this.progressBar,duration: duration, properties: propsBar});
				var animCombine = dojo.fx.combine([animHandle, animHandleMax, animBar]);
				animCombine.play();
			}else{
				this.sliderHandle.style[this._handleOffsetCoord] = sliderHandleVal + "%";
				this.sliderHandleMax.style[this._handleOffsetCoord] = sliderHandleMaxVal + "%";
				this.progressBar.style[this._handleOffsetCoord] = progressBarVal + "%";
				this.progressBar.style[this._progressPixelSize] = ((percentMax - percentMin) * 100) + "%";
			}
		}
	});

	dojo.declare("dijit.form._SliderMoverMax", dijit.form._SliderMover, {	

		onMouseMove: function(e){
			var widget = this.widget;
			var abspos = widget._abspos;
			if(!abspos){
				abspos = widget._abspos = dojo.coords(widget.sliderBarContainer, true);
				widget._setPixelValue_ = dojo.hitch(widget, "_setPixelValue");
				widget._isReversed_ = widget._isReversed();
			}
			var pixelValue = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
			widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount]-pixelValue) : pixelValue, abspos[widget._pixelCount], false, true);
		},
	
		destroy: function(e){
			dojo.dnd.Mover.prototype.destroy.apply(this, arguments);
			var widget = this.widget;
			widget._abspos = null;
			widget._setValueAttr(widget.value, true);
		}
	});

	dojo.declare("dijit.form._SliderBarMover", dojo.dnd.Mover, {

		onMouseMove: function(e){
			var widget = this.widget;
			if(widget.disabled || widget.readOnly){ return; }
			var abspos = widget._abspos;
			var bar = widget._bar;
			var mouseOffset = widget._mouseOffset;
			if(!abspos){
				abspos = widget._abspos = dojo.coords(widget.sliderBarContainer, true);
				widget._setPixelValue_ = dojo.hitch(widget, "_setPixelValue");
				widget._getValueByPixelValue_ = dojo.hitch(widget, "_getValueByPixelValue");
				widget._isReversed_ = widget._isReversed();
			}
			
			if(!bar){
				bar = widget._bar = dojo.coords(widget.progressBar, true);
			}
			
			if(!mouseOffset){
				mouseOffset = widget._mouseOffset = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord] - bar[widget._startingPixelCount];
			}
			
			var pixelValueMin = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord] - mouseOffset,
				pixelValueMax = pixelValueMin + bar[widget._pixelCount];
				// we don't narrow the slider when it reaches the bumper!
				// maybe there is a simpler way
				pixelValues = [pixelValueMin, pixelValueMax]
			;

			pixelValues.sort(sortForward);

			if(pixelValues[0] <= 0){
				pixelValues[0] = 0;
				pixelValues[1] = bar[widget._pixelCount];
			}
			if(pixelValues[1] >= abspos[widget._pixelCount]){
				pixelValues[1] = abspos[widget._pixelCount];
				pixelValues[0] = abspos[widget._pixelCount] - bar[widget._pixelCount];
			}
			// getting the real values by pixel
			var myValues = [
				widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[0]) : pixelValues[0], abspos[widget._pixelCount]), 
				widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[1]) : pixelValues[1], abspos[widget._pixelCount])
			];
			// and setting the value of the widget
			widget._setValueAttr(myValues, false, false);
		},
	
		destroy: function(){
			dojo.dnd.Mover.prototype.destroy.apply(this, arguments);
			var widget = this.widget;
			widget._abspos = null;
			widget._bar = null;
			widget._mouseOffset = null;
			widget._setValueAttr(widget.value, true);
		}
	});

	dojo.declare("dojox.form.HorizontalRangeSlider",
		[dijit.form.HorizontalSlider, dojox.form._RangeSliderMixin],
		{
			// summary:
			// 	A form widget that allows one to select a range with two horizontally draggable images
			templateString: dojo.cache('dojox.form','resources/HorizontalRangeSlider.html')
		}
	);

	dojo.declare("dojox.form.VerticalRangeSlider",
		[dijit.form.VerticalSlider, dojox.form._RangeSliderMixin],
		{
			// summary:
			// 	A form widget that allows one to select a range with two vertically draggable images
			templateString: dojo.cache('dojox.form','resources/VerticalRangeSlider.html')
		}
	);

})();
