
define([ "dojo/_base/connect", "dojo/_base/html", "dojox/gfx", "dojox/gfx/_base",
		"dojox/gfx/shape", "dojox/gfx/path", "dojox/geo/openlayers/Feature",
		"dojox/geo/openlayers/Layer" ], function(connectArg, htmlArg, gfxArg, gbaseArg, shapeArg,
		pathArg, featureArg, layerArg){

	return dojo.declare("dojox.geo.openlayers.GfxLayer", dojox.geo.openlayers.Layer, {
		//	summary: 
		//		A layer dedicated to render dojox.geo.openlayers.GeometryFeature
		//	description:
		//		A layer class for rendering geometries as dojox.gfx.Shape objects.
		//		This layer class accepts Features which encapsulates graphic objects to be added to the map.
		//	All objects should be added to this group.
		//	tags:
		//		private
		_viewport : null,

		constructor : function(name, options){
			//	summary:
			//		Constructs a new GFX layer.
			var s = dojox.gfx.createSurface(this.olLayer.div, 100, 100);
			this._surface = s;
			if (options && options.viewport)
				this._viewport = options.viewport;
			else
				this._viewport = s.createGroup();
			dojo.connect(this.olLayer, "onMapResize", this, "onMapResize");
			this.olLayer.getDataExtent = this.getDataExtent;
		},

		getViewport : function(){
			//	summary:
			//		Gets the viewport
			//	tags:
			//		internal
			return this._viewport;
		},

		setViewport : function(g){
			//	summary:
			//		Sets the viewport
			//	g: dojox.gfx.Group
			//	tags:
			//		internal
			if (this._viewport)
				this._viewport.removeShape();
			this._viewport = g;
			this._surface.add(g);
		},

		onMapResize : function(){
			//	summary:
			//		Called when map is resized.
			//	tag:
			//	protected
			this._surfaceSize();
		},

		setMap : function(map){
			//	summary:
			//		Sets the map for this layer.
			//	tag:
			//		protected
			this.inherited(arguments);
			this._surfaceSize();
		},

		getDataExtent : function(){
			//	summary:
			//		Get data extent
			//	tags:
			//		private
			var ret = this._surface.getDimensions();;
			return ret;
		},
		getSurface : function(){
			//	summary:
			//		Get the underlying dojox.gfx.Surface
			//	returns: dojox.gfx.Surface 
			//		The dojox.gfx.Surface this layer uses to draw its GFX rendering.
			return this._surface;
		},

		_surfaceSize : function(){
			//	summary:
			//		Recomputes the surface size when being resized.
			//	tags:
			//		private
			var s = this.olLayer.map.getSize();
			this._surface.setDimensions(s.w, s.h);
		},

		moveTo : function(event){
			// summary:
			//   Called when this layer is moved or zoommed.
			//	event:
			//		The event
			var s = dojo.style(this.olLayer.map.layerContainerDiv);
			var left = parseInt(s.left);
			var top = parseInt(s.top);

			if (event.zoomChanged || left || top) {
				var d = this.olLayer.div;
				dojo.style(d, {
					left : -left + "px",
					top : -top + "px"
				});

				if (this._features == null)
					return;
				var vp = this.getViewport();

				vp.setTransform(dojox.gfx.matrix.translate(left, top));

				this.inherited(arguments);

				//			if (event.zoomChanged) {
				//				dojo.forEach(this._features, function(f){
				//					this.renderFeature(f);
				//				}, this);
				//			}
			}
		},

		added : function(){
			//	summary:
			//		Called when added to a map.
			this.inherited(arguments);
			this._surfaceSize();
		}

	});
});
