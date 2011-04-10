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
				"dijit._Widget",
				"dijit._base.manager",
				"dijit._base.sniff",
				"dojox.mobile.parser",
				"dojox.mobile"
			]
		},
		{
			name: "../dojox/mobile/compat.js",
			dependencies: [
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
