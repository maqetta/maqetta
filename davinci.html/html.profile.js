dependencies = {
	selectorEngine: "acme",

	layers: [
		{
			name: "../metadata/html/FieldsetInput.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/html/FieldsetInput"
			]
		}
	],

	prefixes: [
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ]
	]
}
