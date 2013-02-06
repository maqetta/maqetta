define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"./commands/ReparentCommand",
	"./commands/StyleCommand",
	"./widget",
	"./States",
	"dijit/tree/dndSource",
	"../Runtime"
], function(
	declare,
	connect,
	ReparentCommand,
	StyleCommand,
	Widget,
	States,
	dndSource,
	Runtime
){

var DesignOutlineTreeModel = declare(null, {
	toggleMode: true,
	betweenThreshold: 4,
	showRoot: true,
	
	dndController: "dijit.tree.dndSource",

	constructor: function(context) {
		this._context = context;
		this._handles = [];
		this._connect("activate", "_rebuild");
		this._connect("widgetChanged", "_widgetChanged");
	},

	getRoot: function(onItem, onError) {
		onItem(this._context.rootWidget || {id: "myapp", label:"application"});
	},

	getLabel: function(item) {
		if (item.id == "myapp") {
			return this._context.model.fileName;
		}

		var widget = this._getWidget(item);

		if (widget.isWidget) {
			label = Widget.getLabel(widget);
			return label;
		}

		var type = widget.type;

		if (!type) {
			return;
		}
		
		var lt = this.useRichTextLabel ? "&lt;" : "<";
		var gt = this.useRichTextLabel ? "&gt;" : ">";

		if (type.indexOf("html.") === 0) {
			label = lt + type.substring("html.".length) + gt;
		} else if (type.indexOf("OpenAjax.") === 0) {
			label = lt + type.substring("OpenAjax.".length) + gt;
		} else if (type.indexOf(".") > 0 ) {
			label = type.substring(type.lastIndexOf(".")+1);
		} else {
			label = widget.label || type;
		}

		var widget = Widget.byId(widget.id, this._context.getDocument());
		if (widget) {
			var id = widget.getId();
			if (id ) {
				label += " id=" + id;
			}
		}
		return label;
	},

	_getChildren: function(item) {
		var widgets;

		if (!this._context.rootWidget || item.type == "state" || item.type == 'html.stickynote' || item.type == 'html.richtext') {
			return [];
		}

		if (item.id == "myapp" || item === this._context.rootNode) {
			widgets = this._context.getTopWidgets();
		} else {
			widgets = this._getWidget(item).getChildren();
		}
		
		return widgets.filter(function(widget) {
			// managed widget only
			return widget && widget.getContext && widget.getContext() && !widget.internal && widget._srcElement;
		}).map(this._buildItem);
	},
	
	mayHaveChildren: function(item) {
		var widget = this._getWidget(item);

		if (widget && widget.type && widget.type.indexOf("OpenAjax.") === 0) {
			return false;
		}

		return this._getChildren(widget).length > 0;
	},

	getIdentity: function(item){
		return item.id;
	},

	getChildren: function(item, onComplete, onError) {
		onComplete(this._getChildren(item));
	},

	put: function(item, options) {
		var widget = this._getWidget(item);

		var parent = widget.getParent();

		this.onChildrenChange(parent, this._getChildren(parent));

		return this.getIdentity(widget);
	},

	add: function(item, options) {
		(options = options || {}).overwrite = false;
		return this.put(item, options);
	},

	remove: function(item) {
		this.onDelete(item);
	},

	newItem: function(/* Object? */ args, /*Item?*/ parent) {
	},

	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy, /*int?*/ insertIndex, /*Item*/ before) {
		if (!childItem || !newParentItem || !oldParentItem) {
			return;
		}

		if (newParentItem.id == "myapp") {
			newParentItem = this._context.rootWidget;
		} else {
			newParentItem = this._getWidget(newParentItem);
		}

		if (oldParentItem.id == "myapp") {
			oldParentItem = this._context.rootWidget;
		} else {
			oldParentItem = this._getWidget(oldParentItem);
		}

		childItem = this._getWidget(childItem);

		// dndSource fixes up insertIndex, however Reparent will do the same, so we
		// undo the fixup here.
		if (oldParentItem == newParentItem && !bCopy) {
			 var oldIndex = dojo.indexOf(oldParentItem.getChildren(), childItem);
			 if (oldIndex < insertIndex) {
			 	 insertIndex++;
			 }
		}

		var command = new ReparentCommand(childItem, newParentItem, insertIndex);
		this._context.getCommandStack().execute(command);
	},

	checkItemAcceptance: function(target, source, position) {
		switch(position) {
			case "before":
			case "after":
				return true;
			default: // if not dropping before or after an item, make sure the target item has a container node
				var item = dijit.getEnclosingWidget(target).item;
				var widget = this.tree.model._getWidget(item);
				return (widget.getContainerNode && widget.getContainerNode()) || widget.id == "myapp";
		}
	}, 

	onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
	},

	_rebuild: function() {
		if (this._skipRefresh) { return; }

		var node = this._context.rootNode;

		if (node) {	// shouldn't be necessary, but sometime is null
			this.onChildrenChange(this._buildItem(node), this._getChildren(node));
		}
	},

	_widgetChanged: function(type, widget, args) {
		try {
			if (type === this._context.WIDGET_ADDED) {
				this.add(widget);
			} else if (type === this._context.WIDGET_REMOVED) {
				this.remove(widget);
			} else if (type === this._context.WIDGET_MODIFIED) {
				this.onChange(widget);

				// finally, we tell the widget that its children might have changed
				this.onChildrenChange(widget, this._getChildren(widget));
			} else if (type === this._context.WIDGET_REPARENTED) {
				// args = [oldParent, newParent]

				// remove the old widget first
				this.remove(widget);

				// now add it with the new parent
				this.put(widget, {
						overwrite: true,
						parent: args[1]
				});				
			} else if (type === this._context.WIDGET_ID_CHANGED) {
				// widget id changed - args is the old id
				// We remove the old one and add the new widget
				this.remove({id: args});
				this.add(widget);
			}
		} catch (e) {
			console.error("VisualEditorOutline._widgetChanged: e = " + e);
		}
	},

	// toggle code
	toggle: function(item, on, node) {
		var widget = this._getWidget(item);

		var helper = widget.getHelper();
		var continueProcessing = true;
		if(helper && helper.onToggleVisibility){
			//FIXME: Make sure that helper functions deals properly with CommandStack and undo
			continueProcessing = helper.onToggleVisibility(widget, on);
		}
		if(continueProcessing){
			this._toggle(widget, on, node);
			return true;
		}else{
			return false;
		}
	},
	
	_toggle: function(widget, on, node) {
		var visible = !on;
		var value = visible ? "" : "none";
		var state;
		var statesFocus = States.getFocus(widget.domNode.ownerDocument.body);
		if(statesFocus){
			state = statesFocus.state;
		}else{
			var currentStatesList = States.getStatesListCurrent(widget.domNode);
			for(var i=0; i<currentStatesList.length; i++){
				if(currentStatesList[i]){
					state = currentStatesList[i];
					break;
				}
			}
		}
		var command = new StyleCommand(widget, [{display: value}], state);
		this._context.getCommandStack().execute(command);
	},

	shouldShowElement: function(elementId, item) {
		if (elementId == "toggleNode") {
			return item.type != "states" && item.id != "myapp";
		}
		return true;
	},

	_getToggledItemsAttr: function(){
		var items = [];
		for(var i in this.toggledItems){
			items.push(i);
		}
		return items; // dojo.data.Item[]
	},

	isToggleOn: function(item) {
		
		var widget = this._getWidget(item);
		var helper = widget.getHelper();
		var continueProcessing = true;
		if(helper && helper.isToggleOn){
			return helper.isToggleOn(widget);
		}else{
			return (widget.domNode.style.display === 'none');
		}
		
	},
	// end toggle code

	_getWidget: function(item) {
		return Widget.byId(item.id);
	},

	_buildItem: function(widget) {
		if (widget) {
			return {id: widget.id, type: widget.type};
		}
	},

	_connect: function(contextFunction, thisFunction) {
		this._handles.push(connect.connect(this._context, contextFunction, this, thisFunction));
	},

	destroy: function(){
		this._handles.forEach(connect.disconnect);
	}
});

return declare("davinci.ve.VisualEditorOutline", null, {

	toolbarID: "davinci.ve.outline",

	_outlineMode: "design", 
		
	constructor: function (editor) {
		this._editor = editor;
		this._context=editor.visualEditor.context;
		this._handles=[];
		this._connect("onSelectionChange", "onSelectionChange");
		this._connect("deselect", "deselect"); 
		
		this._widgetModel=new DesignOutlineTreeModel(this._context);
		//this._srcModel=new HTMLOutlineModel(editor.model);
		connect.subscribe("/maqetta/appstates/state/changed/end", this,
			function(e) {
				var declaredClass = (typeof davinci !== "undefined") &&
						Runtime.currentEditor &&
						Runtime.currentEditor.declaredClass;
				if (declaredClass === "davinci.themeEditor.ThemeEditor") {
					return; // ignore updates in theme editor
				}
				if (!this._tree) {
					return;
				}
				var widget = (e && e.node && e.node._dvWidget);
				if(!widget){
					return;
				}
				var children = widget.getChildren();
				while (children.length) {
					var child = children.shift();
					if (child) {
						var visible = (child.domNode.style.display !== 'none');
						this._tree.toggleNode(child, !visible);
						children = children.concat(child.getChildren());
					}
				}
			}
		);
	},

	getActionsID: function () {
		if (this._outlineMode === 'design') {
			return "davinci.ve.VisualEditorOutline";
		}
	},

	_connect: function(contextFunction, thisFunction) {
		this._handles.push(connect.connect(this._context, contextFunction, this, thisFunction));
	},

	switchDisplayMode: function (newMode) {
		this._outlineMode=newMode;
		this._outlineView.createTree();
	},
	
	getModel: function() {
		switch (this._outlineMode)
		{
		case "design":
			this._model=this._widgetModel;
			break;
		case  "source":
			this._model=this._srcModel;
			break;
		}
		return this._model;
	},
	
	getSelectedItem: function() {
		return this._tree && this._tree._getSelectedItemAttr();
	},
	
	onSelectionChange: function(selection, add){ 
		if (this._outlineMode!="design") {
			return;			
		}
		selection = selection || this._context.getSelection();
		if (selection) {
			this._tree.selectNode(selection, add); 
		}
	},
	
	deselect: function(){
		this._tree.deselectAll(); 
	},
	
	getIconClass: function(item, opened){
		if (this._outlineMode === 'design') {
			var type = item.type;
			var icon;
			//FIXME: Might need OpenAjax widgets logic here someday
			if(type){
				// add class (i.e. "davinciOutlineTreeIcon davinci_dijit_form_Button")
				// where davinci_XXX_YYY_ZZZ has been generated in Palette._generateCssRules()
				icon = "davinciOutlineTreeIcon davinci_"+type.replace(/\./g, "_");
			}else{
				icon = opened ? "dijitFolderOpened" : "dijitFolderClosed";
			}
			return icon;
		}
	}	
});

});
