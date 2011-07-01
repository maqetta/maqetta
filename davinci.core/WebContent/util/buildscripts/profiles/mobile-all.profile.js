dependencies = {
	stripConsole: "normal",

	layers: [
		{
			name: "dojo.js",
			customBase: true,
			dependencies: [
				"dojo._base.declare",
				"dojo._base.lang",
				"dojo._base.array",
				"dojo._base.window",
				"dojo._base.event",
				"dojo._base.connect",
				"dojo._base.html",
				"dijit._WidgetBase",
				"dijit._base.manager",
				"dojox.mobile.parser",
				"dojox.mobile"
			]
		},
		{
			name: "../dojox/mobile/compat.js",
			dependencies: [
				"dijit._base.sniff",
				"dojo._base.fx",
				"dojox.mobile.compat"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
