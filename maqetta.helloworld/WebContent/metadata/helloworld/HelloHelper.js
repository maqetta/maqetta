dojo.provide("davinci.libraries.helloworld.helloworld.HelloHelper");

dojo.declare("davinci.libraries.helloworld.helloworld.HelloHelper", null, {
	
	create: function(widget, srcElement){
		// A sample action within a helper function.
		widget.domNode.style.padding = '10px';
	}
});
