define([
    "dojo/_base/declare",
	"./commands/ReparentCommand",
	"./widget",
	"./States",
	"dijit/tree/dndSource",
	"../html/ui/HTMLOutlineModel"
], function(
	declare,
	ReparentCommand,
	Widget,
	states,
	dndSource,
	HTMLOutlineModel
){

var OutlineTreeModel = declare("davinci.ve.OutlineTreeModel", null, {

		useRichTextLabel: true,

		showRoot: true,
		
		toggleMode: true,
		
		dndController: "dijit.tree.dndSource",
		
		betweenThreshold: 4,

		constructor: function(context)	
		{
			this._context=context;
			this._handles=[];
			this._connect("onCommandStackExecute", "refresh"); // yikes.  this refreshes the entire tree anytime there's a change.  really bad if we're traversing the tree setting styles.
			this._connect("activate", "refresh");
			this._connect("setSource", "refresh");

			dojo.subscribe("/davinci/states/state/changed/start", this,
				function(e) {
					this._skipRefresh = true;
				}
			);
			dojo.subscribe("/davinci/states/state/changed/end", this,
				function(e) {
					delete this._skipRefresh;
					this.refresh();
				}
			);
		},
		
		_connect: function(contextFunction, thisFunction)
		{
			this._handles.push(dojo.connect(this._context,contextFunction,this,thisFunction));
		},

		destroy: function(){
			dojo.forEach(this._handles, dojo.disconnect);
		},
			
		// =======================================================================
		// Methods for traversing hierarchy
		
		getRoot: function(onItem){ 
			onItem(this._context.rootWidget || { id: "myapp", label:"application" });
		}, 
		
		mayHaveChildren: function(/*dojo.data.Item*/ item){
			if (item && item.type && item.type.indexOf("OpenAjax.") === 0) {
				return false;
			}

			return this._childList(item).length;
		},
		
		_childList: function(parentItem)
		{
			var widgets, children=[];

			if (!this._context.rootWidget || (parentItem.type == "state") || parentItem.type == 'html.stickynote' || parentItem.type == 'html.richtext') {
				return [];
			}

			if (parentItem === this._context.rootNode) {
				widgets = this._context.getTopWidgets();
			} else {
				widgets = parentItem.getChildren();
			}

			dojo.forEach(widgets, function(widget) {
				if ( widget.getContext && widget.getContext() && ! widget.internal ) {
					// managed widget only
					children.push(widget);
				}
			});
			return children;
		},
		
		getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
			onComplete(this._childList(parentItem));
		},
		
		// =======================================================================
		// Inspecting items
		
		getIdentity: function(/* item */ item){
			return item.id;
		},
		
		getLabel: function(/*dojo.data.Item*/ item){
			var type= item.type ;
			var label;
			
			if(item.id == "myapp"){
				return this._context.model.fileName;//"Application";
			}
			if (item.isWidget) {
				label = Widget.getLabel(item);
				return label;
			}
			if (!type) {
				return;
			}
			
			var lt = (this.useRichTextLabel ? "&lt;" : "<");
			var gt = (this.useRichTextLabel ? "&gt;" : ">");

			if (type.indexOf("html.") === 0) {
				label = lt + type.substring("html.".length) + gt;
			} else if (type.indexOf("OpenAjax.") === 0) {
				label = lt + type.substring("OpenAjax.".length) + gt;
			} else if (type.indexOf(".") > 0 ) {
				label = type.substring(type.lastIndexOf(".")+1);
			} else {
				label = item.label || type;
			}
			
			var widget = Widget.byId(item.id, this._context.getDocument());
			if (widget) {
				var id = widget.getId();
				if (id ) {
					label += " id=" + id;
				}
			}
			return label;
		},
		
		postCreate: function(node) {
			var widget = node.item;
			var type = widget.type;
			/*FIXME: To add visibility icon for subwidgets, I think the following
				commented code is *part* of the solution.
			if (type == "subwidget") {
				dojo.addClass(node.domNode,"dvSubwidgetNode");
			}
			*/
		},
		
		shouldShowElement: function(elementId, item) {
			if (elementId == "toggleNode") {
				return (item.type != "states" && item.id != "myapp");
			}
			return true;
		},
		
		toggle: function(widget, on, node) {
			var helper = widget.getHelper();
			var continueProcessing = true;
			if(helper && helper.onToggleVisibility){
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
			var state = states.getState();
			var value = visible ? "" : "none";
			states.setStyle(widget, state, [{"display": value}]);
		},
		
		isToggleOn: function(item) {
			return !states.isVisible(item);
		},
		
		newItem: function(/* Object? */ args, /*Item?*/ parent){
		},
		
		pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ copy, newIndex){
			if (!childItem || !newParentItem || !oldParentItem) {
				return;
			}
			if (newParentItem.id == "myapp") {
				newParentItem = this._context.rootNode;
			}
			var command = new ReparentCommand(childItem, newParentItem, newIndex);
			this._context.getCommandStack().execute(command);
		},
		

		checkItemAcceptance: function(target, source, position) {
			switch(position) {
			case "before":
			case "after":
				return true;
			default:  // if not dropping before or after an item, make sure the target item has a container node
				var item = dijit.getEnclosingWidget(target).item;
				var hasContainerNode = !!item.getContainerNode() || item.id == "myapp";
				return hasContainerNode;
			}
		},
		
		onChange: function(/*dojo.data.Item*/ item){
		},
		
		onChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
		},
		
		onRefresh: function(){
		},
		
		refresh: function()
		{
			if (this._skipRefresh) { return; }
			var node = this._context.rootNode;
			if (node){	// shouldn't be necessary, but sometime is null
				this.onChildrenChange(node, this._childList(node));
			}
		}
	});

return declare("davinci.ve.VisualEditorOutline", null, {

	toolbarID: "davinci.ve.outline",

	_outlineMode: "design", 
		
	constructor: function (editor)
	{
		this._editor = editor;
		this._context=editor.visualEditor.context;
		this._handles=[];
		this._connect("onSelectionChange", "onSelectionChange");
		this._connect("deselect", "deselect"); 
		
		
		this._widgetModel=new OutlineTreeModel(this._context);
		this._srcModel=new HTMLOutlineModel(editor.model);
		states.subscribe("/davinci/states/state/changed", this,
			function(e) {
				var declaredClass = (typeof davinci !== "undefined") &&
						davinci.Runtime.currentEditor &&
						davinci.Runtime.currentEditor.declaredClass;
				if (declaredClass === "davinci.themeEditor.ThemeEditor") {
					return; // ignore updates in theme editor
				}
				if (!this._tree) {
					return;
				}
				var children = states.getChildren(e.widget);
				while (children.length) {
					var child = children.shift();
					if (child) {
						var node = this._tree.getNode(child);
						if (node) {
							var visible = states.isVisible(child, e.newState);
							node._setToggleAttr(!visible);
						}
						children = children.concat(states.getChildren(child));
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
		this._handles.push(dojo.connect(this._context,contextFunction,this,thisFunction));
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
