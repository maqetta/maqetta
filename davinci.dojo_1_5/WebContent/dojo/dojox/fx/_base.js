dojo.provide("dojox.fx._base");
// summary: Experimental and extended Animations beyond Dojo Core / Base functionality. 
//	Provides advanced Lines, Animations, and convenience aliases.
dojo.require("dojo.fx"); 

dojo.mixin(dojox.fx, {

	// anim: Function
	//	Alias of `dojo.anim` - the shorthand `dojo.animateProperty` with auto-play
	anim: dojo.anim,

	// animateProperty: Function
	//	Alias of `dojo.animateProperty` - animate any CSS property
	animateProperty: dojo.animateProperty,

	// fadeTo: Function 
	//		Fade an element from an opacity to an opacity.
	//		Omit `start:` property to detect. `end:` property is required.
	//		Ultimately an alias to `dojo._fade`
	fadeTo: dojo._fade,

	// fadeIn: Function
	//	Alias of `dojo.fadeIn` - Fade a node in.
	fadeIn: dojo.fadeIn,
	
	// fadeOut: Function
	//	Alias of `dojo.fadeOut` - Fades a node out.
	fadeOut: dojo.fadeOut,

	// combine: Function
	//	Alias of `dojo.fx.combine` - Run an array of animations in parallel
	combine: dojo.fx.combine,

	// chain: Function
	//	Alias of `dojo.fx.chain` - Run an array of animations in sequence
	chain: dojo.fx.chain,

	// slideTo: Function
	//	Alias of `dojo.fx.slideTo` - Slide a node to a defined top/left coordinate
	slideTo: dojo.fx.slideTo,

	// wipeIn: Function
	//	Alias of `dojo.fx.wipeIn` - Wipe a node to visible
	wipeIn: dojo.fx.wipeIn,

	// wipeOut: Function
	//	Alias of `dojo.fx.wipeOut` - Wipe a node to non-visible
	wipeOut: dojo.fx.wipeOut

});

dojox.fx.sizeTo = function(/* Object */args){
	// summary: 
	//		Creates an animation that will size a node
	//
	// description:
	//		Returns an animation that will size the target node
	//		defined in args Object about it's center to
	//		a width and height defined by (args.width, args.height), 
	//		supporting an optional method: chain||combine mixin
	//		(defaults to chain).	
	//
	//	- works best on absolutely or relatively positioned elements
	//	
	// example:
	//	|	// size #myNode to 400px x 200px over 1 second
	//	|	dojo.fx.sizeTo({
	//	|		node:'myNode',
	//	|		duration: 1000,
	//	|		width: 400,
	//	|		height: 200,
	//	|		method: "combine"
	//	|	}).play();
	//

	var node = args.node = dojo.byId(args.node),
		abs = "absolute";

	var method = args.method || "chain"; 
	if(!args.duration){ args.duration = 500; } // default duration needed
	if(method == "chain"){ args.duration = Math.floor(args.duration / 2); } 
	
	var top, newTop, left, newLeft, width, height = null;

	var init = (function(n){
		return function(){
			var cs = dojo.getComputedStyle(n),
				pos = cs.position,
				w = cs.width,
				h = cs.height
			;
			
			top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
			left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
			width = (w == "auto" ? 0 : parseInt(w));
			height = (h == "auto" ? 0 : parseInt(h));
			
			newLeft = left - Math.floor((args.width - width) / 2); 
			newTop = top - Math.floor((args.height - height) / 2); 

			if(pos != abs && pos != 'relative'){
				var ret = dojo.coords(n, true);
				top = ret.y;
				left = ret.x;
				n.style.position = abs;
				n.style.top = top + "px";
				n.style.left = left + "px";
			}
		}
	})(node);

	var anim1 = dojo.animateProperty(dojo.mixin({
		properties: {
			height: function(){
				init();
				return { end: args.height || 0, start: height };
			},
			top: function(){
				return { start: top, end: newTop };
			}
		}
	}, args));
	var anim2 = dojo.animateProperty(dojo.mixin({
		properties: {
			width: function(){
				return { start: width, end: args.width || 0 }
			},
			left: function(){
				return { start: left, end: newLeft }
			}
		}
	}, args));

	var anim = dojo.fx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
	return anim; // dojo.Animation

};

dojox.fx.slideBy = function(/* Object */args){
	// summary: 
	//		Returns an animation to slide a node by a defined offset.
	//
	// description:
	//		Returns an animation that will slide a node (args.node) from it's
	//		current position to it's current posision plus the numbers defined
	//		in args.top and args.left. standard dojo.fx mixin's apply. 
	//	
	// example:
	//	|	// slide domNode 50px down, and 22px left
	//	|	dojox.fx.slideBy({ 
	//	|		node: domNode, duration:400, 
	//	|		top: 50, left: -22 
	//	|	}).play();

	var node = args.node = dojo.byId(args.node),
		top, left;

	var init = (function(n){
		return function(){
			var cs = dojo.getComputedStyle(n);
			var pos = cs.position;
			top = (pos == 'absolute' ? n.offsetTop : parseInt(cs.top) || 0);
			left = (pos == 'absolute' ? n.offsetLeft : parseInt(cs.left) || 0);
			if(pos != 'absolute' && pos != 'relative'){
				var ret = dojo.coords(n, true);
				top = ret.y;
				left = ret.x;
				n.style.position = "absolute";
				n.style.top = top + "px";
				n.style.left = left + "px";
			}
		}
	})(node);
	init();
	
	var _anim = dojo.animateProperty(dojo.mixin({
		properties: {
			// FIXME: is there a way to update the _Line after creation?
			// null start values allow chaining to work, animateProperty will
			// determine them for us (except in ie6? -- ugh)
			top: top + (args.top || 0),
			left: left + (args.left || 0) 
		}
	}, args));
	dojo.connect(_anim, "beforeBegin", _anim, init);
	return _anim; // dojo.Animation
};

dojox.fx.crossFade = function(/* Object */args){
	// summary: 
	//		Returns an animation cross fading two element simultaneously
	// 
	// args:
	//	args.nodes: Array - two element array of domNodes, or id's
	//
	//	all other standard animation args mixins apply. args.node ignored.
	//

	// simple check for which node is visible, maybe too simple?
	var node1 = args.nodes[0] = dojo.byId(args.nodes[0]),
		op1 = dojo.style(node1,"opacity"),
		node2 = args.nodes[1] = dojo.byId(args.nodes[1]),
		op2 = dojo.style(node2, "opacity")
	;
	
	var _anim = dojo.fx.combine([
		dojo[(op1 == 0 ? "fadeIn" : "fadeOut")](dojo.mixin({
			node: node1
		},args)),
		dojo[(op1 == 0 ? "fadeOut" : "fadeIn")](dojo.mixin({
			node: node2
		},args))
	]);
	return _anim; // dojo.Animation
};

dojox.fx.highlight = function(/*Object*/ args){
	// summary: 
	//		Highlight a node
	//
	// description:
	//		Returns an animation that sets the node background to args.color
	//		then gradually fades back the original node background color
	//	
	// example:
	//	|	dojox.fx.highlight({ node:"foo" }).play(); 

	var node = args.node = dojo.byId(args.node);

	args.duration = args.duration || 400;
	
	// Assign default color light yellow
	var startColor = args.color || '#ffff99',
		endColor = dojo.style(node, "backgroundColor")
	;

	// safari "fix"
	// safari reports rgba(0, 0, 0, 0) (black) as transparent color, while
	// other browsers return "transparent", rendered as white by default by
	// dojo.Color; now dojo.Color maps "transparent" to
	// djConfig.transparentColor ([r, g, b]), if present; so we can use
	// the color behind the effect node
	if(endColor == "rgba(0, 0, 0, 0)"){
		endColor = "transparent";
	}

	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			backgroundColor: { start: startColor, end: endColor }
		}
	}, args));

	if(endColor == "transparent"){
		dojo.connect(anim, "onEnd", anim, function(){
			node.style.backgroundColor = endColor;
		});
	}

	return anim; // dojo.Animation
};

 
dojox.fx.wipeTo = function(/*Object*/ args){
	// summary:
	//		Animate a node wiping to a specific width or height
	//	
	// description:
	//		Returns an animation that will expand the
	//		node defined in 'args' object from it's current to
	//		the height or width value given by the args object.
	//
	//		default to height:, so leave height null and specify width:
	//		to wipeTo a width. note: this may be deprecated by a 
	//
	//		Note that the final value should not include
	//		units and should be an integer.  Thus a valid args object
	//		would look something like this:
	//
	//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
	//
	//		Node must have no margin/border/padding, so put another
	//		node inside your target node for additional styling.

	args.node = dojo.byId(args.node);
	var node = args.node, s = node.style;

	var dir = (args.width ? "width" : "height"),
		endVal = args[dir],
		props = {}
	;

	props[dir] = {
		// wrapped in functions so we wait till the last second to query (in case value has changed)
		start: function(){
			// start at current [computed] height, but use 1px rather than 0
			// because 0 causes IE to display the whole panel
			s.overflow = "hidden";
			if(s.visibility == "hidden" || s.display == "none"){
				s[dir] = "1px";
				s.display = "";
				s.visibility = "";
				return 1;
			}else{
				var now = dojo.style(node,dir);
				return Math.max(now, 1);
			}
		},
		end: endVal
	};

	var anim = dojo.animateProperty(dojo.mixin({ properties: props }, args));
	return anim; // dojo.Animation
};
