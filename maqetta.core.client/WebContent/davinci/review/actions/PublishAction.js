define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"davinci/review/widgets/PublishWizard",
	"davinci/Runtime",
	"dojox/widget/Toaster",
	"davinci/ui/Dialog",
	"dojo/i18n!./nls/actions"
], function(declare, Action, PublishWizard, Runtime, Toaster, Dialog, actionsNls) {

var PublishAction = declare("davinci.review.actions.PublishAction", [Action], {

	constructor: function(node, isRestart) {
		this.node =  node;
		this.isRestart = isRestart;
		if (node && node.isRestart) {
			this.isRestart = true;
		}
	},

	run : function() {
		var publishWizard = this.publishWizard = new PublishWizard();
		this.dialog = new Dialog({
			contentStyle: {width:650,height:350},
			title: this.node ? actionsNls.editReview : actionsNls.newReview,
			onCancel: dojo.hitch(this, this.close),
			onHide: dojo.hitch(this, this.hide)
		});
		this.dialog.setContent(publishWizard);
		this.dialog.show();
		dojo.connect(publishWizard, "onClose", this, this.close);
		publishWizard.initData(this.node, this.isRestart).then(function() {
			publishWizard.updateSubmit();
			publishWizard.reviewerStackContainer.resize();
		});
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