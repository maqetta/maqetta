dojo.provide("dojox.mobile.FlippableView");

dojo.require("dijit._WidgetBase");
dojo.require("dojox.mobile");
dojo.require("dojox.mobile._ScrollableMixin");

// summary:
//		A container that can be flipped horizontally.
// description:
//		FlippableView allows the user to swipe the screen left or right to
//		flip between the views.
//		When FlippableView is flipped, it finds an adjacent FlippableView,
//		and opens it.

dojo.declare(
	"dojox.mobile.FlippableView",
	[dojox.mobile.View, dojox.mobile._ScrollableMixin],
{
	scrollDir: "f",
	weight: 1.2,

	buildRendering: function(){
		this.inherited(arguments);
		dojo.addClass(this.domNode, "mblFlippableView");
		this.containerNode = this.domNode;
		this.containerNode.style.position = "absolute";
	},

	onTouchStart: function(e){
		var nextView = this._nextView(this.domNode);
		if(nextView){
			nextView.stopAnimation();
		}
		var prevView = this._previousView(this.domNode);
		if(prevView){
			prevView.stopAnimation();
		}
		this.inherited(arguments);
	},

	_nextView: function(node){
		for(var n = node.nextSibling; n; n = n.nextSibling){
			if(n.nodeType == 1){ return dijit.byNode(n); }
		}
		return null;
	},

	_previousView: function(node){
		for(var n = node.previousSibling; n; n = n.previousSibling){
			if(n.nodeType == 1){ return dijit.byNode(n); }
		}
		return null;
	},

	scrollTo: function(/*Object*/to){
		if(!this._beingFlipped){
			var newView, x;
			if(to.x < 0){
				newView = this._nextView(this.domNode);
				x = to.x + this.domNode.offsetWidth;
			}else{
				newView = this._previousView(this.domNode);
				x = to.x - this.domNode.offsetWidth;
			}
			if(newView){
				newView.domNode.style.display = "";
				newView._beingFlipped = true;
				newView.scrollTo({x:x});
				newView._beingFlipped = false;
			}
		}
		this.inherited(arguments);
	},

	slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing){
		if(!this._beingFlipped){
			var w = this.domNode.offsetWidth;
			var pos = this.getPos();
			var newView, newX;
			if(pos.x < 0){ // moving to left
				newView = this._nextView(this.domNode);
				if(pos.x < -w/4){ // slide to next
					if(newView){
						to.x = -w;
						newX = 0;
					}
				}else{ // go back
					if(newView){
						newX = w;
					}
				}
			}else{ // moving to right
				newView = this._previousView(this.domNode);
				if(pos.x > w/4){ // slide to previous
					if(newView){
						to.x = w;
						newX = 0;
					}
				}else{ // go back
					if(newView){
						newX = -w;
					}
				}
			}

			if(newView){
				newView._beingFlipped = true;
				newView.slideTo({x:newX}, duration, easing);
				newView._beingFlipped = false;

				if(newX === 0){ // moving to another view
					dojox.mobile.currentView = newView;
				}
			}
		}
		this.inherited(arguments);
	},

	onFlickAnimationEnd: function(e){
		// Hide all the views other than the currently showing one.
		// Otherwise, when the orientation is changed, other views
		// may appear unexpectedly.
		var children = this.domNode.parentNode.childNodes;
		for(var i = 0; i < children.length; i++){
			var c = children[i];
			if(c.nodeType == 1 && c != dojox.mobile.currentView.domNode){
				c.style.display = "none";
			}
		}
		this.inherited(arguments);
	}
});
