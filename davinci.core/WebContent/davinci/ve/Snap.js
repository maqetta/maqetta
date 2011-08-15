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
			var snapBox = context._lastSnapBox;
			
			var node = widget.domNode;
			var dj = context.getDojo();
			var dj_coords = dj.coords(node, true);
			
			// Fix up because dojo.coords() value is shifted by left/top margins
			var computed_style = dj.style(node);
			dj_coords.x -= computed_style.marginLeft.match(/^\d+/);	// Extra number from something like "2px"
			dj_coords.y -= computed_style.marginTop.match(/^\d+/);
			
			//FIXME: Maybe make this a preference.
			var hitradius=5;
			
			var currentDeltaX = context._snapX ? context._snapX.delta : hitradius+1;
			var currentDeltaY = context._snapY ? context._snapY.delta : hitradius+1;

			var widgetLeft = dj_coords.x;
			var widgetCenter = dj_coords.x + (dj_coords.w/2);
			var widgetRight = dj_coords.x + dj_coords.w;
			var deltaLeft = Math.abs(widgetLeft-snapBox.l);
			var deltaCenter = Math.abs(widgetCenter-snapBox.c);
			var deltaRight = Math.abs(widgetRight-snapBox.r);
			
			var widgetTop = dj_coords.y;
			var widgetMiddle = dj_coords.y + (dj_coords.h/2);
			var widgetBottom = dj_coords.y + dj_coords.h;
			var deltaTop = Math.abs(widgetTop-snapBox.t);
			var deltaMiddle = Math.abs(widgetMiddle-snapBox.m);
			var deltaBottom = Math.abs(widgetBottom-snapBox.b);

//console.log('widgetTop='+widgetTop+',deltaTop='+deltaTop+',currentDeltaY='+currentDeltaY);
//console.log('widgetBottom='+widgetBottom+',deltaBottom='+deltaBottom+',currentDeltaY='+currentDeltaY);
//console.log('widgetMiddle='+widgetMiddle+',deltaMiddle='+deltaMiddle+',currentDeltaY='+currentDeltaY);
			function snapX(type,x,delta){
				if(delta<currentDeltaX){
//console.log('snapping. type='+type+',x='+x+',delta='+delta+',currentDeltaX='+currentDeltaX);
					context._snapX = {type:type, x:x, widget:widget, delta:delta};
					currentDeltaX = delta;
				}
			}
			function snapY(type,y,delta){
				if(delta<currentDeltaY){
//console.log('snapping. node.className='+node.className+',type='+type+',y='+y+',delta='+delta+',currentDeltaY='+currentDeltaY);
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
			if(editorPrefs.snap && !context.getFlowLayout()){
				davinci.ve.Snap._findSnapOpportunitiesTop(context);
			}
		},
		
		updateSnapLines:function(context, rect){
			//FIXME: Probably remove position and context._lastSnapPosition
			var position = {x:rect.l, y:rect.t};
			if(context._lastSnapPosition){
				if(context._lastSnapPosition.x == position.x && context._lastSnapPosition.y == position.y){
					return;
				}
			}
			context._lastSnapPosition = position;
			if(context._lastSnapBox){
				if(context._lastSnapBox.l == rect.l &&
					context._lastSnapBox.t == rect.t &&
					context._lastSnapBox.w == rect.w &&
					context._lastSnapBox.h == rect.h){
					return;
				}
			}
			snapBox={
				l:rect.l, t:rect.t, w:rect.w, h:rect.h,
				c:rect.l+rect.w/2, r:rect.l+rect.w,
				m:rect.t+rect.h/2, b:rect.t+rect.h
			};
			context._lastSnapBox = snapBox;

			var containerNode = context.getContainerNode();
			davinci.ve.Snap.findSnapPoints(context);
			if(!context._snapLinesDiv){
				context._snapLinesDiv = dojo.create('div',
						{'class':'snaplines',style:'position:absolute;top:0px;left:0px;z-index:1001;'}, 
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
				/*OLD CODE
				box = dj._getMarginBox(widget.domNode);
				box.r = box.l + box.w;
				box.b = box.t + box.h;
				box.c = box.l + box.w/2;
				box.m = box.t + box.h/2;
				widgetDiv.style.left = box.l+'px';
				widgetDiv.style.top = box.t+'px';
				widgetDiv.style.width = box.w+'px';
				widgetDiv.style.height = box.h+'px';
				*/
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
				/* OLD CODE
				if(box.t<snapBox.t){
					t = box.t;
					h = snapBox.t - box.t;
				}else{
					t = snapBox.t;
					h = box.b - snapBox.t;
				}
				if(context._snapX.type=="left"){
					context._snapLinesDivAlignX.style.left = box.l+'px';
				}else if(context._snapX.type=="center"){
					context._snapLinesDivAlignX.style.left = box.c+'px';
				}else{	// "right"
					context._snapLinesDivAlignX.style.left = box.r+'px';
				}
				*/
				if(box.y<snapBox.t){
					t = box.y;
					h = snapBox.t - box.y;
				}else{
					t = snapBox.t;
					h = box.y - snapBox.t;
				}
				if(context._snapX.type=="left"){
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
				/*
				if(box.l<snapBox.l){
					l = box.l;
					w = snapBox.l - box.l;
				}else{
					l = snapBox.l;
					w = box.r - snapBox.l;
				}
				if(context._snapY.type=="top"){
					context._snapLinesDivAlignY.style.top = box.t+'px';
				}else if(context._snapY.type=="middle"){
					context._snapLinesDivAlignY.style.top = box.m+'px';
				}else{	// "bottom"
					context._snapLinesDivAlignY.style.top = box.b+'px';
				}
				*/
				if(box.x<snapBox.l){
					l = box.x;
					w = snapBox.l - box.x;
				}else{
					l = snapBox.l;
					w = box.x - snapBox.l;
				}
				if(context._snapY.type=="top"){
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
		
		clearSnapLines:function(context){
			if(context._snapLinesDiv){
				context._snapLinesDiv.style.display="none";
			}
			context._snapX = context._snapY = null;
		}
    };
}();