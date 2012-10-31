dependencies = {
	selectorEngine: "acme",

	layers: [
		{
			name: "../metadata/dojo/data/DataStoreBasedWidgetInput.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/dojo/data/DataStoreBasedWidgetInput",
				"metadata/dojo/data/ItemFileReadStoreHelper"
			]
		},
		{
			name: "../metadata/dojox/grid/DataGridInput.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/dojox/grid/DataGridInput",
				"metadata/dojox/grid/DataGridCreateTool"
			]
		}
	],

	prefixes: [
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ]
	]
}
