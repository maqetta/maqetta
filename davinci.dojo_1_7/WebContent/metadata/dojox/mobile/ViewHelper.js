dojo.provide("davinci.libraries.dojo.dojox.mobile.ViewHelper");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ViewHelper", null, {
		
	constructor: function(){
		//FIXME: Lots of helper objects are instantiated. Only need one per session.
		//Need to change logic EVERYWHERE around how helpers are instantiated and referenced.
		dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._changeState));
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
		var context = widget.getContext();
		if(context && node.id){
			var bodyWidget = context.rootWidget;
			if(!davinci.ve.states.hasState(bodyWidget, node.id)){
				// Create a new state whose name matches ID on the widget
				//FIXME: Need to make this more robust
				davinci.ve.states.add(bodyWidget, node.id);				
			}
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
				var command = new davinci.commands.CompoundCommand();
				var foundOtherView = false;
				for(var i=0;i<parentNode.children.length;i++){
					node=parentNode.children[i];
					if(dojo.hasClass(node,"mblView")){
						if(node==domNode || foundOtherView){
							command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:"none"}));	
						}else{
							foundOtherView = true;
							command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:""}));
						}	
					}
				}
				context.getCommandStack().execute(command);
			}
		// Toggle visibility on for this node, toggle visibility off other Views
		}else{
			var command = new davinci.commands.CompoundCommand();
			for(var i=0;i<parentNode.children.length;i++){
				node=parentNode.children[i];
				if(dojo.hasClass(node,"mblView")){
					if(node==domNode){
						command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:""}));
					}else{
						command.add(new davinci.ve.commands.StyleCommand(node._dvWidget, {display:"none"}));
					}	
				}
			}
			context.getCommandStack().execute(command);
		}
		return false;
	},
	
	_widgetSelectedUpdateVisibility: function(domNode){	
		if(domNode && domNode._dvWidget){
			var parentNode = domNode.parentNode;
			for(var i=0;i<parentNode.children.length;i++){
				var node=parentNode.children[i];
				if(node==domNode){
					node.style.display = "";
				}else if(dojo.hasClass(node,"mblView")){
					node.style.display = "none";
				}	
			}
			dojo.publish("/davinci/ve/widget/visibility/changed/widget",[domNode._dvWidget]);
		}
	},
	
	_changeState: function(event){	
		if(event && event.newState && event.widget && event.widget.domNode){
			var newState = event.newState;
			var dj = event.widget.domNode.ownerDocument.defaultView.dojo;
			var domNode = dj.byId(newState);
			var context = (domNode._dvWidget && domNode._dvWidget.getContext());
			if(domNode && context && dojo.hasClass(domNode,"mblView")){
				context.select(domNode._dvWidget);
				davinci.libraries.dojo.dojox.mobile.ViewHelper.prototype._widgetSelectedUpdateVisibility(domNode);
				dojo.publish("/davinci/ve/widget/visibility/changed/end",[]);
			}
		}
	},
	
	onSelect: function(widget){
		if(widget){
			var domNode = widget.domNode;
			if(domNode){
				/*
				var parentNode = domNode.parentNode;
				for(var i=0;i<parentNode.children.length;i++){
					var node=parentNode.children[i];
					if(node==domNode){
						node.style.display = "";
					}else if(dojo.hasClass(node,"mblView")){
						node.style.display = "none";
					}	
				}
				dojo.publish("/davinci/ve/widget/visibility/changed/widget",[widget]);
				*/
				davinci.libraries.dojo.dojox.mobile.ViewHelper.prototype._widgetSelectedUpdateVisibility(domNode);
				var context = widget.getContext();
				if(context && domNode.id){
					var bodyWidget = context.rootWidget;
					if(davinci.ve.states.hasState(bodyWidget, domNode.id)){
						// Set the current state to the state name that matches ID on the widget
						//FIXME: Need to make this more robust
						davinci.ve.states.setState(bodyWidget, domNode.id);				
					}
				}	
			}
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
	 * @param {Array[davinci.ve._Widget]} allowedParentList List of candidate parent widgets
	 * @return {davinci.ve._Widget} One of the elements in the allowedParentList
	 */
	chooseParent: function(allowedParentList){
		if(allowedParentList.length>1 && dojo.hasClass(allowedParentList[0].domNode,"mblView")){
			return allowedParentList[1];
		}else{
			return allowedParentList[0];
		}

	}
	
});