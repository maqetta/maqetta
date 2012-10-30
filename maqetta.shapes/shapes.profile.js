require({
	aliases:[
	    ["i18n", "dojo/i18n"]
	]
});

dependencies = {
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
		[ "maq-metadata-dojo", "../maq-metadata-dojo" ],
	   	[ "system", "../system" ],
	   	[ "preview", "../preview" ],
	   	[ "orion", "../orion" ],
	   	[ "davinci", "../davinci" ],
	   	[ "dijit", "../dijit" ],
	   	[ "dojox", "../dojox" ]
	]
}
