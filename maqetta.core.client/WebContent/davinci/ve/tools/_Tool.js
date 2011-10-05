define(["dojo/_base/declare",
        "davinci/ve/widget",
        "davinci/ve/metadata"], function(declare, widget, metadata){

return declare("davinci.ve.tools._Tool", null, {

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
		var w;
		
		while(target && target != containerNode){
			w = widget.getEnclosingWidget(target);
			// Not sure when w.getContext() won't be true. Maybe that check deals with
			// widgets that are either not completely ready or in process of being deleted?
			// If anyone knows answer, please update this comment.
			if(w && !w.getContext()){
				target = w.domNode.parentNode;
				w = null;
			}else{
				// Flow typically comes to here. The following check determines if
				// current widget is a container, which means it can contain other widgets.
				// If a container, then don't put editFeedback overlay over this DOM node
				// because we want user to be able to click-select on child widgets,
				// (unless the "isControl" metadata override is set for this widget type).
				if (w && w.getContainerNode()) {
					// Some Dijit widgets inherit from dijit._Container even those
					// they aren't really meant to contain child widgets.
					// "isControl" metadata flag overrides and says this is really 
					// a primitive widget not a container widget.
					if (!davinci.ve.metadata.queryDescriptor(w.type, "isControl")) {
						w = null;
					}
				}
				break;
			}
		}

		if(w){
			var node = w.getStyleNode();
			var box = this._context.getDojo().position(node, true);
			box.l = box.x;
			box.t = box.y;

			var domNode = w.domNode;
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
			
			this._target = w;
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
	},

	/**
	 * Create a candidate list of valid parents for the dropped widget, based on the widgets'
	 * 'allowedChild' and 'allowedParent' properties. The logic ascends the DOM hierarchy
	 * starting with "target" to find all possible valid parents. If no valid parent is
	 * found, then return an empty array.
	 * 
	 * @param target {davinci.ve._Widget}
	 * 			The widget on which the user dropped the new widget.
	 * @param data {Array|Object}
	 * 			Data for the dropped widget.
	 * @param climb {boolean}
	 * 			Whether to climb the DOM looking for matches.
	 * @return an array of widgets which are possible valid parents for the dropped widget
	 * @type davinci.ve._Widget
	 */
	_getAllowedTargetWidget: function(target, data, climb) {
		// returns an array consisting of 'type' and any 'class' properties
		function getClassList(type) {
			var classList = davinci.ve.metadata.queryDescriptor(type, 'class');
			if (classList) {
				classList = classList.split(/\s+/);
				classList.push(type);
				return classList;
			}
			return [type];
		}
		
		// returns 'true' if any of the elements in 'classes' are in 'arr'
		function containsClass(arr, classes) {
			return classes.some(function(elem) {
				return arr.indexOf(elem) !== -1;
			});
		}
		
		// Returns 'true' if the dropped widget is allowed as a child of the
		// given parent.
		function isAllowed(children, parent) {
			var parentType = parent instanceof davinci.ve._Widget ?
					parent.type : parent._dvWidget.type;
			var parentClassList,
				allowedChild = davinci.ve.metadata.getAllowedChild(parentType);
			
			// special case for HTML <body>
			if (parentType === "html.body") {
				allowedChild = ["ANY"];
			}
			parentClassList = getClassList(parentType);
			
			// Cycle through children, making sure that all of them work for
			// the given parent.
			return children.every(function(child){
				var isAllowedChild = allowedChild[0] !== "NONE" &&
									 (allowedChild[0] === "ANY" ||
									  containsClass(allowedChild, child.classList));
				var isAllowedParent = child.allowedParent[0] === "ANY" ||
									  containsClass(child.allowedParent, parentClassList);
				return isAllowedChild && isAllowedParent;
			});
		}
		
		// get data for widget we are adding to page
		var getEnclosingWidget = widget.getEnclosingWidget,
			newTarget = target,
			allowedParentList = [],
			data = data.length ? data : [data],
			children = [];

		// 'data' may represent a single widget or an array of widgets.
		// Get data for all widgets, for use later in isAllowed().
		data.forEach(function(elem) {
			children.push({
				allowedParent: davinci.ve.metadata.getAllowedParent(elem.type),
				classList: getClassList(elem.type)
			});
		});

		do {
			if(isAllowed(children, newTarget)){
				allowedParentList.push(newTarget);
			}
			newTarget = getEnclosingWidget(newTarget);
		} while (newTarget && climb)
		
		return allowedParentList;
	}
});
});