dojo.provide("dijit.ColorPalette");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.colors");
dojo.require("dojo.i18n");

dojo.require("dijit._PaletteMixin");

dojo.requireLocalization("dojo", "colors");

dojo.declare("dijit.ColorPalette",
	[dijit._Widget, dijit._Templated, dijit._PaletteMixin],
	{
	// summary:
	//		A keyboard accessible color-picking widget
	// description:
	//		Grid showing various colors, so the user can pick a certain color.
	//		Can be used standalone, or as a popup.
	//
	// example:
	// |	<div dojoType="dijit.ColorPalette"></div>
	//
	// example:
	// |	var picker = new dijit.ColorPalette({ },srcNode);
	// |	picker.startup();


	// palette: String
	//		Size of grid, either "7x10" or "3x4".
	palette: "7x10",

	// _palettes: [protected] Map
	// 		This represents the value of the colors.
	//		The first level is a hashmap of the different palettes available.
	//		The next two dimensions represent the columns and rows of colors.
	_palettes: {
		"7x10":	[["white", "seashell", "cornsilk", "lemonchiffon","lightyellow", "palegreen", "paleturquoise", "lightcyan",	"lavender", "plum"],
				["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"],
				["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", 	"skyblue", "mediumslateblue","orchid"],
				["gray", "red", "orangered", "darkorange", "yellow", "limegreen", 	"darkseagreen", "royalblue", "slateblue", "mediumorchid"],
				["dimgray", "crimson", 	"chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"],
				["darkslategray","firebrick","saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue","darkslateblue", "darkmagenta" ],
				["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", 	"purple"]],

		"3x4": [["white", "lime", "green", "blue"],
			["silver", "yellow", "fuchsia", "navy"],
			["gray", "red", "purple", "black"]]
	},

	// _imagePaths: [protected] Map
	//		This is stores the path to the palette images
	_imagePaths: {
		"7x10": dojo.moduleUrl("dijit.themes", "a11y/colors7x10.png"),
		"3x4": dojo.moduleUrl("dijit.themes", "a11y/colors3x4.png"),
		"7x10-rtl": dojo.moduleUrl("dijit.themes", "a11y/colors7x10-rtl.png"),
		"3x4-rtl": dojo.moduleUrl("dijit.themes", "a11y/colors3x4-rtl.png")
	},

	// templateString: String
	//		The template of this widget.
	templateString: dojo.cache("dijit", "templates/ColorPalette.html"),

	baseClass: "dijitColorPalette",

	dyeClass: 'dijit._Color',

	buildRendering: function(){
		// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
		// <img> nodes

		this.inherited(arguments);

		this.imageNode.setAttribute("src", this._imagePaths[this.palette + (this.isLeftToRight() ? "" : "-rtl")].toString());

		var i18nColorNames = dojo.i18n.getLocalization("dojo", "colors", this.lang);
		this._preparePalette(
			this._palettes[this.palette],
			i18nColorNames
		);
	}
});

dojo.declare("dijit._Color", dojo.Color,
	// summary:
	//		Object associated with each cell in a ColorPalette palette.
	//		Implements dijit.Dye.
	{
		constructor: function(/*String*/alias){
			this._alias = alias;
			this.setColor(dojo.Color.named[alias]);
		},

		getValue: function(){
			// summary:
			//		Note that although dijit._Color is initialized with a value like "white" getValue() always
			//		returns a hex value
			return this.toHex();
		},

		fillCell: function(/*DOMNode*/ cell, /*String*/ blankGif){
			dojo.create("img", {
				src: blankGif,
				"class": "dijitPaletteImg",
				alt: this._alias
			}, cell);
		}
	}
);
