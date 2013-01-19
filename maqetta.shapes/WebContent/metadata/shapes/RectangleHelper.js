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
		// Identifty those widgets by either having width and height properties
		// or having width=height=0px (where user accepted the default size)
		var computedStyleWidth = parseFloat(domStyle.get(domNode,'width'));
		var computedStyleHeight = parseFloat(domStyle.get(domNode,'height'));
		var oldprops = (dijitWidget.width && dijitWidget.height);
		if(oldprops || !computedStyleWidth || !computedStyleHeight){
			// domStyle check sees if any CSS styling has been applied (CSS style sheets or element.style)
			var domStyleStrokeWidthPx = domStyle.get(domNode, 'strokeWidth');
			var domStyleStrokeWidth = domStyleStrokeWidthPx ? parseFloat(domStyleStrokeWidthPx) : null;
			// Separately check element.style
			var elementStyleStrokeWidthPx = domNode.style.strokeWidth;
			var elementStyleStrokeWidth = elementStyleStrokeWidthPx ? parseFloat(elementStyleStrokeWidthPx) : null;
			// Only use domStyle result if value is different than 1 (the user agent default)
			// This could be faulty if user explicitly had a style declaration that set stroke-width:1
			// but that's an unlikely scenario, and migration to new approach worth that unlikely scenario
			var strokeWidth = (typeof domStyleStrokeWidth == 'number' && domStyleStrokeWidth != 1) ? domStyleStrokeWidth : 
				(typeof elementStyleStrokeWidth == 'number') ? elementStyleStrokeWidth : 3;
			var borderWidth = strokeWidth;
			domNode.style.borderWidth = borderWidth + 'px';
			
			domNode.style.borderStyle = 'solid';
			
			var strokeColor = domStyle.get(domNode, 'stroke');
			domNode.style.borderColor = (strokeColor && strokeColor != 'none') ? strokeColor : 'black';
			
			var domStyleFill = domStyle.get(domNode, 'fill');
			var elementStyleFill = domNode.style.fill;
			// Only use domStyle result if value is different than black (the user agent default)
			// This could be faulty if user explicitly had a style declaration that set fill:black or fill:#000000
			// but that's an unlikely scenario, and migration to new approach worth that unlikely scenario
			domNode.style.backgroundColor = (domStyleFill && domStyleFill != '#000' && domStyleFill != '#000000' && domStyleFill != 'black' && domStyleFill != 'rgb(0,0,0)') ? 
					domStyleFill : (elementStyleFill ? elementStyleFill : '');

			if(oldprops){
				var oldLeft = parseFloat(domStyle.get(domNode, 'left'));
				var oldTop = parseFloat(domStyle.get(domNode, 'top'));
				domNode.style.left = (oldLeft + borderWidth/2) + 'px';
				domNode.style.top = (oldTop + borderWidth/2) + 'px';
				domNode.style.width = (dijitWidget.width-borderWidth) + 'px';
				domNode.style.height = (dijitWidget.height-borderWidth) + 'px';
				delete dijitWidget.width;
				delete dijitWidget.height;
				srcElement.removeAttribute('width');
				srcElement.removeAttribute('height');
			}else{
				domNode.style.width = '80px';
				domNode.style.height = '80px';
			}
		}
		if(dijitWidget.cornerradius){
			domNode.style.borderRadius = dijitWidget.cornerradius + 'px';
			delete dijitWidget.cornerradius;
			srcElement.removeAttribute('cornerradius');
		}
		var oldCssText = srcElement.getAttribute('style');
		if(oldCssText != domNode.style.cssText){
			srcElement.addAttribute('style', domNode.style.cssText);
			var context = widget.getContext();
			if(context && context.editor && context.editor._visualChanged){
				context.editor._visualChanged();
				// Special hack to prevent Context.js from clearing dirty bit at load time
				context._markDirtyAtLoadTime = true;
			}
		}
	}

});

});