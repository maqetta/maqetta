define(["dojo/_base/declare", "./ScaleIndicatorBase", "dojox/gfx", "dojo/_base/event", "dojo/dom-geometry"],
	function(declare, ScaleIndicatorBase, gfx, eventUtil, domGeom){

	/*=====
     var ScaleIndicatorBase = dojox.dgauges.ScaleIndicatorBase;
     =====*/
	
	return declare("dojox.dgauges.RectangularValueIndicator", ScaleIndicatorBase, {
		//	summary:
		//		The rectangular value indicator, typically used for creating markers or thumbs.

		//	paddingLeft: Number
		//		The left padding.
		paddingLeft: 0,
		//	paddingTop: Number
		//		The top padding.
		paddingTop: 0,
		//	paddingRight: Number
		//		The right padding.
		paddingRight: 0,
		//	paddingBottom: Number
		//		The bottom padding.
		paddingBottom: 0,

		
		constructor: function(){
			this.addInvalidatingProperties(["paddingTop", "paddingLeft", "paddingRight", "paddingBottom"]);
		},
		
		refreshRendering: function(){
			this.inherited(arguments);

			// get position corresponding to the value
			var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
			var pos = this.scale.positionForValue(v);
			
			// computes offsets to move the indicator
			var dx = 0, dy = 0;
			var angle = 0;
			if(this.scale._gauge.orientation == "horizontal"){
				dx = pos;
				dy = this.paddingTop;
			}else{
				dx = this.paddingLeft;
				dy = pos;
				angle = 90;
			}
			
			// translate the indicator
			
			this._gfxGroup.setTransform([{
				dx: dx,
				dy: dy
			}, gfx.matrix.rotateg(angle)]);
		},
		
		_onMouseDown: function(event){
			this.inherited(arguments);
			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));

			// prevent the browser from selecting text
			eventUtil.stop(event);
		},
		
		_onMouseMove: function(event){
			this.inherited(arguments);
			
			var np = domGeom.position(this.scale._gauge.domNode, true);
			this.set("value", this.scale.valueForPosition({x: event.pageX - np.x, y: event.pageY - np.y}));
		}
	})
});
