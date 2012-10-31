define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/_SelectAncestorAction",
    	"davinci/Workbench",
    	"dojo/i18n!davinci/ve/nls/ve"
], function(declare, _SelectAncestorAction, Workbench, langObj){

return declare("davinci.ve.actions.SelectAncestorAction", [_SelectAncestorAction], {

	run: function(context){
		context = this.fixupContext(context);
		var selection = (context && context.getSelection());
		if(this.selectionSameParentNotBody(selection)){
			var ancestors = [];
			var ancestor = selection[0].getParent();
			while(ancestor.domNode.tagName != 'BODY'){
				ancestors.push(ancestor);
				ancestor = ancestor.getParent();
			}
			var formHtml = 
				'<div class="SelectAncestorLabel">'+langObj.selectAncestorLabel+'</div>'+
				'<select dojoType="dijit.form.Select" id="SelectAncestor" name="SelectAncestor" style="width:12em;">'+
				'<option value="-1"></option>';
			for(var i=0; i<ancestors.length; i++){
				var label = require("davinci/ve/widget").getLabel(ancestors[i]);
				formHtml += '<option value="'+i+'">'+label+'</option>';
			}
			formHtml += '</select><br/>';

			var dialog = Workbench.showMessage(langObj.selectAncestorTitle, formHtml);

			var selWidget = dijit.byId('SelectAncestor');
			selWidget._selectAncestor = this._selectAncestor;
			dojo.connect(selWidget, "onChange", function(ancestor){
				context.select(ancestors[ancestor]);
			});	
		}
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		var selection = (context && context.getSelection());
		return this.selectionSameParentNotBody(selection);
	}

});
});