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
			
			//FIXME: no side effects? index is never used?
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

	//FIXME: pointless?
	_adjustPosition: function(position){
		if(!position){
			return undefined;
		}
		return position;
	}

});