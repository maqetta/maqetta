dojo.provide("davinci.davinci-common");

/*=====
davinci["davinci-common"] = {
	// summary:
	//		A subset of the roll-up for the daVinci Workbench
	// description:
	//	A rollup file for the build system including some widgets used on the startup page.
	//
	// example:
	// | <script type="text/javascript" src="js/davinci/davinci-common.js"></script>
	//
};
=====*/

dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.dijit");

dojo.require("dojo.parser");
dojo.require("dijit.Dialog");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Tooltip");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojox.form.PasswordValidator");
dojo.require("dojox.validate.regexp");
dojo.require("davinci.appcache");
