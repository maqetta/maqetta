require({
	aliases:[
	    ["i18n", "dojo/i18n"]
	]
});

dependencies = {
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
		}
	],

	prefixes: [
	   		[ "gridx", "../gridx" ],
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
