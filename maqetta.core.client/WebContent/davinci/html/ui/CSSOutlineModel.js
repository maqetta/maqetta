define([
	"dojo/_base/declare",
	"davinci/ui/widgets/DavinciModelTreeModel"
], function(declare, DavinciModelTreeModel){
	
return declare("davinci.html.ui.CSSOutlineModel",	DavinciModelTreeModel, {

	_childList: function(item) {
		var children=[];

		switch(item.elementType) {
		case "CSSFile":
			children = item.children;
			break;
		case "CSSRule":
			children = item.properties;
			break;
		default:
		}

		return children;
	}

});
});
