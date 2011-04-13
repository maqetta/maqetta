dependencies = {
	stripConsole: "normal",
	layers: [
		{
			name: "dojo.js",
			dependencies: [
				"dijit._Widget",
			]
		},
		{
			name: "../dojox/mobile.js",
			dependencies: [
				"dojox.mobile"
			]
		},
		{
			name: "../dojox/mobile/app.js",
			dependencies: [
				"dojox.mobile.app"
			]
		},
		{
			name: "../dojox/mobile/compat.js",
			dependencies: [
				"dojox.mobile.compat"
			]
		},
		{
			name: "../dojox/mobile/app/compat.js",
			dependencies: [
				"dojox.mobile.app.compat"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
