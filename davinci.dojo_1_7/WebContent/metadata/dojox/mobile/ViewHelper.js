dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewHelper");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.StyleCommand");
dojo.require("davinci.ve.commands.ModifyAttributeCommand");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewHelper", null, {

	constructor: function(){		
		//FIXME: Need helper added to StatesView palette
	},

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
			node = widget.domNode;
		dojo.connect(view, 'startup', function() {
			// Since this may get called twice, check that we haven't already
			// created this interval.
			if (! widget._dvDisplayInterval) {
				widget._dvDisplayInterval = setInterval(function() {
					var win = dijit.getDocumentWindow(node.ownerDocument);
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
	 * Ensures that the given View widget has its visibility turned on and
	 * other sibling View widgets have their visibility turned off 
	 * @param {davinci.ve._Widget} widget  Widget that needs it visibility turned on
	 */
	_updateVisibility: function(domNode){
		if(!domNode || !domNode._dvWidget || !dojo.hasClass(domNode,"mblView")){
			return;
		}
		var widget = domNode._dvWidget;
		var context = widget.getContext();
		var parentNode = domNode.parentNode;
		var node;
		var state = davinci.ve.states.getState();
		var changesNeeded = false;
		if(domNode.style.display == "none" || domNode.getAttribute("selected") != "true"){
			changesNeeded = true;
		}else{
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(dojo.hasClass(node,"mblView")){
					if(node!=domNode && (node.style.display != "none" || domNode.getAttribute("selected") == "true")){
						changesNeeded = true;
						break;
					}
				}
			}
		}
		if(changesNeeded){
			var command = new davinci.commands.CompoundCommand();
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(dojo.hasClass(node,"mblView")){
					if(node==domNode){
						command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:""}));	
						command.add(new davinci.ve.commands.ModifyAttributeCommand(node._dvWidget, {selected:"true"}));	
					}else{
						command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:"none"}));	
						command.add(new davinci.ve.commands.ModifyAttributeCommand(node._dvWidget, {selected:null}));
					}	
				}
			}
			context.getCommandStack().execute(command);
		}
	},
	
	/*
	 * Called by Outline palette whenever user toggles visibility by clicking on eyeball.
	 * @param {davinci.ve._Widget} widget  Widget whose visibility is being toggled
	 * @param {boolean} on  Whether given widget is currently visible
	 * @return {boolean}  whether standard toggle proceessing should proceed
	 * FIXME: Better if helper had a class inheritance setup
	 */
	onToggleVisibility: function(widget, on){
		if(!widget || !widget.domNode || !dojo.hasClass(widget.domNode,"mblView")){
			return true;
		}
		var domNode = widget.domNode;
		var context = widget.getContext();
		var parentNode = domNode.parentNode;
		var node;
		var state = davinci.ve.states.getState();
		// Only toggle visibility off if there is another View that we can toggle on
		if(on){
			var count = 0;
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(dojo.hasClass(node,"mblView")){
					count++;
				}
			}
			if(count>1){
				for(var i=0;i<parentNode.children.length;i++){
					node=parentNode.children[i];
					if(dojo.hasClass(node,"mblView")){
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
		if(!widget || !widget.domNode || !dojo.hasClass(widget.domNode,"mblView")){
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
		if(allowedParentList.length>1 && dojo.hasClass(allowedParentList[0].domNode,"mblView")){
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
		var context = widget.getContext();
		var parentNode = domNode.parentNode;
		var dijitWidget, node, selectedNode;
		var state = davinci.ve.states.getState();
		// Find first widget with 'selected' attribute set to true
		// If none found, then pick first View node
		for(var i=0;i<parentNode.children.length;i++){
			node=parentNode.children[i];
			if(dojo.hasClass(node,"mblView")){
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
	}
	
});
