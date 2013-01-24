define([
	"dojo/_base/declare",
	"dojo/dom-style"
], function(
	declare,
	domStyle
) {

return declare([], {
	create: function(widget, srcElement){
		if(!widget || !widget.domNode || !widget.dijitWidget || !srcElement){
			return;
		}
		var domNode = widget.domNode;
		var dijitWidget = widget.dijitWidget;
		
		// Migrate files from Release 8 or earlier. 
		// Identifty those widgets by either having a content property
		// or having width=height=0px (where user accepted the default size)
		var computedStyleWidth = parseFloat(domStyle.get(domNode,'width'));
		var computedStyleHeight = parseFloat(domStyle.get(domNode,'height'));
		if(dijitWidget.content){
			if(dijitWidget.content){
				domNode.innerHTML = dijitWidget.content;
				srcElement.addText(dijitWidget.content);
				delete dijitWidget.content;
				srcElement.removeAttribute('content');
			}
			var oldLeft = parseFloat(domStyle.get(domNode, 'left'));
			var oldTop = parseFloat(domStyle.get(domNode, 'top'));
			domNode.style.left = (oldLeft + 1) + 'px';	// Undo a 2px offset from old logic
			domNode.style.top = (oldTop + 2) + 'px';
			srcElement.addAttribute('style', domNode.style.cssText);
			var context = widget.getContext();
			if(context && context.editor && context.editor._visualChanged){
				context.editor._visualChanged();
				// Special hack to prevent Context.js from clearing dirty bit at load time
				context._markDirtyAtLoadTime = true;
			}
		}
	},
	
	getChildrenData: function(widget, options) {
		if(!widget || !widget.domNode){
			return '';
		}else{
			return widget.domNode.innerHTML.trim();
		}
	},

});

});