define([
	"dojo/dom-class",
	"dojo/dom-construct",
], function(domClass, domConstruct){

	// Attaches a load indicator to a window using the Dojo AMD loader
	// and takes it away when modules are done loading

	return function(win, icon, color) {
		// Post and take down loading indicator
		win.onload = function(e){
			var win = e.currentTarget,
				previewDoc = e.target;

			if (win["require"]) {
				domClass.add(previewDoc.body, "loading");
				var spinner = domConstruct.create("style", null, previewDoc.head);
				spinner.innerText = ".loading{background: url('"
					+ icon + "') no-repeat center " + color + "}";
				win["require"]("dojo/ready")(function(){
					domClass.remove(previewDoc.body, "loading");
					spinner.parentNode.removeChild(spinner);
				});				
			}
		};
	};
});
