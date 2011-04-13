//This profile is used just to illustrate the layout of a layered build.
//All layers have an implicit dependency on dojo.js.

//Normally you should not specify a layer object for dojo.js. It is normally
//implicitly built containing the dojo "base" functionality (dojo._base).
//However, if you prefer the Dojo 0.4.x build behavior, you can specify a
//"dojo.js" layer to get that behavior. It is shown below, but the normal
//0.9 approach is to *not* specify it.

//

dependencies = {
	layers: [
		{
			//For 0.9 you normally do not specify a dojo.js layer.
			//Note that you do not need to specify dojo.js as a dependency for
			//other layers -- it is always an implicit dependency.
			name: "dojo.js",
			dependencies: [
				"dojo.parser"
			]
		},
		{
			//This layer will be discarded, it is just used
			//to specify some modules that should not be included
			//in a later layer, but something that should not be
			//saved as an actual layer output. The important property
			//is the "discard" property. If set to true, then the layer
			//will not be a saved layer in the release directory.
			name: "string.discard",
			resourceName: "string.discard",
			discard: true,
			//Path to the copyright file must be relative to
			//the util/buildscripts directory, or an absolute path.
			copyrightFile: "myCopyright.txt",
			dependencies: [
				"dojo.string"
			]
		},
		{
			name: "../dijit/dijit.js",
			resourceName: "dijit.dijit",
			layerDependencies: [
			"string.discard"
			],
			dependencies: [
				"dijit.dijit"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}

//If you choose to optimize the JS files in a prefix directory (via the optimize= build parameter),
//you can choose to have a custom copyright text prepended to the optimized file. To do this, specify
//the path to a file tha contains the copyright info as the third array item in the prefixes array. For
//instance:
//	prefixes: [
//		[ "mycompany", "/path/to/mycompany", "/path/to/mycompany/copyright.txt"]
//	]
//
//	If no copyright is specified in this optimize case, then by default, the dojo copyright will be used.
