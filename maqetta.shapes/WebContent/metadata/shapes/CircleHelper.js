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
		// Identifty those widgets by either having cx, cy, rx, and ry properties
		// or having width=height=0px (where user accepted the default size)
		var computedStyleWidth = parseFloat(domStyle.get(domNode,'width'));
		var computedStyleHeight = parseFloat(domStyle.get(domNode,'height'));
		var crprops = (dijitWidget.cx && dijitWidget.cy && dijitWidget.rx && dijitWidget.ry);
		if(crprops || !computedStyleWidth || !computedStyleHeight){
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

			if(crprops){
				var oldLeft = parseFloat(domStyle.get(domNode, 'left'));
				var oldTop = parseFloat(domStyle.get(domNode, 'top'));
				domNode.style.left = (oldLeft + borderWidth/2) + 'px';
				domNode.style.top = (oldTop + borderWidth/2) + 'px';
				domNode.style.width = ((dijitWidget.rx-borderWidth/2) * 2) + 'px';
				domNode.style.height = ((dijitWidget.ry-borderWidth/2) * 2) + 'px';
				delete dijitWidget.cx;
				delete dijitWidget.cy;
				delete dijitWidget.rx;
				delete dijitWidget.ry;
				srcElement.removeAttribute('cx');
				srcElement.removeAttribute('cy');
				srcElement.removeAttribute('rx');
				srcElement.removeAttribute('ry');
			}else{
				domNode.style.width = '80px';
				domNode.style.height = '80px';
			}
		}
		//Don't stuff border-radius values into srcElement
		var old_borderTopLeftRadius = domNode.style.borderTopLeftRadius;
		domNode.style.borderTopLeftRadius = '';
		var old_borderTopRightRadius = domNode.style.borderTopRightRadius;
		domNode.style.borderTopRightRadius = '';
		var old_bottomLeftRadius = domNode.style.bottomLeftRadius;
		domNode.style.bottomLeftRadius = '';
		var old_borderBottomRightRadius = domNode.style.borderBottomRightRadius;
		domNode.style.borderBottomRightRadius = '';
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
		domNode.style.borderTopLeftRadius = old_borderTopLeftRadius;
		domNode.style.borderTopRightRadius = old_borderTopRightRadius;
		domNode.style.bottomLeftRadius = old_bottomLeftRadius;
		domNode.style.borderBottomRightRadius = old_borderBottomRightRadius;
	}

});

});