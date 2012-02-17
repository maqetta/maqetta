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
	"./Workbench",
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

	"./ve/actions/CopyAction",
	"./ve/actions/CutAction",
	"./ve/actions/DeleteAction",
	"./ve/actions/PasteAction",
	"./ve/actions/ChooseDeviceAction",
	"./ve/actions/RotateDeviceAction",
	"./ve/actions/SurroundAction",

	"./ve/actions/AddColumnAction",
	"./ve/actions/AddColumnBeforeAction",
	"./ve/actions/RemoveColumnAction",
	"./ve/actions/AddRowAction",
	"./ve/actions/AddRowBeforeAction",
	"./ve/actions/RemoveRowAction",
	"./ve/actions/AddState",
	"./ve/actions/RemoveState",

	"./html/ui/CSSEditor",
	"./html/ui/HTMLEditor",
	"./html/ui/ImageViewer",
	"./js/ui/JavaScriptEditor",
	"./ve/prefs/HTMLEditPreferences",

	"./review/view/CommentExplorerView",
	"./review/actions/ViewFileAction",
	"./review/actions/DeleteVersionAction",
	"./review/actions/RestartVersionAction",

	"dijit/layout/LayoutContainer", // dependency of ./ve/input/BorderContainerInput
	// after HTML editor loads
	
	// Used by DataGridInput
	"./commands/OrderedCompoundCommand",

	"./version"
],
function(){}
);