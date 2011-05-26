// dojo.provide allows pages to use all of the types declared in this resource.
//dojo.provide("dojox.geo.openlayers.tests.mobile.goto.NavigationControl");

//dojo.require("dojox.mobile.IconContainer");
//dojo.require("dojox.mobile.Button");

define([ "dojox/mobile/IconContainer", "dojox/mobile/Button" ], function(ic, but){
	return dojo.declare("dojox.geo.openlayers.tests.mobile.goto.NavigationControl",
			[ OpenLayers.Control ], {
				constructor : function(options, element){
					OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
					this._element = null;
				},

				draw : function(){
					OpenLayers.Control.prototype.draw.apply(this, arguments);
					if (!this._element) {

						var div = dojo.create("div", {}, this.div);
						var b = new dojox.mobile.Button({
							label : "+"
						}, div);
						b.startup();
						var d = b.domNode;
						dojo.style(d, {
							position : "absolute",
							left : 20 + "px",
							top : 10 + "px",
							fontFamily : "Helvetica",
							fontSize : 20 + "px",
							width : 40 + "px",
							height : 27 + "px",
							textAlign : "center",
							verticalAlign : "baseline"
						});
						dojo.connect(d, "touchstart", this, this.zoomIn);
						dojo.connect(d, "onclick", this, this.zoomIn);

						div = dojo.create("div", {}, this.div);

						b = new dojox.mobile.Button({
							label : "-"
						}, div);
						b.startup();
						d = b.domNode;
						dojo.style(d, {
							position : "absolute",
							left : 90 + "px",
							top : 10 + "px",
							fontFamily : "Helvetica",
							fontSize : 20 + "px",
							width : 40 + "px",
							height : 27 + "px",
							textAlign : "center",
							verticalAlign : "baseline"
						});
						dojo.connect(d, "touchstart", this, this.zoomOut);
						dojo.connect(d, "onclick", this, this.zoomOut);

						this._element = this.div;

					}
					return this.div;
				},

				log : function(s){
					var t = document.createTextNode(s);
					this._element.appendChild(t);
				},

				setVisible : function(v){
					var d = this.div;
					dojo.style(d, {
						'visibility' : (v ? 'visible' : 'hidden')
					});
				},

				zoomIn : function(e){
					dojo.stopEvent(e);
					this.map.zoomIn();
				},

				zoomOut : function(e){
					dojo.stopEvent(e);
					this.map.zoomOut();
				}

			});
});
