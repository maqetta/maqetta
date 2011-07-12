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
			this._feedback.style.zIndex = "99"; // below Focus (zIndex = "100")
			dojo.style(this._feedback, "opacity", 0.1);
		}

		if(target == this._feedback){
			return;
		}

		var containerNode = this._context.getContainerNode();
		var widget;
		
		while(target && target != containerNode){
			widget = davinci.ve.widget.getEnclosingWidget(target);
			if(widget && !widget.getContext()){
				target = widget.domNode.parentNode;
				widget = null;
			}else{
				if (widget && widget.getContainerNode()) {
					// overlay feedback for "control" container (DropDownButton, etc.)
					//FIXME: Not sure why it is necessary to mask DropDownButton
					//and a small number of widgets whereas other similar widgets
					//such as DropDownSelect don't require it.
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

			if(this._feedback.parentNode != containerNode){
				containerNode.appendChild(this._feedback);
			}
			dojo.marginBox(this._feedback, box);
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
	}

});