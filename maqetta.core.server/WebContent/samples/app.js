/*
 * This file is provided for custom JavaScript logic that your HTML files might need.
 * Maqetta includes this JavaScript file by default within HTML pages authored in Maqetta.
 */
window.addEventListener("load", function(){		// Browser load event: browser is ready
	if(dojo && dojo.ready){						// See if dojo toolkit has been included
		dojo.ready(function(){					// dojo ready event: dojo is ready
			// logic that requires that Dojo is fully initialized should go here
		});
	}
});
