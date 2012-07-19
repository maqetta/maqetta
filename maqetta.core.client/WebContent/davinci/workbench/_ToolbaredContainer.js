define([
    "dojo/_base/declare",
    "dijit/layout/_LayoutWidget",
    "dijit/_Templated"
], function(declare, LayoutWidget, Templated){

return declare("davinci.workbench._ToolbaredContainer", [LayoutWidget, Templated], {
	templateString: "<div><div dojoAttachPoint='titleBarDiv' class='toolbaredContainer_titleBarDiv'></div><div dojoAttachPoint='toolbarDiv' class='toolbaredContainer_toolbarDiv'></div><div dojoAttachPoint='containerNode'></div></div>",

	gutters: false,

	layout: function() {
		// Configure the main pane to take up all the space except for where the toolbar is

		// position and size the toolbar and the container node
		var children = [
			{ domNode: this.titleBarDiv, layoutAlign: "top" },
			{ domNode: this.toolbarDiv, layoutAlign: "top" },
			{ domNode: this.containerNode, layoutAlign: "client" }
		];

		dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
		// Compute size to make each of my children.
		// children[2] is the margin-box size of this.containerNode, set by layoutChildren() call above
		this._containerContentBox = dijit.layout.marginBox2contentBox(this.containerNode, children[2]);
		var widget = dijit.byNode(this.containerNode);
		if (widget && widget.resize) {
			widget.resize(this._containerContentBox);
		}
		dojo.marginBox(this.containerNode, children[2]);//KLUDGE: top doesn't get set without this.
	},

	setContent: function(/*Widget*/data){
		this.mainWidget = data;
		
		var domNode = data.domNode || data;
		
		dojo.place(domNode, this.containerNode, "replace");
		this.containerNode = domNode;

		//TODO: move this to part of the widget life cycle
		if (!this.toolbarCreated()) {
			this._createToolbar();
		}
		this.titleBarDiv.innerHTML = '<span class="paletteCloseBox">&#x2199;</span><span>'+this.title+'</span>';
		if(this._started) this.layout();
	},

	removeContent: function()
	{
		var newContainer=dojo.doc.createElement("div");
		dojo.place( newContainer, this.containerNode,"replace");
		this.containerNode=newContainer;
		if (this.mainWidget) {
			this.mainWidget.destroy();
		}
		delete this.mainWidget;
	},
	
	_getViewActions: function(){},

	getTopAdditions: function(){},

	/**
	 * Creates toolbar for this view or editor using data from appropriate *.plugin.js directives
	 * for this particular view or editor.
	 * Note that this routine can be overridden by a subclass (e.g., EditorContainer.js)
	 */
	_createToolbar: function(){
		var Workbench = require('davinci/Workbench');
		var toolbarDiv = this.getToolbarDiv();
		
		var topAddition=this.getTopAdditions();
		if (topAddition) {
			toolbarDiv.appendChild(topAddition);
		}
		
		// If descendant class provides a value for toolbarMenuActionSets,
		// then use that value to create a right-side dropdown menu
    	if(this.toolbarMenuActionSets){
    		// Note: menu routines in Dojo and Workbench require unique names
    		var unique="m" + Date.now();
    		var menuContainerId=unique+"_menucontainer";
        	var menuContainerElem = dojo.create("span", {'id':menuContainerId, 'class':"paletteDropdown"}, toolbarDiv);
    		var menuId=unique+"_menu";
        	var menuElem = dojo.create("span", {id:menuId}, menuContainerElem);
        	Workbench.updateMenubar(menuElem, this.toolbarMenuActionSets);
    	}
    	
		var viewActions=this._getViewActions();
        if (viewActions && viewActions.length)
        {
    		var tb=dojo.create("span", {style: {display: "inline-block"}},toolbarDiv);
    		
        	var toolbar = Workbench._createToolBar("xx", tb, viewActions,this._getViewContext());
    		dojo.style(toolbar.domNode,{"display":"inline-block", "float":"left"});
        }
        this.toolbarCreated(true);
	},
	
	_getViewContext: function()
	{
		return this;
	},
	
	/**
	 * Returns an {Element} that is the container DIV into which editor toolbar should go
	 * This function can be overridden by subclasses (e.g., EditorContainer.js)
	 */
	getToolbarDiv: function(){
		return this.toolbarDiv;
	},
	
	/**
	 * Getter/setting for whether toolbar has been created.
	 * Note that this function can be overridden by a subclass (e.g., EditorContainer)
	 * @param {boolean} [toolbarHasBeenCreated]  If provided, sets status for whether toolbar has been created
	 * @returns {boolean}  Whether toolbar has been created
	 */
	toolbarCreated: function(toolbarHasBeenCreated){
		if(arguments.length > 0){
			this._toolbarCreated = toolbarHasBeenCreated;
		}
		return this._toolbarCreated;
	}

//TODO: implement destroy/getChildren to destroy toolbarDiv and containerNode?
});
});
