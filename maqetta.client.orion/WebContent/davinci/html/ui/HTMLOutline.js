dojo.provide("davinci.html.ui.HTMLOutline");
dojo.require("davinci.workbench.OutlineProvider");
dojo.require("davinci.ui.widgets.DavinciModelTreeModel");


dojo.declare("davinci.html.ui.HTMLOutline",davinci.workbench.OutlineProvider, {
	
	
	constructor : function (model)
	{
		this._htmlModel=model;
	},
	
	
	getModel : function()
	{
		this._model=new davinci.html.ui.HTMLOutlineModel(this._htmlModel);
		return this._model;
	}
});
dojo.declare("davinci.html.ui.HTMLOutlineModel",	davinci.ui.widgets.DavinciModelTreeModel, {

	
	_childList: function(item)
	{
	    var children=[];
		switch (item.elementType)
		{
		case "HTMLFile":
			for (var i=0;i<item.children.length;i++)
			{
				switch (item.children[i].elementType)
				{
				case  "HTMLElement":
					children.push(item.children[i]);
				}
			}
			break;
		case "HTMLElement":
			for (var i=0;i<item.children.length;i++)
			{
				switch (item.children[i].elementType)
				{
				case  "HTMLElement":
					children.push(item.children[i]);
				}
			}
			break;
			default:
//				children=null;
		}
		
		return children;
	}

});
