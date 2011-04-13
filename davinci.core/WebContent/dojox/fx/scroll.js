dojo.provide("dojox.fx.scroll");
dojo.experimental("dojox.fx.scroll"); 

dojo.require("dojox.fx._core"); 

dojox.fx.smoothScroll = function(/* Object */args){
	// summary: Returns an animation that will smooth-scroll to a node
	// description: This implementation support either horizontal or vertical scroll, as well as
	// both. In addition, element in iframe can be scrolled to correctly.
	// offset: {x: int, y: int} this will be added to the target position
	// duration: Duration of the animation in milliseconds.
	// win: a node or window object to scroll
	
	if(!args.target){ args.target = dojo.position(args.node,true); }

	var isWindow = dojo[(dojo.isIE ? "isObject" : "isFunction")](args["win"].scrollTo),
		delta = { x: args.target.x, y: args.target.y }
	;
	if(!isWindow){
		var winPos = dojo.position(args.win);
		delta.x -= winPos.x;
		delta.y -= winPos.y;
	}

	var _anim = (isWindow) ?
		(function(val){
			args.win.scrollTo(val[0],val[1]);
		}) :
		(function(val){
			args.win.scrollLeft = val[0];
			args.win.scrollTop = val[1];
		});

	var anim = new dojo.Animation(dojo.mixin({
		beforeBegin: function(){
			if(this.curve){ delete this.curve; }
			var current = isWindow ? dojo._docScroll() : {x: args.win.scrollLeft, y: args.win.scrollTop};
			anim.curve = new dojox.fx._Line([current.x,current.y],[delta.x,delta.y]);
		},
		onAnimate: _anim
	},args));
	return anim; // dojo.Animation
};
