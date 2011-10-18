dojo.provide("davinci.ve.themeEditor.VisualThemeOutline");
dojo.require("davinci.ve.VisualEditorOutline");
dojo.require("davinci.ve.States");

dojo.declare("davinci.ve.themeEditor.VisualThemeOutline",davinci.ve.VisualEditorOutline, {

	constructor: function (editor)
	{
		davinci.states.subscribe("/davinci/states/state/changed", dojo.hitch(this, function(e) { 
			if (!top.davinci || (davinci.Runtime.currentEditor && davinci.Runtime.currentEditor.declaredClass) != "davinci.ve.themeEditor.ThemeEditor"){
				// ignore updates when not in theme editor
				return;
			}
			if (!this._tree){
				return;
			}
			
			var isNormalState = davinci.ve.states.isNormalState(e.newState);
			var statesNodeId = "states_" + e.widget.id;
			var statesNode = this._tree.getNode(statesNodeId);
			if (statesNode) {
				var stateNodes = statesNode.getChildren();
				var stateNodeId = isNormalState ? "Normal_" + statesNodeId : e.newState + "_" + statesNodeId;
				var stateNode = this._tree.getNode(stateNodeId);			
				
				// Enable the eyeball icon for the new state node, and disable the eyeball icon for all other state nodes
				dojo.forEach(stateNodes, function(node) {
					node._setToggleAttr(node != stateNode);
				});
			}
		}));
	},
	
	getModel: function(editor)
	{
		this._context._theme = editor._theme;
		this._model = new davinci.ve.themeEditor.ThemeOutlineTreeModel(this._context);
		return this._model;
	},
	
	_getItemType: function(item) {
		var type = item.type;
		debugger;
		if (item.id == "myapp") {
			type = "root";
		} else if (dojo.indexOf(["subwidget", "states", "state"], type) == -1) {
			type = "widget";
		}
		return type;
	},
	
	/**
	 * Returns the widget currently selected in the outline tree, or undefined if no widget is selected in the outline.
	 * Note: If a subwidget or state is selected in the outline, this method will return the implicitly selected widget ancestor of that subwidget or state.
	 * To determine if the widget is explicitly selected, compare with outline.getSelectedItem().
	 */
	getSelectedWidget: function(type) {
		var item = this.getSelectedItem();
		if (!item) return;
		
		type = type || "widget";
		while (item && this._getItemType(item) != type) {
			item = item.parent;
		}
		return item;
	},
	
	/**
	 * Returns the subwidget currently selected in the outline tree, or undefined if no subwidget is selected in the outline.
	 * Note: If a state is selected in the outline, this method will return the implicitly selected subwidget ancestor of that state.
	 * To determine if the subwidget is explicitly selected, compare with outline.getSelectedItem().
	 */
	getSelectedSubwidget: function() {
		return this.getSelectedWidget("subwidget");
	},
	
	/**
	 * Returns the state currently selected in the outline tree, or undefined if no state is selected in the outline.
	 * Note: The selected state is not necessarily the same as the current active state of the widget.
	 * To get the current active state of a widget, call davinci.ve.states.getState(widget).
	 */
	getSelectedState: function() {
		return this.getSelectedWidget("state");
	}
});



dojo.declare("davinci.ve.themeEditor.ThemeOutlineTreeModel", davinci.ve.OutlineTreeModel, {

	dndController: null,

	constructor: function(context)	
	{
		this.metadataProvider = context._theme;//new davinci.metadata.CSSThemeProvider();
	},

	getMetadata: function(widget) {
		var metadata = this.metadataProvider.getMetadata(widget.declaredClass);
		if (metadata) {
			var metadataStates = metadata.states;
			var states;
			for (var name in metadataStates) {
				states = states || {};
				states[name] = { origin: true };
			}
			var metadataSubwidgets = metadata.subwidgets;
			var subwidgets = [];
			for (var name in metadataSubwidgets) {
				if (name != "derivesFrom") {
					var subwidget = metadataSubwidgets[name];
					subwidget = dojo.mixin({id: name, type: "subwidget", label: name}, subwidget);
					var subwidgetStates;
					for (var stateName in subwidget.states) {
						subwidgetStates = subwidgetStates || {};
						subwidgetStates[stateName] = { origin: true };
					}
					if (subwidgetStates) {
						subwidget.states = subwidgetStates;
						subwidgetStates = undefined;
					} else {
						delete subwidget.states;
					}
					subwidget.parent = widget;
					subwidgets.push(subwidget);
				}
			}

			metadata = {};
			if (states) {
				metadata.states = states;
			}
			if (subwidgets.length > 0) {
				metadata.subwidgets = subwidgets;
			}
			return metadata;
		}
		return {};
	},

	isThemeWidget: function(widget) {
		return widget.dvAttributes && widget.dvAttributes.isThemeWidget;
	},

	_childList: function(parentItem)
	{
		var widgets, children=[];

		if (!this._context.rootNode || (parentItem.type == "state")) {
			return [];
		}
		
		if (parentItem.type == "states") {
			var states = parentItem.states;
			dojo.forEach(states, function(state){
				children.push({
					id: state + "_" + parentItem.id, 
					name: state, 
					parent: parentItem, 
					type: "state", 
					label: state
				});
			}, this);
			return children;
		}

		if (parentItem === this._context.rootNode) {
			widgets = this._context.getTopWidgets();			
		} else {
			var metadata = this.getMetadata(parentItem);
			dojo.mixin(parentItem, metadata);
			var states = davinci.ve.states.getStates(parentItem);
			if (states && states.length > 1) {
				children.push({ 
					id: "states_" + parentItem.id, 
					parent: parentItem, 
					type: "states", 
					states: states, 
					label: "States" 
				});
			}
			if (parentItem.subwidgets) {
				dojo.forEach(parentItem.subwidgets, function(subwidget){
					children.push(subwidget);
				}, this);
			}
			if ( parentItem.type == "subwidget" ) {
				return children;
			}
			widgets = parentItem.getChildren();
		}
		// we need recursion here to maintain the order of the widgets in the tree matching the order in the themeEditor
		this._getThemeWidgets(widgets, children);
		return children;
	},

	_getThemeWidgets: function(widgets, /*return Array*/ children) {
		//var children=[];
		dojo.forEach(widgets, function(widget){
			if(widget.getContext()){
				// managed widget only
				if (this.isThemeWidget(widget)) {
					children.push(widget);
				} else {
					var widgetChildren = widget.getChildren();
					this._getThemeWidgets(widgetChildren, children);
				}
			}
		}, this);
		return;
	},

	getLabel: function(/*dojo.data.Item*/ item){
		debugger;
		if(item.id == "myapp"){
			return "Theme";
		}
		return this.inherited(arguments);
	},

	toggle: function(item, on, node) {
		var visible = !on;
		var state = item.name;
		var statesNode = node.getParent();
		var widget = statesNode.item.parent;
		// if !visible, undefined switches to Normal state
		davinci.ve.states.setState(widget, visible ? state : undefined);
		return false; // state listener will handle toggle
	},

	isToggleOn: function(item) {
		var parent = item.parent.parent;
		var state = davinci.ve.states.getState(parent);
		return item.name != (state || "Normal");
	},

	shouldShowElement: function(elementId, item) {
		if (elementId == "toggleNode") {
			return item.type == "state";
		}
		return true;
	},

	refresh: function(){
		if(!this._initialSet) {
			try {
				var node = this._context.rootNode;
				this.onChildrenChange(node, this._childList(node));//this.onRefresh();
			}catch(e){
				 console.error(e, "error in VisualEditorOutline::refresh");
			}
		}
		this._initialSet = true;	
	}	
});
