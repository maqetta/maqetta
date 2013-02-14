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
			view.show(true /* don't run animations */);
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
				if(node==domNode){
					node.style.display = '';
					node.style.visibility = 'visible';
					node._dvWidget.dijitWidget.set('selected',true);
					command.add(new ModifyAttributeCommand(node._dvWidget, {selected: "true"}));
				}else{
					node.style.display = 'none';
					node._dvWidget.dijitWidget.set('selected',false);
					command.add(new ModifyAttributeCommand(node._dvWidget, {selected: "false"}));
				}
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
		var widget = domNode._dvWidget;
		var context = widget.getContext();
		var viewsToUpdate = [];
		var node = domNode;
		var parentNode = node.parentNode;
		
		// See if this View or any ancestor View is not currently visible
		while (node && node.tagName != 'BODY'){
			var pnode = node.parentNode;
			var node_added = false;
			if(domClass.contains(node,"mblView")){
				if(node.style.display == "none" || 
						(node && node._dvWidget && node._dvWidget.dijitWidget &&
						!node._dvWidget.dijitWidget.get('selected'))){
					viewsToUpdate.splice(0, 0, node);
					node_added = true;
				}
				if(pnode && !node_added){
					for(var i=0;i<pnode.children.length;i++){
						var n = pnode.children[i];
						if(n != node && domClass.contains(n,"mblView")){
							if(n.style.display != "none" || 
									(n && n._dvWidget && n._dvWidget.dijitWidget &&
									n._dvWidget.dijitWidget.get('selected'))){
								viewsToUpdate.splice(0, 0, node);
							}
						}
					}
				}
			}
			node = pnode;
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
	 * Override helper function to ChooseParent.js:isAllowed() for deciding whether 
	 * this particular widget type can be a child of a particular parent type.
	 * @param {object} args  - object with following properties
	 * 		{string} childType - eg "dijit.form.Button"
	 * 		{array} childClassList - list of valid children for parent, eg ["ANY"] or ["dojox.mobile.ListItem"]
	 * 		{string} parentType - eg "html.body"
	 * 		{array} parentClassList - list of valid parent for child, eg ["ANY"] or ["dojox.mobile.RoundRectList","dojox.mobile.EdgeToEdgeList"]
	 * 		{boolean} absolute - whether current widget will be added with position:absolute
	 * 		{boolean} isAllowedChild - whether Maqetta's default processing would allow this child for this parent
	 * 		{boolean} isAllowedParent - whether Maqetta's default processing would allow this parent for this child
	 * @returns {boolean}
	 * Note: Maqetta's default processing returns (args.isAllowedChild && args.isAllowedParent)
	 */
	isAllowed: function(args){
		if(args.absolute){
			// Don't allow View widgets to be positioned absolutely
			// Doesn't work with dojox.mobile because dojox.mobile will always force top:0px
			return false;
		}else{
			return args.isAllowedChild && args.isAllowedParent;
		}
	},

	/**
	 * Override helper function for error message that appears if CreateTool finds no valid parent targets
	 * @param {object} args  - object with following properties
	 * 		{string} errorMsg - default error message from application
	 * 		{string} type - eg "dijit.form.Button"
	 * 		{array} allowedParent - list of valid parent for child, eg ["ANY"] or ["dojox.mobile.RoundRectList","dojox.mobile.EdgeToEdgeList"]
	 * 		{boolean} absolute - whether current widget will be added with position:absolute
	 * @returns {string}	Error message to show
	 * Note: Maqetta's default processing returns args.errorMsg
	 */
	isAllowedError: function(args){
		if(args.absolute){
			// FIXME: i18n
			return 'dojox.mobile View widgets cannot be added using absolute layout (i.e., position:absolute)';
		}else{
			return args.errorMsg;
		}
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
	 * @param {Array[davinci.ve._Widget]} allowedParentList List of candidate parent widgets,
	 * 			where typically BODY is item 0
	 * @return {davinci.ve._Widget} One of the elements in the allowedParentList
	 */
	chooseParent: function(allowedParentList){
		for(var i = allowedParentList.length-1; i>=0; i--){
			// Look for a view in the allowedParent list
			if(i>0 && domClass.contains(allowedParentList[i].domNode,"mblView")){
				// If a view is found, return it's parent
				return allowedParentList[i-1];
			}
		}
		// Otherwise, return the BODY
		if(allowedParentList.length>=1 && allowedParentList[0].domNode.tagName == 'BODY'){
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
	},
	
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 * 		size - {w:(number), h:(number)}
	 *		position - /* if an object, then widget is created with absolute positioning
	 * 		
	 */
	initialSize: function(args){
		// If widget is being added at an absolute location (i.e., there is a value for args.position),
		if(args && args.position){
			// If user did not drag out a size, use set w=h=300px
			if(!args.size){
				return { w:300, h:300 };
			}
		}
	}

};

return ViewHelper;

});