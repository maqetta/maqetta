dojo.provide("dojox.gfx.attach");

dojo.require("dojox.gfx");

// rename an attacher conditionally

(function(){
	var r = dojox.gfx.svg.attach[dojox.gfx.renderer];
	dojo.gfx.attachSurface = r.attachSurface;
	dojo.gfx.attachNode = r.attachNode;
})();
