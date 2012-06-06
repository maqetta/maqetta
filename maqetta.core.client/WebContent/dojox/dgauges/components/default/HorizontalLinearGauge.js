define([
		"dojo/_base/lang", 
		"dojo/_base/declare", 
		"dojo/_base/connect", 
		"dojo/_base/Color", 
		"../utils",
		"../../RectangularGauge", 
		"../../LinearScaler", 
		"../../RectangularScale", 
		"../../RectangularValueIndicator", 
		"../../TextIndicator",
		"../DefaultPropertiesMixin"
	], 
	function(lang, declare, connect, Color, utils, RectangularGauge, LinearScaler, RectangularScale, RectangularValueIndicator, TextIndicator, DefaultPropertiesMixin){

	/*=====
	var RectangularGauge = dojox.dgauges.RectangularGauge;
	=====*/
	
	return declare("dojox.dgauges.components.default.HorizontalLinearGauge", [RectangularGauge, DefaultPropertiesMixin], {
		//	borderColor:
		//		The border color. Default is "#C9DFF2".
		borderColor: "#C9DFF2",
		//	fillColor:
		//		The background color. Default is "#FCFCFF".
		fillColor: "#FCFCFF",
		//	indicatorColor:
		//		The indicator fill color. Default is "#F01E28".
		indicatorColor: "#F01E28",
		constructor: function(){
			
			// Base colors
			this.borderColor = new Color(this.borderColor);
			this.fillColor = new Color(this.fillColor);
			this.indicatorColor = new Color(this.indicatorColor);
			
			// Draw background
			this.addElement("background", lang.hitch(this, this.drawBackground));
			
			// Scaler			
			var scaler = new LinearScaler();
			
			// Scale
			var scale = new RectangularScale();
			scale.set("scaler", scaler);
			scale.set("labelPosition", "trailing");
			scale.set("paddingTop", 15);
			scale.set("paddingRight", 23);
			
			this.addElement("scale", scale);
			
			// Value indicator
			var indicator = new RectangularValueIndicator();			
			indicator.indicatorShapeFunc = lang.hitch(this, function(group){
				var indic = group.createPolyline([0, 0, 10, 0, 0, 10, -10, 0, 0, 0]).setStroke({
					color: "blue",
					width: 0.25
				}).setFill(this.indicatorColor);
				
				return indic;
			});
			indicator.set("paddingTop", 5);
			indicator.set("interactionArea", "gauge");
			scale.addIndicator("indicator", indicator);
			
			// Indicator Text Border
			this.addElement("indicatorTextBorder", lang.hitch(this, this.drawTextBorder), "leading");
			
			// Indicator Text
			var indicatorText = new TextIndicator();
			indicatorText.set("indicator", indicator);
			indicatorText.set("x", 32.5);
			indicatorText.set("y", 30);
			this.addElement("indicatorText", indicatorText);

		},
		
		drawBackground: function(g, w, h){
			h = 49;
			var gap = 0;
			var cr = 3;
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, -20), 0.1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: 0,
				y: 0,
				width: w,
				height: h,
				r: cr
			}).setFill(dojo.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries)).setStroke({
				color: "#A5A5A5",
				width: 0.2
			});
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
			gap = 4;
			cr = 2
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(dojo.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			gap = 6;
			cr = 1
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(dojo.mixin({
				type: "linear",
				x1: 0,
				y1: 0,
				x2: w,
				y2: h
			}, entries));
			
			gap = 7;
			cr = 0
			var entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(dojo.mixin({
				type: "linear",
				x1: w,
				y1: 0,
				x2: 0,
				y2: h
			}, entries));
			gap = 5;
			cr = 0
			var entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
			g.createRect({
				x: gap,
				y: gap,
				width: w - 2 * gap,
				height: h - 2 * gap,
				r: cr
			}).setFill(dojo.mixin({
				type: "radial",
				cx: w / 2,
				cy: 0,
				r: w
			}, entries)).setStroke({
				color: utils.brightness(this.fillColor, -40),
				width: 0.4
			});
			
		},
		drawTextBorder: function(g){
			return g.createRect({
				x: 5,
				y: 5,
				width: 60,
				height: 39
			}).setStroke({
				color: "#CECECE",
				width: 1
			});
		}
	});
});
