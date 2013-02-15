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
	"dijit/dijit",
	"./Workbench",

	// viewClasses
	"./workbench/Explorer",
	"./workbench/OutlineView",
	"./workbench/ProblemsView",
	"./ve/palette/HtmlWidgets",
	"./ve/views/StatesView",
	"./ve/views/SwitchingStyleView",

	// dragHandler
	"./ve/palette/ImageDragSource",

	// actions
	"./actions/UndoAction",
	"./actions/SelectThemeAction",
	"./actions/SelectLayoutAction",
	"./actions/RedoAction",
	"./actions/DownloadAction",
	"./actions/StickyNoteAction",
	"./actions/SaveAsWidget",
	"./actions/UserNameAction",
	"./actions/LogoutAction",

	"./ve/actions/CopyAction",
	"./ve/actions/CutAction",
	"./ve/actions/DeleteAction",
	"./ve/actions/PasteAction",
	"./ve/actions/DuplicateAction",
	"./ve/actions/EditValueAction",
	"./ve/actions/EditPropertiesAction",
	"./ve/actions/ChooseDeviceAction",
	"./ve/actions/RotateDeviceAction",
	"./ve/actions/SurroundAction",

	"./ve/actions/SelectParentAction",
	"./ve/actions/SelectAncestorAction",
	"./ve/actions/UnselectAllAction",
	
	"./ve/actions/ArrangeAction",
	"./ve/actions/MoveToFrontAction",
	"./ve/actions/MoveToBackAction",
	"./ve/actions/MoveForwardAction",
	"./ve/actions/MoveBackwardAction",

	"./ve/actions/OtherAction",
	"./ve/actions/EnableApplicationStates",

	"./ve/actions/ViewDesignAction",
	"./ve/actions/ViewSourceAction",
	"./ve/actions/ViewSourceMenuAction",
	"./ve/actions/ViewSplitHMenuAction",
	"./ve/actions/ViewSplitVMenuAction",

	"./ve/actions/AddState",
	"./ve/actions/RemoveState",
	"./ve/actions/ModifyState",
	"./ve/actions/ManageStates",
	"./ve/actions/NewWidgetsCurrentState",
	"./ve/actions/HighlightBaseWidgets",
	
	// editorClasses
	"./ve/PageEditor",
	"./html/ui/CSSEditor",
	"./html/ui/HTMLEditor",
	"./html/ui/ImageViewer",
	"./js/ui/JavaScriptEditor",
	"./ve/prefs/HTMLEditPreferences",

	// R&C
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