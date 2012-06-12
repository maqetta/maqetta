dependencies = {
	selectorEngine: "acme",

	layers: [
		{
			name: "../shapes/_CircleMixin.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"shapes/_CircleMixin"
			]
		},
		{
			name: "../metadata/shapes/_ShapeHelper.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/shapes/_ShapeHelper"
			]
		}
	],

	prefixes: [
		[ "shapes", "../shapes" ],
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ]
	]
}
