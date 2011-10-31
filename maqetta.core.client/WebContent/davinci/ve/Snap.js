dojo.provide("davinci.ve.Snap");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.Context");

/**
 * @static
 */
davinci.ve.Snap = function() {

	return /** @scope davinci.ve.Snap */ {
		
		/**
		 * Preparation routine called during dynamic dragging if snapping is active
		 * before looping through all of the widgets in the document.
		 * @param {object} context  context object for current document
		 * @param {object} rect  l,t,w,h for rectangular area being dragged around. w=h=0 if a point.
		 * @returns {boolean}  false=> no need to traverse, same as last time. true=>yes, do the traversal
		 */
		updateSnapLinesBeforeTraversal:function(context, rect){
			context._snapX = null;
			context._snapY = null;
			if(context._lastSnapBox){
				if(context._lastSnapBox.l == rect.l &&
					context._lastSnapBox.t == rect.t &&
					context._lastSnapBox.w == rect.w &&
					context._lastSnapBox.h == rect.h){
					return false;
				}
			}
			snapBox={
				l:rect.l, t:rect.t, w:rect.w, h:rect.h,
				c:rect.l+rect.w/2, r:rect.l+rect.w,
				m:rect.t+rect.h/2, b:rect.t+rect.h
			};
			context._lastSnapBox = snapBox;
			return true;
		},
		
		/**
		 * For a particular widget, see if there is a snapping opportunity that is better
		 * than any other previously discovered snapping opportunity. If so, then update
		 * various snapping-related properties on the "context" object.
		 * @param {object} context  Current "context" object (i.e., current document)
		 * @param {object} widget  Current dvWidget object
		 * @param {object} computed_style  CSSStyleDeclaration holding computed style on widget's domNode
		 * 		(passed in by higher-level routine so that computed style isn't called multiple times on same widget)
		 */
		findSnapOpportunities: function(context, widget, computed_style){
			var snapBox = context._lastSnapBox;
			
			var node = widget.domNode;
			var dj = context.getDojo();
			var dj_coords = dj.coords(node, true);
			
			// Fix up because dojo.coords() value is shifted by left/top margins
			dj_coords.x -= computed_style.marginLeft.match(/^\d+/);	// Extract number from something like "2px"
			dj_coords.y -= computed_style.marginTop.match(/^\d+/);
			
			//FIXME: Maybe make this a preference.
			var hitradius=5;
			
			var currentDeltaX = context._snapX ? context._snapX.delta : hitradius+1;
			var currentDeltaY = context._snapY ? context._snapY.delta : hitradius+1;
			
			var widgetSnapInfo= {
				snapRect:{
					l:dj_coords.x,
					c:dj_coords.x + (dj_coords.w/2),
					r:dj_coords.x + dj_coords.w,
					t:dj_coords.y,
					m:dj_coords.y + (dj_coords.h/2),
					b:dj_coords.y + dj_coords.h
				}
			};
			var helper = widget.getHelper();
			if(helper && helper.getSnapInfo){
				// If widget has a getSnapInfo helper function, call it
				// passing the default widgetSnapInfo in case it wants to accept
				// the defaults or override the defaults
				widgetSnapInfo = helper.getSnapInfo(widget, widgetSnapInfo);
			}
			
			function snapX(type,x,delta){
				if(delta<currentDeltaX){
					context._snapX = {type:type, x:x, widget:widget, delta:delta};
					currentDeltaX = delta;
				}
			}
			function snapY(type,y,delta){
				if(delta<currentDeltaY){
					context._snapY = {type:type, y:y, widget:widget, delta:delta};
					currentDeltaY = delta;
				}
			}
			var rect = widgetSnapInfo.snapRect;
			var deltaLeft, deltaCenter, deltaRight, deltaTop, deltaMiddle, deltaBottom;
			if(rect){
				deltaLeft = Math.abs(rect.l-snapBox.l);
				deltaCenter = Math.abs(rect.c-snapBox.c);
				deltaRight = Math.abs(rect.r-snapBox.r);
				snapX("left",rect.l,deltaLeft);
				snapX("center",rect.c, deltaCenter);
				snapX("right",rect.r, deltaRight);
				deltaTop = Math.abs(rect.t-snapBox.t);
				deltaMiddle = Math.abs(rect.m-snapBox.m);
				deltaBottom = Math.abs(rect.b-snapBox.b);
				snapY("top",rect.t,deltaTop);
				snapY("middle",rect.m, deltaMiddle);
				snapY("bottom",rect.b, deltaBottom);
			}
			var points = widgetSnapInfo.snapPoints;
			if(points){
				for(var i=0; i<points.length; i++){
					var p = points[i];
					deltaLeft = Math.abs(p.x-snapBox.l);
					deltaCenter = Math.abs(p.x-snapBox.c);
					deltaRight = Math.abs(p.x-snapBox.r);
					snapX("point",p.x,deltaLeft);
					snapX("point",p.x, deltaCenter);
					snapX("point",p.x, deltaRight);
					deltaTop = Math.abs(p.y-snapBox.t);
					deltaMiddle = Math.abs(p.y-snapBox.m);
					deltaBottom = Math.abs(p.y-snapBox.b);
					snapY("point",p.y,deltaTop);
					snapY("point",p.y, deltaMiddle);
					snapY("point",p.y, deltaBottom);
				}
			}
		},
		
		/**
		 * Updates screen to show dynamic snap lines
		 */
		updateSnapLinesAfterTraversal:function(context){

			var containerNode = context.getContainerNode();

			if(!context._snapLinesDiv){
				context._snapLinesDiv = dojo.create('div',
						{'class':'snaplines',style:'position:absolute;top:0px;left:0px;z-index:1001;pointer-events:none;'}, 
						containerNode);
				context._snapLinesDivWidgetX = dojo.create('div',
						{'class':'snaplinesWidgetX',style:'position:absolute;pointer-events:none;'}, 
						context._snapLinesDiv);
				context._snapLinesDivAlignX = dojo.create('div',
						{'class':'snaplinesAlignX',style:'position:absolute;pointer-events:none;'}, 
						context._snapLinesDiv);
				context._snapLinesDivWidgetY = dojo.create('div',
						{'class':'snaplinesWidgetY',style:'position:absolute;pointer-events:none;'}, 
						context._snapLinesDiv);
				context._snapLinesDivAlignY = dojo.create('div',
						{'class':'snaplinesAlignY',style:'position:absolute;pointer-events:none;'}, 
						context._snapLinesDiv);
			}
			context._snapLinesDiv.style.display="block";
			var box; // Initial values are assigned by internal function snapSetup below leveraging closure
			function snapSetup(context,widget,widgetDiv,alignDiv){
				widgetDiv.style.display='block';
				alignDiv.style.display='block';		
				var dj = context.getDojo();
				box = dj.coords(widget.domNode, true);
				box.r = box.x + box.w;
				box.b = box.y + box.h;
				box.c = box.x + box.w/2;
				box.m = box.y + box.h/2;
				widgetDiv.style.left = box.x+'px';
				widgetDiv.style.top = box.y+'px';
				widgetDiv.style.width = box.w+'px';
				widgetDiv.style.height = box.h+'px';
				//FIXME: Put into stylesheet
				widgetDiv.style.backgroundColor='rgba(255,0,255,.05)';
			}
			if(context._snapX){
				snapSetup(context,context._snapX.widget,context._snapLinesDivWidgetX,context._snapLinesDivAlignX);
				var t,h;
				if(box.y<snapBox.t){
					t = box.y;
					h = snapBox.t - box.y;
				}else{
					t = snapBox.t;
					h = box.y - snapBox.t;
				}
				if(context._snapX.type=="point"){
					context._snapLinesDivAlignX.style.left = context._snapX.x+'px';
				}else if(context._snapX.type=="left"){
					context._snapLinesDivAlignX.style.left = box.x+'px';
				}else if(context._snapX.type=="center"){
					context._snapLinesDivAlignX.style.left = box.c+'px';
				}else{	// "right"
					context._snapLinesDivAlignX.style.left = box.r+'px';
				}
				context._snapLinesDivAlignX.style.top = t+'px';
				context._snapLinesDivAlignX.style.width = '1px';
				context._snapLinesDivAlignX.style.height = h+'px';
				//FIXME: Put into stylesheet
				context._snapLinesDivAlignX.style.backgroundColor='rgba(255,0,255,.75)';
			}else{
				context._snapLinesDivWidgetX.style.display='none';
				context._snapLinesDivAlignX.style.display='none';
			}
			if(context._snapY){
				snapSetup(context,context._snapY.widget,context._snapLinesDivWidgetY,context._snapLinesDivAlignY);
				var l,w;
				if(box.x<snapBox.l){
					l = box.x;
					w = snapBox.l - box.x;
				}else{
					l = snapBox.l;
					w = box.x - snapBox.l;
				}
				if(context._snapY.type=="point"){
					context._snapLinesDivAlignY.style.top = context._snapY.y+'px';
				}else if(context._snapY.type=="top"){
					context._snapLinesDivAlignY.style.top = box.y+'px';
				}else if(context._snapY.type=="middle"){
					context._snapLinesDivAlignY.style.top = box.m+'px';
				}else{	// "bottom"
					context._snapLinesDivAlignY.style.top = box.b+'px';
				}
				context._snapLinesDivAlignY.style.left = l+'px';
				context._snapLinesDivAlignY.style.height = '1px';
				context._snapLinesDivAlignY.style.width = w+'px';
				//FIXME: Put into stylesheet
				context._snapLinesDivAlignY.style.backgroundColor='rgba(255,0,255,.75)';
			}else{
				context._snapLinesDivWidgetY.style.display='none';
				context._snapLinesDivAlignY.style.display='none';
			}
		},
		
		/**
		 * Clears all snap lines from visual canvas
		 */
		clearSnapLines:function(context){
			if(context._snapLinesDiv){
				context._snapLinesDiv.style.display="none";
			}
			context._snapX = context._snapY = null;
		}
    };
}();