define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/model/Path",
], function (
	declare,
	CreateTool,
	Path
) {

return declare(CreateTool, {

	create: function(args) {
		var srcDocPath = new Path(this._context._srcDocument.fileName);

		// make the icons realtive to the file we are editing
		dojo.forEach(this._data.children, dojo.hitch(this, function(child) {
				var icon1 = new Path(child.properties.icon1)
				var icon2 = new Path(child.properties.icon2)
				child.properties.icon1 = icon1.relativeTo(srcDocPath.getParentPath(), true).toString();
				child.properties.icon2 = icon2.relativeTo(srcDocPath.getParentPath(), true).toString();
		}));

		var parent = args.target, parentNode, child;
		while (parent) {
			parentNode = parent.getContainerNode();
			if (parentNode) { // container widget
				break;
			}
			child = parent; // insert before this widget for flow layout
			parent = parent.getParent();
		}

		var index = args.index;
		
		var position;
		var widgetAbsoluteLayout = false;
		if (this._data.properties && this._data.properties.style &&
				(this._data.properties.style.indexOf('absolute') > 0)) {
			widgetAbsoluteLayout = true;
		}
		if (! widgetAbsoluteLayout && this.createWithFlowLayout()) {
			// do not position child under layout container... except for ContentPane
			if (child) {
				index = parent.indexOf(child);
			}
		}else if(args.position){
			// specified position must be relative to parent
			position = args.position;
		}else if(this._position){
			// convert container relative position to parent relative position
			position = this._position;
		}

		this._data.context=this._context;

		this._create({parent: parent, index: index, position: position, size: args.size}); 
	}
	
});

});