dojo.provide("dijit.dijit");

/*=====
dijit.dijit = {
	// summary:
	//		A roll-up for common dijit methods
	// description:
	//	A rollup file for the build system including the core and common
	//	dijit files.
	//
	// example:
	// | <script type="text/javascript" src="js/dojo/dijit/dijit.js"></script>
	//
};
=====*/

// All the stuff in _base (these are the function that are guaranteed available without an explicit dojo.require)
dojo.require("dijit._base");

// And some other stuff that we tend to pull in all the time anyway
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.form._FormWidget");
