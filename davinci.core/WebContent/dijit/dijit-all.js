console.warn("dijit-all may include much more code than your application actually requires. We strongly recommend that you investigate a custom build or the web build tool");
dojo.provide("dijit.dijit-all");

/*=====
dijit["dijit-all"] = {
	// summary:
	//		A rollup that includes every dijit. You probably don't need this.
};
=====*/

dojo.require("dijit.dijit");

dojo.require("dijit.ColorPalette");
dojo.require("dijit.Declaration");

dojo.require("dijit.Dialog");
dojo.require("dijit.DialogUnderlay");
dojo.require("dijit.TooltipDialog");

// Editor
dojo.require("dijit.Editor");
dojo.require("dijit._editor.plugins.FontChoice");
dojo.require("dijit._editor.plugins.LinkDialog");

dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuBar");
dojo.require("dijit.MenuBarItem");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.MenuSeparator");

dojo.require("dijit.ProgressBar");
dojo.require("dijit.TitlePane");
dojo.require("dijit.Toolbar");
dojo.require("dijit.Tooltip");
dojo.require("dijit.Tree");
dojo.require("dijit.InlineEditBox");

// Form widgets
dojo.require("dijit.form.Form");

// Button widgets
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.form.ToggleButton");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");

// TextBox widgets
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CurrencyTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.NumberTextBox");

// Select widgets
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.MultiSelect");
dojo.require("dijit.form.Select");

// Slider widgets
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.VerticalSlider");
dojo.require("dijit.form.HorizontalRule");
dojo.require("dijit.form.VerticalRule");
dojo.require("dijit.form.HorizontalRuleLabels");
dojo.require("dijit.form.VerticalRuleLabels");

// Textarea widgets
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.form.Textarea");

// Layout widgets
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.LayoutContainer"); //deprecated
dojo.require("dijit.layout.LinkPane");
dojo.require("dijit.layout.SplitContainer"); //deprecated
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.TabContainer");
