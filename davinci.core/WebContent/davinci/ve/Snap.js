dojo.provide("davinci.ve.Snap");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.Context");

/**
 * @static
 */
davinci.ve.Snap = function() {

	return /** @scope davinci.ve.Snap */ {
		_findSnapOpportunities:function(widget){
			var context = this;
			var position = context._lastSnapPosition;
			var node = widget.domNode;
			var dj = context.getDojo();
			// Do a little extra work because Dojo doesn't have API to give margin box with scroll.
			var dj_position_noscroll = dj.position(node, false);	// content box without scroll
			var dj_position_scroll = dj.position(node, true);	// content box with scroll
			var dj_margin_box = dj._getMarginBox(node);	// margin box
			var widget_position = dj_position_scroll;
			widget_position.x += (dj_margin_box.l - dj_position_scroll.x); // adjust for margins
			widget_position.y += (dj_margin_box.t - dj_position_scroll.y);
			
			//FIXME: Make this a preference. Also, add a preference for snapping in general.
			var hitradius=5;
			
			var currentDeltaX = context._snapX ? context._snapX.delta : hitradius+1;
			var currentDeltaY = context._snapY ? context._snapY.delta : hitradius+1;
			
			var widgetLeft = widget_position.x;
			var widgetCenter = widget_position.x + (dj_margin_box.w/2);
			var widgetRight = widget_position.x + dj_margin_box.w;
			var deltaLeft = Math.abs(widgetLeft-position.x);
			var deltaCenter = Math.abs(widgetCenter-position.x);
			var deltaRight = Math.abs(widgetRight-position.x);
			
			var widgetTop = widget_position.y;
			var widgetMiddle = widget_position.y + (dj_margin_box.h/2);
			var widgetBottom = widget_position.y + dj_margin_box.h;
			var deltaTop = Math.abs(widgetTop-position.y);
			var deltaMiddle = Math.abs(widgetMiddle-position.y);
			var deltaBottom = Math.abs(widgetBottom-position.y);
			//console.log('widgetBottom='+widgetBottom+',deltaBottom='+deltaBottom+',currentDeltaY='+currentDeltaY);
			//console.log('widgetMiddle='+widgetMiddle+',deltaMiddle='+deltaMiddle+',currentDeltaY='+currentDeltaY);
			function snapX(type,x,delta){
				if(delta<currentDeltaX){
console.log('snapping. type='+type+',x='+x+',delta='+delta+',currentDeltaX='+currentDeltaX);
					context._snapX = {type:type, x:x, widget:widget, delta:delta};
					currentDeltaX = delta;
				}
			}
			function snapY(type,y,delta){
				if(delta<currentDeltaY){
console.log('snapping. type='+type+',y='+y+',delta='+delta+',currentDeltaY='+currentDeltaY);
					context._snapY = {type:type, y:y, widget:widget, delta:delta};
					currentDeltaY = delta;
				}
			}
			snapX("left",widgetLeft,deltaLeft);
			snapX("center",widgetCenter, deltaCenter);
			snapX("right",widgetRight, deltaRight);
			snapY("top",widgetTop,deltaTop);
			snapY("middle",widgetMiddle, deltaMiddle);
			snapY("bottom",widgetBottom, deltaBottom);
			dojo.forEach(widget.getChildren(), davinci.ve.Snap._findSnapOpportunities, context);
		},
		
		_findSnapOpportunitiesTop:function(context){
			dojo.forEach(context.getTopWidgets(), davinci.ve.Snap._findSnapOpportunities, context);
		},
		
		findSnapPoints:function(context){
			context._snapX = null;
			context._snapY = null;
			var editorPrefs = davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs');
			if(editorPrefs.snap){
				davinci.ve.Snap._findSnapOpportunitiesTop(context);
			}
		},
		
		updateSnapLines:function(context, event){
			var position = {x:event.pageX, y:event.pageY};
			if(context._lastSnapPosition){
				if(context._lastSnapPosition.x == position.x && context._lastSnapPosition.y == position.y){
					return;
				}
			}
			context._lastSnapPosition = position;
			var containerNode = context.getContainerNode();
			davinci.ve.Snap.findSnapPoints(context);
			if(!context._snapLinesDiv){
				context._snapLinesDiv = dojo.create('div',
						{'class':'snaplines',style:'position:absolute;z-index:1001;'}, 
						containerNode);
				context._snapLinesDivWidgetX = dojo.create('div',
						{'class':'snaplinesWidgetX',style:'position:absolute;'}, 
						context._snapLinesDiv);
				context._snapLinesDivAlignX = dojo.create('div',
						{'class':'snaplinesAlignX',style:'position:absolute;'}, 
						context._snapLinesDiv);
				context._snapLinesDivWidgetY = dojo.create('div',
						{'class':'snaplinesWidgetY',style:'position:absolute;'}, 
						context._snapLinesDiv);
				context._snapLinesDivAlignY = dojo.create('div',
						{'class':'snaplinesAlignY',style:'position:absolute;'}, 
						context._snapLinesDiv);
				context._snapLinesDivWidgetX.style.left='5px';
				context._snapLinesDivWidgetX.style.top='5px';
				context._snapLinesDivWidgetX.style.width='10px';
				context._snapLinesDivWidgetX.style.height='5px';
				context._snapLinesDivWidgetX.style.backgroundColor='pink';
			}
			context._snapLinesDiv.style.display="block";
			var box;
			function snapSetup(context,widget,widgetDiv,alignDiv){
				widgetDiv.style.display='block';
				alignDiv.style.display='block';		
				var dj = context.getDojo();
				box = dj._getMarginBox(widget.domNode);
				box.r = box.l + box.w;
				box.b = box.t + box.h;
				box.c = box.l + box.w/2;
				box.m = box.t + box.h/2;
				widgetDiv.style.left = box.l+'px';
				widgetDiv.style.top = box.t+'px';
				widgetDiv.style.width = box.w+'px';
				widgetDiv.style.height = box.h+'px';
				//FIXME: Put into stylesheet
				widgetDiv.style.backgroundColor='rgba(255,0,255,.05)';
			}
			if(context._snapX){
				snapSetup(context,context._snapX.widget,context._snapLinesDivWidgetX,context._snapLinesDivAlignX);
				var t,h;
				if(box.t<position.y){
					t = box.t;
					h = position.y - box.t;
				}else{
					t = position.y;
					h = box.b - position.y;
				}
				if(context._snapX.type=="left"){
					context._snapLinesDivAlignX.style.left = box.l+'px';
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
				if(box.l<position.x){
					l = box.l;
					w = position.x - box.l;
				}else{
					l = position.x;
					w = box.r - position.x;
				}
				if(context._snapY.type=="top"){
					context._snapLinesDivAlignY.style.top = box.t+'px';
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
		
		clearSnapLines:function(context){
			if(context._snapLinesDiv){
				context._snapLinesDiv.style.display="none";
			}
			context._snapX = context._snapY = null;
		}
    };
}();