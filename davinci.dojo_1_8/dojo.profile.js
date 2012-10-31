require({
	aliases:[
	    ["i18n", "dojo/i18n"]
	]
});

dependencies = {
	//Strip all console.* calls except console.warn and console.error. This is basically a work-around
	//for trac issue: http://bugs.dojotoolkit.org/ticket/6849 where Safari 3's console.debug seems
	//to be flaky to set up (apparently fixed in a webkit nightly).
	//But in general for a build, console.warn/error should be the only things to survive anyway.
	stripConsole: "normal",

	selectorEngine:"acme",

	layers: [
		{
			name: "dojo.js",
			dependencies: [
				"dojo.loadInit",
				"dojo.text",
				"dojo.i18n"
			]
		},
		{
			name: "../dijit/dijit.js",
			dependencies: [
				"dijit.dijit"
			]
		},
		{
			name: "../dijit/dijit-all.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.dijit-all"
			]
		},
		{
			name: "../dojox/gfx.js",
			dependencies: [
				"dojox.gfx"
			]
		},
		{
			name: "../dojox/mobile.js",
			dependencies: [
				"dojox.mobile"
			]
		},
		{
			name: "../dojox/mobile/compat.js",
			dependencies: [
				"dojox.mobile.compat"
			]
		}
	],

	prefixes: [
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ],
		[ "davinci", "../davinci" ],
		[ "dojox", "../dojox" ],
		[ "system", "../system" ],
		[ "preview", "../preview" ],
		[ "orion", "../orion" ]
	]
}
