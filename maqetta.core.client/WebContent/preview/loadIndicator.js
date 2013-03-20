define([
	"dojo/dom-class",
	"dojo/dom-construct",
    "dojo/on"
], function(domClass, domConstruct, on){

	// Attaches a load indicator to a window using the Dojo AMD loader
	// and takes it away when modules are done loading

	return function(win, icon, color) {
		var spinner;
		// Post and take down loading indicator
		return [
			on(win, "DOMContentLoaded", function(e) {
				var win = e.currentTarget,
					previewDoc = e.target;
	
				console.log("preview/loadIndicator: DOMContentLoaded, require = " + win["require"]);
				if (win["require"]) {
					domClass.add(previewDoc.body, "loading");
					spinner = domConstruct.create("style", null, previewDoc.head);
					spinner.innerText = ".loading{background: url('"
						+ icon + "') no-repeat center " + color + "}";
					console.log("preview/loadIndicator: post indicator");
					win["require"](["dojo/ready"], function() {
						domClass.remove(previewDoc.body, "loading");
						spinner.parentNode.removeChild(spinner);
						console.log("preview/loadIndicator: remove indicator");
					});
				}
			}),
			on(win, "error", function(e) {
				var message = "An error has occurred while previewing " + e.filename + ": " + e.message;
				console.error(message);
	//			e.target.console.error(message);
	//			domClass.remove(e.target.document.body, "loading");
	//			domClass.add(e.target.document.body, "error");
				if (spinner) {
					spinner.parentNode.removeChild(spinner);
				}
			})
		];
	};
});
