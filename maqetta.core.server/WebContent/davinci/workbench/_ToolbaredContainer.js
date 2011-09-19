dojo.provide("davinci.workbench._ToolbaredContainer");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit._Templated");

dojo.declare("davinci.workbench._ToolbaredContainer", [dijit.layout._LayoutWidget, dijit._Templated], {
	templateString: "<div><div dojoAttachPoint='toolbarDiv' class='toolbaredContainer_toolbarDiv'></div><div dojoAttachPoint='containerNode'></div></div>",

	gutters: false,

	layout: function() {
		// Configure the main pane to take up all the space except for where the toolbar is

		// position and size the toolbar and the container node
		var children = [
			{ domNode: this.toolbarDiv, layoutAlign: "top" },
			{ domNode: this.containerNode, layoutAlign: "client" }
		];

		dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
		// Compute size to make each of my children.
		// children[1] is the margin-box size of this.containerNode, set by layoutChildren() call above
		this._containerContentBox = dijit.layout.marginBox2contentBox(this.containerNode, children[1]);
		var widget = dijit.byNode(this.containerNode);
		if (widget && widget.resize) {
			widget.resize(this._containerContentBox);
		}
		dojo.marginBox(this.containerNode, children[1]);//KLUDGE: top doesn't get set without this.
	},

	setContent: function(/*Widget*/data){
		this.mainWidget = data;
		
		var domNode = data.domNode || data;
		
		dojo.place(domNode, this.containerNode, "replace");
		this.containerNode = domNode;

		//TODO: move this to part of the widget life cycle
		if (!this._toolbarCreated) {
			this._createToolbar();
		}
		if(this._started) this.layout();
	},

	removeContent: function()
	{
		var newContainer=dojo.doc.createElement("div");
		dojo.place( newContainer, this.containerNode,"replace");
		this.containerNode=newContainer;
		if (this.mainWidget)
			this.mainWidget.destroy();
		this.mainWidget=null;
	},
	
	_getViewActions: function(){},

	getTopAdditions: function(){},

	_createToolbar: function()
	{		
		var topAddition=this.getTopAdditions();
		if (topAddition)
			this.toolbarDiv.appendChild(topAddition);
		
		// If descendant class provides a value for toolbarMenuActionSets,
		// then use that value to create a right-side dropdown menu
    	if(this.toolbarMenuActionSets){
    		// Note: menu routines in Dojo and Workbench require unique names
    		var unique="m"+(new Date().getTime());
    		var menuContainerId=unique+"_menucontainer";
        	var menuContainerElem = dojo.create("span", {'id':menuContainerId, 'class':"paletteDropdown"}, this.toolbarDiv);
    		var menuId=unique+"_menu";
        	var menuElem = dojo.create("span", {id:menuId}, menuContainerElem);
        	davinci.Workbench.updateMenubar(menuElem, this.toolbarMenuActionSets);
    	}
    	
		var viewActions=this._getViewActions();
        if (viewActions && viewActions.length)
        {
    		var tb=dojo.create("span", {style: {display: "inline-block"}},this.toolbarDiv);
        	var toolbar = davinci.Workbench._createToolBar("xx", tb, viewActions,this._getViewContext());
    		dojo.style(toolbar.domNode,{"display":"inline-block", "float":"left"});
        }
		this._toolbarCreated=true;
	},
	
	_getViewContext: function()
	{
		return this;
	}

//TODO: implement destroy/getChildren to destroy toolbarDiv and containerNode?
});
