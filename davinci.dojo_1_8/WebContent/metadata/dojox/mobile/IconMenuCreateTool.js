define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/model/Path",
	'davinci/Workbench',
	'davinci/workbench/Preferences'
], function (
	declare,
	CreateTool,
	Path,
	Workbench,
	Preferences
) {

return declare(CreateTool, {

	create: function(args) {
		var srcDocPath = new Path(this._context._srcDocument.fileName);

		// make the icons realtive to the file we are editing
		var base = Workbench.getProject();
		// need the prefs bit to handle if we are eclipse project
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		if(prefs.webContentFolder!=null && prefs.webContentFolder!=""){
			var fullPath = new Path(base).append(prefs.webContentFolder);
			base = fullPath.toString();
		}
		dojo.forEach(this._data.children, dojo.hitch(this, function(child) {
			var icon = new Path(base + '/' + child.properties.icon);
			child.properties.icon = icon.relativeTo(srcDocPath.getParentPath(), true).toString();
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
		var position = args.position;
		this._data.context=this._context;

		this._create({parent: parent, index: index, position: position, size: args.size}); 
	}
	
});

});