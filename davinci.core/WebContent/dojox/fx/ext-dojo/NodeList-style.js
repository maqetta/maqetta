dojo.provide("dojox.fx.ext-dojo.NodeList-style");
dojo.experimental("dojox.fx.ext-dojo.NodeList-style");
// summary: 
//		Core extensions to `dojo.NodeList` providing addtional fx to `dojo.NodeList-fx`
// 		from `dojox.fx.style`
//
// description:
//		A Package to extend dojo base NodeList with fx provided by the `dojox.fx` project.
//		These are experimental animations, in an experimental 

dojo.require("dojo.NodeList-fx");
dojo.require("dojox.fx.style");

dojo.extend(dojo.NodeList, {

	addClassFx: function(cssClass, args){
		// 	summary:
		//		Animate the effects of adding a class to all nodes in this list.
		//		see `dojox.fx.addClass`
		//
		//	tags: FX, NodeList
		//
		//	example:
		//	|	// fade all elements with class "bar" to to 50% opacity
		//	|	dojo.query(".bar").addClassFx("bar").play();

		return dojo.fx.combine(this.map(function(n){ // dojo.Animation
			return dojox.fx.addClass(n, cssClass, args);
		}));
	},
	
	removeClassFx: function(cssClass, args){
		// summary:
		//		Animate the effect of removing a class to all nodes in this list.
		//		see `dojox.fx.removeClass`
		//
		//	tags: FX, NodeList
		//
		// example:
		//	| dojo.query(".box").removeClassFx("bar").play();

		return dojo.fx.combine(this.map(function(n){ // dojo.Animation
			return dojox.fx.removeClass(n, cssClass, args);
		}));
	},
	
	toggleClassFx: function(cssClass, force, args){
		// summary:
		//		Animate the effect of adding or removing a class to all nodes in this list.
		//		see `dojox.fx.toggleClass`
		//
		//	tags: FX, NodeList
		//
		// example:
		//	| dojo.query(".box").toggleClass("bar").play();

		return dojo.fx.combine(this.map(function(n){ // dojo.Animation
			return dojox.fx.toggleClass(n, cssClass, force, args);
		}));
	}

});
