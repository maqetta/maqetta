require({
	aliases:[
	    ["i18n", "dojo/i18n"]
	]
});

dependencies = {
	layers: [
		//No need to specify any layers for now. Mostly interested in minificiation and inlining of metadata (e.g., helper) files.
	],

	prefixes: [
		[ "metadata", "../metadata" ],
		[ "dijit", "../dijit" ],
		[ "davinci", "../davinci" ],
		[ "dojox", "../dojox" ],
		[ "system", "../system" ],
		[ "preview", "../preview" ],
		[ "orion", "../orion" ]
	]
}
