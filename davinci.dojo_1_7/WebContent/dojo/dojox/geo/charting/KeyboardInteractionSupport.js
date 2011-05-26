
define(["dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","dojox/lang/functional"],
					function(dojo,declare,connect,dhtml,functional) {

return dojo.declare("dojox.geo.charting.KeyboardInteractionSupport", null, {
	// summary: 
	//   class to handle keyboard interactions on a dojox.geo.charting.Map widget
	//
	//	The sections on the leading edge should receive the focus in response to a TAB event. 
	//	Then use cursor keys to the peer sections. The cursor event should go the adjacent section 
	//	in that direction. With the focus, the section zooms in upon SPACE. The map should zoom out 
	//	on ESC. Finally, while it has the focus, the map should lose the focus on TAB.
	// tags:
	//   private
	_map: null,
	_zoomEnabled: false,
	
	constructor: function(map, options){
		// summary: 
		//   Constructs a new _KeyboardInteractionSupport instance
		// map: dojox.geo.charting.Map
		//   the Map widget this class provides touch navigation for.
		this._map = map;
		if(options){
			this._zoomEnabled = options.enableZoom;
		}
	},
	connect: function(){
		// summary: 
		//   connects this keyboard support class to the Map component
		var container = dojo.byId(this._map.container);
		//	tab accessing enable
		dojo.attr(container, {
			tabindex: 0,
			role: "presentation",
			"aria-label": "map"
		});
		// install listeners
		this._keydownListener = dojo.connect(container, "keydown", this, "keydownHandler");
		this._onFocusListener = dojo.connect(container, "focus", this, "onFocus");
		this._onBlurListener = dojo.connect(container, "blur", this, "onBlur");
	},
	disconnect: function(){
		// summary: 
		//   disconnects any installed listeners
		dojo.disconnect(this._keydownListener);
		this._keydownListener = null;
		dojo.disconnect(this._onFocusListener);
		this._onFocusListener = null;
		dojo.disconnect(this._onBlurListener);
		this._onBlurListener = null
	},
	keydownHandler: function(e){
		switch(e.keyCode){
			case dojo.keys.LEFT_ARROW:
				this._directTo(-1,-1,1,-1);
				break;
			case dojo.keys.RIGHT_ARROW:
				this._directTo(-1,-1,-1,1);
				break;
			case dojo.keys.UP_ARROW:
				this._directTo(1,-1,-1,-1);
				break;
			case dojo.keys.DOWN_ARROW:
				this._directTo(-1,1,-1,-1);
				break;
			case dojo.keys.SPACE:
				if(this._map.selectedFeature && !this._map.selectedFeature._isZoomIn && this._zoomEnabled){
					this._map.selectedFeature._zoomIn();
				}
				break;
			case dojo.keys.ESCAPE:
				if(this._map.selectedFeature && this._map.selectedFeature._isZoomIn && this._zoomEnabled){
					this._map.selectedFeature._zoomOut();
				}
				break;
			default:
				return;
		}
		dojo.stopEvent(e);
	},
	onFocus: function(e){
		// select the leading region at the map center
		if(this._map.selectedFeature || this._map.focused){return;}
		this._map.focused = true;
		var leadingRegion,
			needClick = false;
		if(this._map.lastSelectedFeature){
			leadingRegion = this._map.lastSelectedFeature;
		}else{
			var mapCenter = this._map.getMapCenter(),
				minDistance = Infinity;
			// find the region most closing to the map center
			functional.forIn(this._map.mapObj.features, function(feature){
				var distance = Math.sqrt(Math.pow(feature._center[0] - mapCenter.x, 2) + Math.pow(feature._center[1] - mapCenter.y, 2));
				if(distance < minDistance){
					minDistance = distance;
					leadingRegion = feature;
				}
			});
			needClick = true;
		}
		if(leadingRegion){
//			this._map.deselectAll();
			if(needClick) {
				leadingRegion._onclickHandler(null);
			}else{
//				leadingRegion.select(true);
			}
			this._map.mapObj.marker.show(leadingRegion.id);
//			leadingRegion.select(true);
		}
	},
	onBlur: function(){
		this._map.lastSelectedFeature = this._map.selectedFeature;
//		this._map.mapObj.marker.hide();
//		this._map.deselectAll();
	},
	_directTo: function(up,down,left,right){
		var currentSelected = this._map.selectedFeature,
		centerX = currentSelected._center[0],
		centerY = currentSelected._center[1],
		minMargin = Infinity,
		nextSelected = null;
		functional.forIn(this._map.mapObj.features, function(feature){
			var paddingX = Math.abs(centerX - feature._center[0]),
			paddingY = Math.abs(centerY - feature._center[1]),
			paddingSum = paddingX + paddingY;
			if((up - down) * (centerY - feature._center[1]) > 0){
				if(paddingX < paddingY && minMargin > paddingSum){
					minMargin = paddingSum;
					nextSelected = feature;
				}
			}
			if((left - right) * (centerX - feature._center[0]) > 0){
				if(paddingX > paddingY && minMargin > paddingSum){
					minMargin = paddingSum;
					nextSelected = feature;
				}
			}
		});
		if(nextSelected){
			this._map.mapObj.marker.hide();
//			this._map.deselectAll();
			nextSelected._onclickHandler(null);
			this._map.mapObj.marker.show(nextSelected.id);
//			nextSelected.select(true);

		}
	}
});
});