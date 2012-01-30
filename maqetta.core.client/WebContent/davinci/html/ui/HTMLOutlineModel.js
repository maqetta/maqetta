define([
	"dojo/_base/declare",
	"davinci/ui/widgets/DavinciModelTreeModel"
], function(declare, DavinciModelTreeModel) {
	
return declare("davinci.html.ui.HTMLOutlineModel", DavinciModelTreeModel, {

	_childList: function(item) {
		var children=[];

		switch (item.elementType) {
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
		}

		return children;
	}

});
});
