define([
    	"dojo/_base/declare",
    	"davinci/actions/Action",
    	"dojo/i18n!davinci/ve/nls/ve",
    	"dojo/i18n!dijit/nls/common"
], function(declare, Action, veNls, commonNls){


return declare("davinci.ve.actions.AddState", [Action], {

	run: function(context){
		// TODO: Replace dialog with UI to add nodes inline to list
		// FIXME: Localize state action messages
		var state,
		widget = this.getWidget(),
		dialogId = "createStateDialog",
		inputId = "createStateInput",
		title = veNls.createNewState,
		content = dojo.string.substitute('${StateLabel}: <input id="${id}" type="text"></input> ' + 
			'<button dojoType="dijit.form.Button" type="submit" onClick="return dijit.byId(\'${dialogId}\').isValid();">${CreateLabel}</button>', 
			{ id: inputId, dialogId: dialogId, CreateLabel: veNls.createLabel, StateLabel: veNls.stateLabel }
		);
		var dialog = new dijit.Dialog({
			id: dialogId,
			title: title,
			content: content, 
			execute: function(){ 
				davinci.ve.states.add(widget, state);
			},
			isValid: function(){ 
				state = dojo.byId(inputId).value;
				// TODO: Replace alerts with inline error messages
				if (!state) {
					alert(langObj.enterStateName);
					return false;
				} else if (davinci.ve.states.hasState(widget, state)) {
					alert(dojo.string.substitute(veNls.stateNameExists, { name: state }));
					return false;
				}
				return true;
			},
			onHide: function(){
				this.destroy();				
			}
		});
	    dojo.connect(dialog.domNode, 'onkeypress', function(event) {
            if (event.keyCode==dojo.keys.ENTER) {
            	if(dijit.byId(dialogId).isValid()){
            		dialog.execute();
            		dialog.hide();
            	}
            }
        });
		dialog.show();
	},

	shouldShow: function(context){
		return this.getWidget();
	},

	isEnabled: function(context){
		return this.getWidget();
	},

	getWidget: function(widget) {
		if (!widget) {
			widget = davinci.ve.states.getContainer();
		}
		return widget;
	}
});
});