define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/widgets/PublishWizard",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"dojo/i18n!./nls/actions"
], function(declare, Action, PublishWizard, Runtime, Toaster, actionsNls) {

if (typeof davinci.review.actions === "undefined") {
	davinci.review.actions = {};
}

var PublishAction = davinci.review.actions.PublishAction = declare("davinci.review.actions.PublishAction", davinci.actions.Action, {

	constructor: function(node, isRestart) {
		this.node =  node;
		this.isRestart = isRestart;
		if (node && node.isRestart) {
			this.isRestart = true;
		}
	},

	run : function() {
		var publishWizard = this.publishWizard = new PublishWizard();
		this.dialog = new dijit.Dialog( {
			title : actionsNls.newReview,
			onCancle: dojo.hitch(this, this.close),
			onHide: dojo.hitch(this, this.hide)
		});
		this.dialog.setContent(publishWizard);
		this.dialog.show();
		dojo.connect(publishWizard, "onClose", this, this.close);
		publishWizard.initData(this.node, this.isRestart);
		publishWizard.updateSubmit();
		publishWizard.reviewerStackContainer.resize();

	},

	hide: function() {
		this.dialog.destroyRecursive();
	},

	close: function() {
		this.dialog.hide();
	}

});

return PublishAction;

});