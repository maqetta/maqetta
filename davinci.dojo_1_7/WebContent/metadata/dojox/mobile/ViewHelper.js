define([
	"dojo/_base/connect",
	"dojo/dom-class",
	"dojo/window",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/StyleCommand",
	"davinci/ve/commands/ModifyAttributeCommand"
], function(
	connect,
	domClass,
	windowUtils,
	CompoundCommand,
	StyleCommand,
	ModifyAttributeCommand
) {

var ViewHelper = function() {
	//FIXME: Need helper added to StatesView palette
};

ViewHelper.prototype = {

	/**
	 * Override default dojox.mobile.View behavior, which is to automatically
	 * hide ("display: none") any additional Views added to page.  This causes
	 * the Outline view to be out of sync with the Visual Editor -- Outline
	 * shows a View as visible (open eyeball), but in the VE the View has
	 * "display: none" set.
	 * 
	 * DEV NOTES: Had to rely on 'setInterval' since nothing else would work.
	 * In the case where a View is hidden, the Dojox code publishes no event
	 * and calls no function to which I could dojo.connect(). Plus, the code
	 * that hides the View DOM node takes place in a 'setTimeout', potentially
	 * introducing timing issues between that code and this. For these reasons,
	 * I had to settle for a 'setInterval' that keeps getting called until
	 * "display: none" is set on the View -- at that point, the code resets it
	 * to "display: block".
	 */
	create: function(widget, srcElement) {
		var view = widget.dijitWidget,
			node = widget.domNode,
			parentNode = node.parentNode,
			context = widget.getContext();
		// Set disableTouchScroll=true so that SwapView logic (actually scrollable.js)
		// doesn't grab touch/mousedown events (for flick processing)
		view.disableTouchScroll = true;
		connect.connect(view, 'startup', function() {
			if(context.sceneManagers && context.sceneManagers.DojoMobileViews){
				context.sceneManagers.DojoMobileViews._viewAdded(parentNode._dvWidget, widget);
			}
			// Since this may get called twice, check that we haven't already
			// created this interval.
			if (! widget._dvDisplayInterval) {
				widget._dvDisplayInterval = setInterval(function() {
					if(!node || !node.ownerDocument || !node.ownerDocument.defaultView){
						return;
					}
					var win = windowUtils.get(node.ownerDocument);
					if(!win || !win.dojox || !win.dojox.mobile){
						return;
					}
					if (win.dojox.mobile.currentView === view ||
							node.style.display === 'none') {
						node.style.display = 'block';
						clearInterval(widget._dvDisplayInterval);
						delete widget._dvDisplayInterval;
					}
				}, 100);
			}
		});
	},

	/*
	 * Internal function to update visibility of a particular View's domNode
	 * and its siblings. 
	 */
	_makeVisible: function(domNode, command){
		var parentNode = domNode.parentNode;
		for(var i=0;i<parentNode.children.length;i++){
			node=parentNode.children[i];
			if(domClass.contains(node,"mblView")){
				//NOTE: setting internal property 'disableTouchScroll', not using official APIs
				//because official API (dijitWidget.disableTouch(true)) would need to be
				//called after the 'display:block' operation occurred, and we don't
				//have a mechanism for triggering additional logic after command stack has completed
				node._dvWidget.dijitWidget.disableTouchScroll = true;
				var display, selected;
				if(node==domNode){
					display = "";
					selected = "true";
				}else{
					display = "none";
					selected = null;
				}	
				command.add(new StyleCommand(node._dvWidget, [{display: display}]));	
				command.add(new ModifyAttributeCommand(node._dvWidget, {selected: selected}));	
			}
		}
	},
	
	/*
	 * Ensures that the given View widget has its visibility turned on and
	 * other sibling View widgets have their visibility turned off 
	 * @param {davinci.ve._Widget} widget  Widget that needs it visibility turned on
	 */
	_updateVisibility: function(domNode){
		if(!domNode || !domNode._dvWidget || !domClass.contains(domNode,"mblView")){
			return;
		}
		var parentNode = domNode.parentNode;
		var widget = domNode._dvWidget;
		var context = widget.getContext();
		var viewsToUpdate = [];
		var node = domNode;
		var pnode = parentNode;
		// See if this View or any ancestor View is not currently visible
		while (node.tagName != 'BODY'){
			if(node.style.display == "none" || node.getAttribute("selected") != "true"){
				viewsToUpdate.splice(0, 0, node);
			}else{
				for(var i=0;i<pnode.children.length;i++){
					n=pnode.children[i];
					if(domClass.contains(n,"mblView")){
						if(n!=node && (n.style.display != "none" || n.getAttribute("selected") == "true")){
							viewsToUpdate.splice(0, 0, node);
							break;
						}
					}
				}
			}
			node = pnode;
			pnode = node.parentNode;
		}
		// Update visibility of any Views that need adjusting
		if(viewsToUpdate.length > 0){
			var command = new CompoundCommand();
			for(var v=0;v<viewsToUpdate.length;v++){
				var viewNode = viewsToUpdate[v];
				this._makeVisible(viewNode, command);
			}
			context.getCommandStack().execute(command);
		}
		if(context.sceneManagers && context.sceneManagers.DojoMobileViews){
			context.sceneManagers.DojoMobileViews._viewSelectionChanged(parentNode._dvWidget, widget);
		}
	},
	
	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle processing should proceed
	 * FIXME: Better if helper had a class inheritance setup
	 */
	onToggleVisibility: function(widget, on){
		if(!widget || !widget.domNode || !domClass.contains(widget.domNode,"mblView")){
			return true;
		}
		var domNode = widget.domNode;
		var parentNode = domNode.parentNode;
		var node;
		// Only toggle visibility off if there is another View that we can toggle on
		if(on){
			var count = 0;
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(domClass.contains(node,"mblView")){
					count++;
				}
			}
			if(count>1){
				for(var i=0;i<parentNode.children.length;i++){
					node=parentNode.children[i];
					if(domClass.contains(node,"mblView")){
						if(node!=domNode){
							this._updateVisibility(node);
							break;
						}
					}
				}
			}
		// Toggle visibility on for this node, toggle visibility off other Views
		}else{
			this._updateVisibility(domNode);
		}
		return false;
	},
	
	onSelect: function(widget){
		if(!widget || !widget.domNode || !domClass.contains(widget.domNode,"mblView")){
			return;
		}
		this._updateVisibility(widget.domNode);
	},

	/**
	 * By default, when dragging/dropping new widgets onto canvas, Maqetta
	 * defaults to adding a new widget as a child of the mostly deeply nested
	 * valid container that is under the mouse points. But for View widgets,
	 * which default to height:100%, this means it is really hard for the user
	 * to create sibling View widgets via drag/drop. This helper function
	 * makes it so that by default a new View element will be added as a sibling
	 * to the candidate view target.
	 * 
	 * @param {Array[davinci.ve._Widget]} allowedParentList List of candidate parent widgets
	 * @return {davinci.ve._Widget} One of the elements in the allowedParentList
	 */
	chooseParent: function(allowedParentList){
		if(allowedParentList.length>1 && domClass.contains(allowedParentList[0].domNode,"mblView")){
			return allowedParentList[1];
		}else{
			return allowedParentList[0];
		}

	},
	
	/**
	 * Called at end of document loading, after all widgets initialized.
	 * @param {davinci.ve._Widget} widget  A View widget
	 * @param {boolean} already  False if this first call for this document. True for subsequent widgets.
	 */
	onLoad: function(widget, already){
		if(already){
			// Only run this logic once
			return;
		}
		var domNode = widget.domNode;
		var parentNode = domNode.parentNode;
		var dijitWidget, node, selectedNode;
		// Find first widget with 'selected' attribute set to true
		// If none found, then pick first View node
		for(var i=0;i<parentNode.children.length;i++){
			node=parentNode.children[i];
			if(domClass.contains(node,"mblView")){
				if(!selectedNode){
					selectedNode = node;
				}
				dijitWidget = node._dvWidget.dijitWidget;
				if(dijitWidget.selected){
					selectedNode = node;
					break;
				}
			}
		}
		this._updateVisibility(selectedNode);
	},
	
	/**
	 * Called by RemoveCommand before removal actions take place.
	 * @param {davinci.ve._Widget} widget  A View widget
	 * @return {function}  Optional function to call after removal actions take place
	 */
	onRemove: function(widget){
		if(!widget || !widget.domNode || !domClass.contains(widget.domNode,"mblView")){
			return;
		}
		var domNode = widget.domNode;
		var id = domNode.id;
		var context = widget.getContext();
		var parentNode = domNode.parentNode;
		var node;
		var changesNeeded = false;
		// If deleting the currently selected View, then we need a find a new selected view
		if(domNode.style.display !== "none" || domNode.getAttribute("selected") === "true"){
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(domClass.contains(node,"mblView")){
					if(node!=domNode){
						changesNeeded = true;
						break;
					}
				}
			}
		}
		return function(){
			if(context.sceneManagers && context.sceneManagers.DojoMobileViews){
				context.sceneManagers.DojoMobileViews._viewDeleted(parentNode._dvWidget);
			}
			if(changesNeeded){
				context.select(node._dvWidget);
			}
		};
	},
	
	/**
	 * Called by SelectTool to see if this widget can be dragged to a different location.
	 * We disable dragging of view widgets whose parent is the BODY because
	 * we set default in Maqetta to make view widgets such that exactly one shows
	 * at a time. Therefore, no place to drag it.
	 * @param {davinci.ve._Widget} widget  A View widget
	 */
	disableDragging: function(widget){
		if(!widget || !widget.getParent){
			return false;
		}
		var parent = widget.getParent();
		if(!parent || !parent.domNode){
			return false;
		}
		if(parent.domNode.tagName == 'BODY'){
			return true;
		}else{
			return false;
		}
	}

};

return ViewHelper;

});