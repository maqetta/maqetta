dependencies = {
	//Strip all console.* calls except console.warn and console.error. This is basically a work-around
	//for trac issue: http://bugs.dojotoolkit.org/ticket/6849 where Safari 3's console.debug seems
	//to be flaky to set up (apparently fixed in a webkit nightly).
	//But in general for a build, console.warn/error should be the only things to survive anyway.
//	stripConsole: "normal",

	layers: [
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
			name: "../dojox/grid/DataGrid.js",
			dependencies: [
				"dojox.grid.DataGrid"
			]
		},
		{
			name: "../davinci/davinci-common.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"davinci.davinci-common"
			]
		},
		{
			name: "../davinci/davinci.js",
			layerDependencies: [
				"../davinci/davinci-common.js"
			],
			dependencies: [
				"davinci.davinci"
			]
		},
		{
			name: "../davinci/ve/themeEditor/ThemeEditor.js",
			layerDependencies: [
				"../davinci/davinci.js"
			],
			dependencies: [
			    "davinci.ve.themeEditor.ThemeEditor"
			]
		}
	],

	prefixes: [
		[ "preview", "../preview" ],
		[ "workspace", "../workspace" ],
		[ "eclipse", "../eclipse" ],
		[ "davinci", "../davinci" ],
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
