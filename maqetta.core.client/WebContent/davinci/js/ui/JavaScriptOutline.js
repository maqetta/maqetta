dojo.provide("davinci.js.ui.JavaScriptOutline");
dojo.require("davinci.ui.widgets.DavinciModelTreeModel");


dojo.declare("davinci.js.ui.JavaScriptOutline", null, {
	
	constructor : function (model)
	{
		this._jsModel=model;
	},
	
	getModel : function()
	{
		this._model=new davinci.js.ui.JSOutlineModel(this._jsModel);
		return this._model;
	}
//	getChildren: function(item)
//	{
//	    var children=[];
//		switch (item.elementType)
//		{
//		case "JSFile":
//			for (var i=0;i<item.children.length;i++)
//			{
//				switch (item.children[i].elementType)
//				{
//				case  "Function":
//				case  "VariableDeclaration":
//					children.push(item.children[i]);
//				}
//			}
//			
//			default:
////				children=null;
//		}
//		
//		return children;
//	},
//	
//	_getOutlineChildren : function (modelElement)
//	{
//		
//	}

});

dojo.declare("davinci.js.ui.JSOutlineModel",	davinci.ui.widgets.DavinciModelTreeModel, {
});
