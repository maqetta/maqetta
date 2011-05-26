define(["./gfx/_base", "./gfx/renderer!"], function(base, renderer){
	var gfx = dojo.getObject("gfx", true, dojox);
	gfx.switchTo(renderer);
	return gfx;
});
