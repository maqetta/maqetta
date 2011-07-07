dojo.provide("davinci.workbench.Explorer");

dojo.require("davinci.Workbench");
dojo.require("davinci.workbench.ViewPart");
dojo.require("davinci.ui.widgets.ResourceTreeModel");
dojo.require("dijit.Tree");
dojo.require("davinci.resource");

dojo.declare("davinci.workbench.Explorer", davinci.workbench.ViewPart, {
	
	toolbarID: "workbench.Explorer",
	getActionsID: function () {
	
		//	return "davinci.ve.VisualEditorOutline";

		return "davinci.workbench.Explorer";
	},
	
	postCreate: function(){
		this.inherited(arguments);

		var dragSources=davinci.Runtime.getExtensions("davinci.dnd", function (extension){
			 return dojo.some(extension.parts,function(item){ return item=="davinci.ui.navigator"; }) && extension.dragSource;
		});
		
		var model= davinci.resource;
		var tree = this.tree = new dijit.Tree({
			showRoot:false,
			model: model, id:'resourceTree',
			labelAttr: "name", childrenAttrs:"children",
			getIconClass: dojo.hitch(this,this._getIconClass),
			filters: [davinci.resource.alphabeticalSortFilter],
			isMultiSelect: true,
			dragSources:dragSources});

		this.setContent(tree); 
		tree.startup();
		dojo.connect(tree, 'onDblClick', dojo.hitch(this,this._dblClick ));
		var that = this;
		tree.watch("selectedItems", function (prop, oldValue, newValue) {
			var items = dojo.map(newValue, function(item){ return {resource:item}; });
			that.publish("/davinci/ui/selectionChanged",[items, that]);
		});

		var popup=davinci.Workbench.createPopup({
			partID: 'davinci.ui.navigator',
			domNode: this.tree.domNode/*,
			openCallback:function (event)
			{
//				var ctrlKey = dojo.isMac ? event.metaKey : event.ctrlKey;
//TODO: use setter?				tree.ctrlKeyPressed = this._isMultiSelect && event && ctrlKey;
				var w = dijit.getEnclosingWidget(event.target);
				if(!w || !w.item){
//					dojo.style(this._menu.domNode, "display", "none");
					return;
				}
				if (dojo.indexOf(tree.get("selectedNodes"), w) == -1){
debugger;
//					tree._selectNode(w);
				}
				tree.set("selectedNode", w);
debugger;
			}*/});
	},

	destroy: function(){
		this.inherited(arguments);
	},
	
	_dblClick: function(node)
	{
		if (node.elementType=="File")
		{
			davinci.Workbench.openEditor({
				fileName: node,
				content: node.getContents()
			});
		}
	},
	
	_getIconClass: function(item, opened){
		
		var readOnly = "";
		if(item.readOnly){
			readOnly = " readOnlyResource";
		}
		
		if (item.elementType=="Folder"){
			return (opened ? "dijitFolderOpened" : "dijitFolderClosed") + readOnly;
		}
		if (item.elementType=="File"){
			var icon;
			var fileType=item.getExtension();
			var extension=davinci.Runtime.getExtension("davinci.fileType", function (extension){
				return extension.extension==fileType;
			});
			if (extension){
				icon=extension.iconClass + readOnly;
			}
			return icon ||	("dijitLeaf" + readOnly);
		}
		return "dijitLeaf" + readOnly;
	}
});