dependencies = {
	selectorEngine: "acme",

	layers: [
		{
			name: "../clipart/_clipart.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"clipart/_clipart"
			]
		},
		{
			name: "../metadata/clipart/_DeviceClipartHelper.js",
			layerDependencies: [
			    "../dijit/dijit.js"
			],
			dependencies: [
				"metadata/clipart/_DeviceClipartHelper"
			]
		}
	],

	prefixes: [
		[ "clipart", "../clipart" ],
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ]
	]
}
