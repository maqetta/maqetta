dojo.provide("davinci.libraries.dojo.dojox.mobile.ScrollableViewHelper");
dojo.require("davinci.libraries.dojo.dojox.mobile.ViewHelper");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ScrollableViewHelper", [davinci.libraries.dojo.dojox.mobile.ViewHelper], {

	/**
	 * Override default dojox.mobile.View behavior, which is to automatically
	 * hide ("display: none") any additional Views added to page.  This causes
	 * the Outline view to be out of sync with the Visual Editor -- Outline
	 * shows a View as visible (open eyeball), but in the VE the View has
	 * "display: none" set.
	 * 
	 * DEV NOTES: Had to rely on 'setInterval' since nothing else would work.
	 * In the case where a View is hidden, the Dojox code publishes no event
	 * and calls no function to which I could dojo.connect(). Plus, the code
	 * that hides the View DOM node takes place in a 'setTimeout', potentially
	 * introducing timing issues between that code and this. For these reasons,
	 * I had to settle for a 'setInterval' that keeps getting called until
	 * "display: none" is set on the View -- at that point, the code resets it
	 * to "display: block".
	 */
	create: function(widget, srcElement) {
		this.inherited(arguments);
debugger;
		widget.dijitWidget.disableScroll(true);
	}

});