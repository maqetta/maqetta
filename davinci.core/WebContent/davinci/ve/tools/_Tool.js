dojo.provide("davinci.ve.tools._Tool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.metadata");


dojo.declare("davinci.ve.tools._Tool", null, {

	_getTarget: function(){
		return this._target;
	},

	_setTarget: function(target){
		
		if(!this._feedback){
			this._feedback = this._context.getDocument().createElement("div");
			this._feedback.className = "editFeedback";
			this._feedback.style.position = "absolute";
			/* ORIGINAL CODE
			this._feedback.style.zIndex = "99"; // below Focus (zIndex = "100")
			*/
			dojo.style(this._feedback, "opacity", 0.1);
		}

		if(target == this._feedback){
			return;
		}

		var containerNode = this._context.getContainerNode();
		var widget;
		
		while(target && target != containerNode){
			widget = davinci.ve.widget.getEnclosingWidget(target);
			// Not sure when widget.getContext() won't be true. Maybe that check deals with
			// widgets that are either not completely ready or in process of being deleted?
			// If anyone knows answer, please update this comment.
			if(widget && !widget.getContext()){
				target = widget.domNode.parentNode;
				widget = null;
			}else{
				// Flow typically comes to here. The following check determines if
				// current widget is a container, which means it can contain other widgets.
				// If a container, then don't put editFeedback overlay over this DOM node
				// because we want user to be able to click-select on child widgets,
				// (unless the "isControl" metadata override is set for this widget type).
				if (widget && widget.getContainerNode()) {
					// Some Dijit widgets inherit from dijit._Container even those
					// they aren't really meant to contain child widgets.
					// "isControl" metadata flag overrides and says this is really 
					// a primitive widget not a container widget.
					if (!davinci.ve.metadata.queryDescriptor(widget.type, "isControl")) {
						widget = null;
					}
				}
				break;
			}
		}

		if(widget){
			var node = widget.getStyleNode();
			var box = this._context.getDojo().position(node, true);
			box.l = box.x;
			box.t = box.y;

			var domNode = widget.domNode;
			var parentNode = domNode.parentNode;
			for(var index=0;index<parentNode.children.length;index++){
				if(domNode == parentNode.children[index]){
					break;
				}
			}
			this._feedback.style.left = domNode.offsetLeft+"px";
			this._feedback.style.top = domNode.offsetTop+"px";
			this._feedback.style.width = domNode.offsetWidth+"px";
			this._feedback.style.height = domNode.offsetHeight+"px";
			/*FIXME: Need to get z-index from computed style instead */
			this._feedback.style.zIndex = domNode.style.zIndex;
			parentNode.insertBefore(this._feedback,domNode.nextSibling);
			
			this._target = widget;
		}else{
			if(this._feedback.parentNode){
				this._feedback.parentNode.removeChild(this._feedback);
			}
			this._target = null;
		}
	},

	_adjustPosition: function(position){
		if(!position){
			return undefined;
		}
		return position;
	},
	
	_findSnapOpportunities: function(widget){
		var position = this._lastSnapPosition;
		var node = widget.domNode;
		var dj = this._context.getDojo();
		// Do a little extra work because Dojo doesn't have API to give margin box with scroll.
		var dj_position_noscroll = dj.position(node, false);	// content box without scroll
		var dj_position_scroll = dj.position(node, true);	// content box with scroll
		var dj_margin_box = dj._getMarginBox(node);	// margin box
		var widget_position = dj_position_scroll;
		widget_position.x += (dj_margin_box.l - dj_position_scroll.x); // adjust for margins
		widget_position.y += (dj_margin_box.t - dj_position_scroll.y);
		
		//FIXME: Make this a preference. Also, add a preference for snapping in general.
		var hitradius=5;
		
		var currentDeltaX = this._snapX ? this._snapX.delta : hitradius+1;
		var currentDeltaY = this._snapY ? this._snapY.delta : hitradius+1;
		
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
		var _this = this;
		function snapX(type,x,delta){
			if(delta<currentDeltaX){
//console.log('snapping. type='+type+',x='+x+',delta='+delta+',currentDeltaX='+currentDeltaX);
				_this._snapX = {type:type, x:x, widget:widget, delta:delta};
				currentDeltaX = delta;
			}
		}
		function snapY(type,y,delta){
			if(delta<currentDeltaY){
//console.log('snapping. type='+type+',y='+y+',delta='+delta+',currentDeltaY='+currentDeltaY);
				_this._snapY = {type:type, y:y, widget:widget, delta:delta};
				currentDeltaY = delta;
			}
		}
		snapX("left",widgetLeft,deltaLeft);
		snapX("center",widgetCenter, deltaCenter);
		snapX("right",widgetRight, deltaRight);
		snapY("top",widgetTop,deltaTop);
		snapY("middle",widgetMiddle, deltaMiddle);
		snapY("bottom",widgetBottom, deltaBottom);
		dojo.forEach(widget.getChildren(), this._findSnapOpportunities, this);
	},
	
	_findSnapOpportunitiesTop: function(){
		dojo.forEach(this._context.getTopWidgets(), this._findSnapOpportunities, this);
	},
	
	findSnapPoints: function(){
		this._snapX = null;
		this._snapY = null;
		var editorPrefs = davinci.workbench.Preferences.getPreferences('davinci.ve.editorPrefs');
		if(editorPrefs.snap){
			this._findSnapOpportunitiesTop();
		}
	},
	
	updateSnapLines: function(event){
		var position = {x:event.pageX, y:event.pageY};
		if(this._lastSnapPosition){
			if(this._lastSnapPosition.x == position.x && this._lastSnapPosition.y == position.y){
				return;
			}
		}
		this._lastSnapPosition = position;
		var containerNode = this._context.getContainerNode();
		this.findSnapPoints();
		if(!this._snapLinesDiv){
			this._snapLinesDiv = dojo.create('div',
					{'class':'snaplines',style:'position:absolute;z-index:1001;'}, 
					containerNode);
			this._snapLinesDivWidgetX = dojo.create('div',
					{'class':'snaplinesWidgetX',style:'position:absolute;'}, 
					this._snapLinesDiv);
			this._snapLinesDivAlignX = dojo.create('div',
					{'class':'snaplinesAlignX',style:'position:absolute;'}, 
					this._snapLinesDiv);
			this._snapLinesDivWidgetY = dojo.create('div',
					{'class':'snaplinesWidgetY',style:'position:absolute;'}, 
					this._snapLinesDiv);
			this._snapLinesDivAlignY = dojo.create('div',
					{'class':'snaplinesAlignY',style:'position:absolute;'}, 
					this._snapLinesDiv);
			this._snapLinesDivWidgetX.style.left='5px';
			this._snapLinesDivWidgetX.style.top='5px';
			this._snapLinesDivWidgetX.style.width='10px';
			this._snapLinesDivWidgetX.style.height='5px';
			this._snapLinesDivWidgetX.style.backgroundColor='pink';
			this._snapLinesDivWidgetX.style.opacity='.1';
		}
		this._snapLinesDiv.style.display="block";
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
		if(this._snapX){
			snapSetup(this._context,this._snapX.widget,this._snapLinesDivWidgetX,this._snapLinesDivAlignX);
			var t,h;
			if(box.t<position.y){
				t = box.t;
				h = position.y - box.t;
			}else{
				t = position.y;
				h = box.b - position.y;
			}
			if(this._snapX.type=="left"){
				this._snapLinesDivAlignX.style.left = box.l+'px';
			}else if(this._snapX.type=="center"){
				this._snapLinesDivAlignX.style.left = box.c+'px';
			}else{	// "right"
				this._snapLinesDivAlignX.style.left = box.r+'px';
			}
			this._snapLinesDivAlignX.style.top = t+'px';
			this._snapLinesDivAlignX.style.width = '1px';
			this._snapLinesDivAlignX.style.height = h+'px';
			//FIXME: Put into stylesheet
			this._snapLinesDivAlignX.style.backgroundColor='rgba(255,0,255,.75)';
		}else{
			this._snapLinesDivWidgetX.style.display='none';
			this._snapLinesDivAlignX.style.display='none';
		}
		if(this._snapY){
			snapSetup(this._context,this._snapY.widget,this._snapLinesDivWidgetY,this._snapLinesDivAlignY);
			var l,w;
			if(box.l<position.x){
				l = box.l;
				w = position.x - box.l;
			}else{
				l = position.x;
				w = box.r - position.x;
			}
			if(this._snapY.type=="top"){
				this._snapLinesDivAlignY.style.top = box.t+'px';
			}else if(this._snapY.type=="middle"){
				this._snapLinesDivAlignY.style.top = box.m+'px';
			}else{	// "bottom"
				this._snapLinesDivAlignY.style.top = box.b+'px';
			}
			this._snapLinesDivAlignY.style.left = l+'px';
			this._snapLinesDivAlignY.style.height = '1px';
			this._snapLinesDivAlignY.style.width = w+'px';
			//FIXME: Put into stylesheet
			this._snapLinesDivAlignY.style.backgroundColor='rgba(255,0,255,.75)';
		}else{
			this._snapLinesDivWidgetY.style.display='none';
			this._snapLinesDivAlignY.style.display='none';
		}
	},
	
	clearSnapLines: function(){
		if(this._snapLinesDiv){
			this._snapLinesDiv.style.display="none";
		}
		this._snapX = this._snapY = null;
	}

});