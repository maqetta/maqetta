define(["dojo", "dijit", "dojox", "dojo/window", "dijit/_WidgetBase"], function(dojo, dijit, dojox, win, WidgetBase) {

	return dojo.declare("dojox.mobile.Overlay", dijit._WidgetBase, {
		// summary:
		//		A non-templated widget that animates up from the bottom, overlaying the current content
		//

		baseClass: "mblOverlay mblOverlayHidden",

		show: function(/*DomNode?*/aroundNode){
			// summary:
			//		Scroll the overlay up into view
			var vp, popupPos;
			var reposition = dojo.hitch(this, function(){
				dojo.style(this.domNode, { position: "", top: "auto", bottom: "0px" });
				popupPos = dojo.position(this.domNode);
				vp = dojo.window.getBox();
				if((popupPos.y+popupPos.h) != vp.h){ // TODO: should be a has() test for position:fixed not scrolling
					popupPos.y = vp.t + vp.h - popupPos.h;
					dojo.style(this.domNode, { position: "absolute", top: popupPos.y + "px", bottom: "auto" });
				}
			});
			reposition();
			if(aroundNode){
				var aroundPos = dojo.position(aroundNode);
				if(popupPos.y < aroundPos.y){ // if the aroundNode is under the popup, try to scroll it up
					dojo.global.scrollBy(0, aroundPos.y + aroundPos.h - popupPos.y);
					reposition();
				}
			}
			dojo.replaceClass(this.domNode, ["mblCoverv", "mblIn"], ["mblOverlayHidden", "mblRevealv", "mblOut", "mblReverse"]);
			var timeoutHandler = null;
			this._moveHandle = this.connect(dojo.doc.documentElement, "ontouchmove", function(){
				if(timeoutHandler){
					clearTimeout(timeoutHandler);
				}
				timeoutHandler = setTimeout(function(){
					reposition();
					timeoutHandler = null;
				}, 0);
			});
		},

		hide: function(){
			// summary:
			//		Scroll the overlay down and then make it invisible
			if(this._moveHandle){
				this.disconnect(this._moveHandle);
				this._moveHandle = null;
			}
			if(dojo.isWebKit){
				var handler = this.connect(this.domNode, "webkitAnimationEnd", function(){
					this.disconnect(handler);
					dojo.replaceClass(this.domNode, ["mblOverlayHidden"], ["mblRevealv", "mblOut", "mblReverse"]);
				});
				dojo.replaceClass(this.domNode, ["mblRevealv", "mblOut", "mblReverse"], ["mblCoverv", "mblIn"]);
			}else{
				dojo.replaceClass(this.domNode, ["mblOverlayHidden"], ["mblCoverv", "mblIn", "mblRevealv", "mblOut", "mblReverse"]);
			}
		},

		onBlur: function(/*Event*/e){
			return false; // touching outside the overlay area does not call hide()
		}
	});
});
