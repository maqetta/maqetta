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
//	stripConsole: "normal",

	selectorEngine: "lite",

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
				"../dijit/dijit.js"
			],
			dependencies: [
				"davinci.davinci"
			]
		},
		{
			name: "../davinci/ve/themeEditor/ThemeEditor.js",
			layerDependencies: [
			    "../dijit/dijit.js",
				"../davinci/davinci.js"
			],
			dependencies: [
			    "davinci.ve.themeEditor.ThemeEditor"
			]
		},
		{
			name: "../davinci/review/editor/ReviewEditor.js",
			layerDependencies: [
			    "../dijit/dijit.js",
				"../davinci/davinci.js"
			],
			dependencies: [
			    "davinci.review.editor.ReviewEditor"
			]
		},
		{
			name: "../davinci/review/view/CommentView.js",
			layerDependencies: [
			    "../dijit/dijit.js",
				"../davinci/davinci.js"
			],
			dependencies: [
				"davinci.review.view.CommentView"
			]
		},
		{
			name: "../davinci/review/view/CommentExplorerView.js",
			layerDependencies: [
			    "../dijit/dijit.js",
				"../davinci/davinci.js"
			],
			dependencies: [
				"davinci.review.view.CommentExplorerView"
			]
		},
		{
			name: "../preview/singlepreview.js",
			dependencies: [
			    "preview.singlepreview"
			]
		}
	],

	prefixes: [
		[ "system", "../system" ],
		[ "preview", "../preview" ],
		[ "orion", "../orion" ],
		[ "davinci", "../davinci" ],
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
};
