require({
	aliases:[
	    ["i18n", "dojo/i18n"]
	]
});

dependencies = {
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
		[ "maq-metadata-dojo", "../maq-metadata-dojo" ],
	   	[ "system", "../system" ],
	   	[ "preview", "../preview" ],
	   	[ "orion", "../orion" ],
	   	[ "davinci", "../davinci" ],
	   	[ "dijit", "../dijit" ],
	   	[ "dojox", "../dojox" ]
	]
}
