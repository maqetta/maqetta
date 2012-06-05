dependencies = {
	//Strip all console.* calls except console.warn and console.error. This is basically a work-around
	//for trac issue: http://bugs.dojotoolkit.org/ticket/6849 where Safari 3's console.debug seems
	//to be flaky to set up (apparently fixed in a webkit nightly).
	//But in general for a build, console.warn/error should be the only things to survive anyway.
    //	stripConsole: "normal",

	selectorEngine: "acme",

	layers: [
		{
			name: "../gridx/gridx-all.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"gridx/Grid",
				"gridx/core/model/cache/Sync",
				"gridx/core/model/cache/Async"
			]
		}
	],

	prefixes: [
		[ "gridx", "../gridx" ],
		[ "dijit", "../dijit" ]
	]
}
