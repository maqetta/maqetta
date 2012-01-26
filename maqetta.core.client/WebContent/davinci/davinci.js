define([
/*=====
davinci/davinci = {
	// summary:
	//		A roll-up for the daVinci Workbench
	// description:
	//	A rollup file for the build system including the workbench and runtime
	//	for daVinci/
	//
	// example:
	// | <script type="text/javascript" src="js/davinci/davinci/js"></script>
	//
};
=====*/
	"./davinci-common",
	"./Runtime",
	
	"./ui/about",
	"./workbench/Explorer",
	"./workbench/OutlineView",
	"./workbench/ProblemsView",
	"./ve/palette/HtmlWidgets",
	"./ve/views/StatesView",
	
	"./ve/views/SwitchingStyleView",
	
	"./ve/PageEditor",
	"./ve/palette/ImageDragSource",
	"./actions/UndoAction",
	"./actions/SelectThemeAction",
	"./actions/SelectLayoutAction",
	"./actions/RedoAction",
	"./actions/DownloadAction",
	"./actions/StickyNoteAction",
	"./actions/SaveAsWidget",
	
	"./ve/commands/ModifyAttributeCommand",
	
	"./html/ui/CSSEditor",
	"./html/ui/HTMLEditor",
	"./html/ui/ImageViewer",
	"./js/ui/JavaScriptEditor",
	"./ve/prefs/HTMLEditPreferences",
	"dijit/layout/LayoutContainer", // dependency of ./ve/input/BorderContainerInput
	// after HTML editor loads
	
	// Used by DataGridInput
	"./commands/OrderedCompoundCommand",
	
	// dependencies from ./review/  This is fragile/ We need to find a way to include ./review or build as a dependent layer!
	"dojox/data/QueryReadStore",
	"dijit/form/DateTextBox",
	"dijit/form/MultiSelect",
	
	"dojo/i18n!./nls/webContent",
	"./version"
],
function(){}
);