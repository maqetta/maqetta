define([
	"dojo/_base/kernel",
	".",
	"require",
	"./_Widget",
	"./_KeyNavContainer",
	"./_TemplatedMixin",
	"dojo/_base/connect", // dojo.keys.LEFT_ARROW dojo.keys.RIGHT_ARROW
	"dojo/_base/declare" // dojo.declare
], function(dojo, dijit, require){

	// module:
	//		dijit/Toolbar
	// summary:
	//		A Toolbar widget, used to hold things like `dijit.Editor` buttons

	dojo.declare("dijit.Toolbar", [dijit._Widget, dijit._TemplatedMixin, dijit._KeyNavContainer], {
		// summary:
		//		A Toolbar widget, used to hold things like `dijit.Editor` buttons

		templateString:
			'<div class="dijit" role="toolbar" tabIndex="${tabIndex}" dojoAttachPoint="containerNode">' +
			'</div>',

		baseClass: "dijitToolbar",

		postCreate: function(){
			this.inherited(arguments);

			this.connectKeyNavHandlers(
				this.isLeftToRight() ? [dojo.keys.LEFT_ARROW] : [dojo.keys.RIGHT_ARROW],
				this.isLeftToRight() ? [dojo.keys.RIGHT_ARROW] : [dojo.keys.LEFT_ARROW]
			);
		}
	});

	// Back compat w/1.6, remove for 2.0
	if(!dojo.isAsync){
		dojo.ready(0, function(){
			require(["dijit/ToolbarSeparator"]);
		});
	}

	return dijit.Toolbar;
});
