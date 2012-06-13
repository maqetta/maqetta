dependencies = {
	selectorEngine: "acme",

	layers: [
		{
			name: "../gridx/Grid.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"gridx/Grid",
				"gridx/core/model/cache/Sync",
				"gridx/core/model/cache/Async",
				"gridx/modules/extendedSelect/Column",
    			"gridx/modules/move/Column",
    			"gridx/modules/dnd/Column",
    			"gridx/modules/ColumnResizer",
			]
		},
		{
			name: "../metadata/gridx/GridHelper.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/gridx/GridHelper",
				"metadata/gridx/GridCreateTool",
				"metadata/gridx/GridWizardInput"
			]
		}
	],

	prefixes: [
		[ "gridx", "../gridx" ],
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ]
	]
}
