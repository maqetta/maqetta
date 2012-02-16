define([
	"dojo/_base/lang",
	"davinci/Runtime",
//	"davinci/Workbench",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer"
], function(lang, Runtime, /*Workbench,*/ BorderContainer, ContentPane, TabContainer) {

davinci.review = {};

var Review = davinci.review.Review = lang.mixin(davinci.Workbench, {

	runComment: function() {
		this._initKeys();
		this._baseTitle = dojo.doc.title;
		var perspective = Runtime.initialPerspective || "davinci.review.comment";
		var mainBody = dojo.byId('mainBody');
		mainBody.editorsWelcomePage =
			new ContentPane({
				id : "editorsWelcomePage",
				href: "app/davinci/ve/resources/welcome_to_maqetta.html"
			});
		this.showPerspective(perspective);
		Runtime.subscribe("/davinci/ui/editorSelected", davinci.Workbench._updateMainToolBar );
		Runtime.subscribe("/davinci/resource/resourceChanged", this._resourceChanged );
		this._state={editors:[]};
	}
});

return Review;

});