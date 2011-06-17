dojo.provide("davinci.davinci");

/*=====
davinci.davinci = {
	// summary:
	//		A roll-up for the daVinci Workbench
	// description:
	//	A rollup file for the build system including the workbench and runtime
	//	for daVinci.
	//
	// example:
	// | <script type="text/javascript" src="js/davinci/davinci.js"></script>
	//
};
=====*/

dojo.require("davinci.davinci-common");
dojo.require("davinci.Runtime");

dojo.require("davinci.ui.about");
dojo.require("davinci.workbench.Explorer");
dojo.require("davinci.workbench.OutlineView");
dojo.require("davinci.workbench.ProblemsView");
dojo.require("davinci.ve.palette.HtmlWidgets");
dojo.require("davinci.ve.views.StatesView");

dojo.require("davinci.ve.views.SwitchingStyleView");

dojo.require("davinci.ve.PageEditor");
dojo.require("davinci.ve.palette.ImageDragSource");
dojo.require("davinci.actions.UndoAction");
dojo.require("davinci.actions.SelectThemeAction");
dojo.require("davinci.actions.SelectLayoutAction");
dojo.require("davinci.actions.RedoAction");
dojo.require("davinci.actions.DownloadAction");
dojo.require("davinci.actions.StickyNoteAction");
dojo.require("davinci.actions.SaveAsWidget");
dojo.require("davinci.ve.actions.ContextActions");
dojo.require("davinci.ve.actions.StateActions");

dojo.require("davinci.html.ui.CSSEditor");
dojo.require("davinci.html.ui.HTMLEditor");
dojo.require("davinci.html.ui.ImageViewer");
dojo.require("davinci.js.ui.JavaScriptEditor");
dojo.require("davinci.ve.prefs.HTMLEditPreferences");
dojo.require("dijit.layout.LayoutContainer"); // dependency of davinci.ve.input.BorderContainerInput
// after HTML editor loads

// Used by DataGridInput
dojo.require("davinci.commands.OrderedCompoundCommand");

// dependencies from davinci.review.  This is fragile. We need to find a way to include davinci.review or build as a dependent layer!
dojo.require("dojox.data.QueryReadStore");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.MultiSelect");

