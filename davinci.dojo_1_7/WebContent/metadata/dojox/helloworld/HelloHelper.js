dojo.provide("davinci.libraries.dojo.dojox.helloworld.HelloHelper");

dojo.declare("davinci.libraries.dojo.dojox.helloworld.HelloHelper", null, {
	
	create: function(widget, srcElement){
		// A sample action within a helper function.
		widget.domNode.style.padding = '10px';
	}
});
