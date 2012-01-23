define([
	"dojo/_base/declare",
	"davinci/actions/Action",
	"dojox/grid/DataGrid",
	"dojo/data/ItemFileWriteStore",
	"dojox/data/QueryReadStore",
	"dijit/form/SimpleTextarea",
	"dijit/form/Textarea",
	"dijit/form/DropDownButton",
	"dijit/form/ComboBox",
	"dojox/widget/Toaster",
	"dijit/form/DateTextBox",
	"dijit/form/Form",
	"dojo/date/locale",
	"dijit/form/MultiSelect",
	"davinci/review/model/ReviewFileTreeModel",
	"dojox/validate/regexp",
	"davinci/review/widgets/PublishWizard",
	"dijit/Dialog",
	"dojo/i18n!davinci/review/actions/nls/actions"
], function(declare, Action, DataGrid, ItemFileWriteStore, QueryReadStore, SimpleTextarea,
		Textarea, DropDownButton, ComboBox, Toaster, DateTextBox, Form, locale, MultiSelect,
		ReviewFileTreeModel, regexp, PublishWizard, Dialog, langObj) {

return declare("davinci.review.actions.PublishAction", Action, {

	constructor: function(node,isRestart){
		this.node =  node;
		this.isRestart = isRestart;
		if(node&&node.isRestart)
			this.isRestart = true;
	},
	run : function() {
		var publishWizard = this.publishWizard = new davinci.review.widgets.PublishWizard();
		this.dialog = new dijit.Dialog( {
			title : langObj.newReview,
			onCancle: dojo.hitch(this,this.close),
			onHide: dojo.hitch(this, this.hide)
		});
		this.dialog.setContent(publishWizard);
		this.dialog.show();
		dojo.connect(publishWizard,"onClose",this,this.close);
		publishWizard.initData(this.node,this.isRestart);
		publishWizard.updateSubmit();
		publishWizard.reviewerStackContainer.resize();
		
	},
	
	hide: function(){
		this.dialog.destroyRecursive();
	},
	
	close: function(){
		this.dialog.hide();
	}
});
});