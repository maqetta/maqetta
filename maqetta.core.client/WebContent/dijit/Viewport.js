define([
	"dojo/Evented",
	"dojo/on",
	"dojo/ready",
	"dojo/_base/window", // global
	"dojo/window" // getBox()
], function(Evented, on, ready, win, winUtils){

	// module:
	//		dijit/Viewport
	// summary:
	//		Utility singleton to watch for viewport resizes, avoiding duplicate notifications
	//		which can lead to infinite loops.
	//
	//		Usage: Viewport.on("resize", myCallback).
	//
	//		myCallback() is called without arguments in case it's _WidgetBase.resize(),
	//		which would interpret the argument as the size to make the widget.

	var Viewport = new Evented();

	ready(200, function(){
		var oldBox = winUtils.getBox();
		Viewport._rlh = on(win.global, "resize", function(){
			var newBox = winUtils.getBox();
			if(oldBox.h == newBox.h && oldBox.w == newBox.w){ return; }
			oldBox = newBox;
			Viewport.emit("resize");
		});
	});

	return Viewport;
});
