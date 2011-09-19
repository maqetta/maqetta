dojo.provide("dojox.charting.themes.ThreeD");

dojo.require("dojo.colors"); // for dojo.Color.sanitize()
dojo.require("dojox.charting.Theme");
dojo.require("dojox.charting.themes.gradientGenerator");

dojo.require("dojox.charting.themes.PrimaryColors"); // as a baseline theme

(function(){
	var dc = dojox.charting, themes = dc.themes, Theme = dc.Theme,
		gi = themes.gradientGenerator.generateGradientByIntensity,
		colors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"],	// the same is in PrimaryColors
		defaultFill = {type: "linear", space: "shape", x1: 0, y1: 0, x2: 100, y2: 0},
		// 3D cylinder map is calculated using dojox.gfx3d
		cyl3dMap = [
			{o: 0.00, i: 174}, {o: 0.08, i: 231}, {o: 0.18, i: 237}, {o: 0.30, i: 231},
			{o: 0.39, i: 221}, {o: 0.49, i: 206}, {o: 0.58, i: 187}, {o: 0.68, i: 165},
			{o: 0.80, i: 128}, {o: 0.90, i: 102}, {o: 1.00, i: 174}
		],
		hiliteIndex = 2, hiliteIntensity = 100, lumStroke = 50,
		cyl3dFills = dojo.map(colors, function(c){
			var fill = dojo.delegate(defaultFill),
				colors = fill.colors = themes.gradientGenerator.generateGradientByIntensity(c, cyl3dMap),
				hilite = colors[hiliteIndex].color;
			// add highlight
			hilite.r += hiliteIntensity;
			hilite.g += hiliteIntensity;
			hilite.b += hiliteIntensity;
			hilite.sanitize();
			return fill;
		});

	themes.ThreeD = themes.PrimaryColors.clone();
	themes.ThreeD.series.shadow = {dx: 1, dy: 1, width: 3, color: [0, 0, 0, 0.15]};

	themes.ThreeD.next = function(elementType, mixin, doPost){
		if(elementType == "bar" || elementType == "column"){
			// custom processing for bars and columns: substitute fills
			var index = this._current % this.seriesThemes.length,
				s = this.seriesThemes[index], old = s.fill;
			s.fill = cyl3dFills[index];
			var theme = Theme.prototype.next.apply(this, arguments);
			// cleanup
			s.fill = old;
			return theme;
		}
		return Theme.prototype.next.apply(this, arguments);
	};
})();
