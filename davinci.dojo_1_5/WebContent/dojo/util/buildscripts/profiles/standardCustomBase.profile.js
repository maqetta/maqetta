dependencies = {
	layers: [
		{
			name: "dojo.js",
			customBase: true,
			dependencies: [
			]
		},
		{
			name: "_base.js",
			customBase: true,
			layerDependencies: [
				"dojo.js"
			],
			dependencies: [
				"dojo._base"
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
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
