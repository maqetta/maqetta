define([
    "dojo/_base/declare",
    "dijit/layout/_LayoutWidget",
    "dijit/_Templated"
], function(declare, LayoutWidget, Templated){

return declare("davinci.workbench._ToolbaredContainer", [LayoutWidget, Templated], {
	templateString: "<div><div dojoAttachPoint='titleBarDiv' class='palette_titleBarDiv'></div><div dojoAttachPoint='toolbarDiv' class='toolbaredContainer_toolbarDiv'></div><div dojoAttachPoint='containerNode'></div></div>",

	gutters: false,
	_toolbarCreated:{},

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
		if (!this.toolbarCreated(this.declaredClass)) {
			this._createToolbar(this.declaredClass);
		}
		this.titleBarDiv.innerHTML = '<span class="paletteCloseBox"></span><span class="titleBarDivTitle">'+this.title+'</span>';
		var closeBoxNodes = dojo.query('.paletteCloseBox', this.titleBarDiv);
		if(closeBoxNodes.length > 0){
			var closeBox = closeBoxNodes[0];
			dojo.connect(closeBox, 'click', this, function(event){
				davinci.Workbench.collapsePaletteContainer(event.currentTarget);
			});
		}
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
	 * @param {string} editorClass  Class name for editor, such as 'davinci.ve.PageEditor'
	 */
	_createToolbar: function(containerClass){
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
        	var tempDiv = dojo.create('div',{'class':'toolbaredContainer_toolbarDiv'});
    		var tb=dojo.create("span", {style: {display: "inline-block"}},tempDiv);
    		
        	var toolbar = Workbench._createToolBar('toolbarPath', tb, viewActions,this._getViewContext());
    		dojo.style(toolbar.domNode,{"display":"inline-block", "float":"left"});
            this.toolbarCreated(containerClass, toolbar);
        }
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
	 * @param {string} containerClass  Class name for view or editor, such as 'davinci.ve.PageEditor'
	 * @param {boolean} [toolbar]  If provided, toolbar widget
	 * @returns {boolean}  Whether toolbar has been created
	 */
	toolbarCreated: function(containerClass, toolbar){
		if(arguments.length > 1){
			this._toolbarCreated[containerClass] = toolbar;
		}
		return this._toolbarCreated[containerClass];
	},
	
	/**
	 * Attach this class's toolbar to its toolbarDiv
	 */
	attachToolbar: function(){
		var toolbar = this.toolbarCreated(this.declaredClass);
		var toolbarDiv = this.getToolbarDiv();
		if(toolbar && toolbar.domNode && toolbarDiv){
			toolbarDiv.innerHTML = '';
			toolbarDiv.appendChild(toolbar.domNode);
		}
	}

//TODO: implement destroy/getChildren to destroy toolbarDiv and containerNode?
});
});
