dojo.provide("davinci.ve.actions.StateActions");
dojo.require("davinci.actions.Action");
dojo.require("davinci.ve.States");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "veLang");


dojo.declare("davinci.ve.AddState", davinci.actions.Action, {

	run: function(context){
		// TODO: Replace dialog with UI to add nodes inline to list
		// FIXME: Localize state action messages
		var langObj = dojo.i18n.getLocalization("davinci.ve", "veLang");
		var state,
		widget = this.getWidget(),
		dialogId = "createStateDialog",
		inputId = "createStateInput",
		title = langObj.createNewState,
		content = dojo.string.substitute('${StateLabel}: <input id="${id}" type="text"></input> ' + 
			'<button dojoType="dijit.form.Button" type="submit" onClick="return dijit.byId(\'${dialogId}\').isValid();">${CreateLabel}</button>', 
			{ id: inputId, dialogId: dialogId, CreateLabel: langObj.createLabel, StateLabel: langObj.stateLabel }
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
					alert(dojo.string.substitute(langObj.stateNameExists, { name: state }));
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

dojo.declare("davinci.ve.RemoveState", davinci.actions.Action, {

	run: function(context){
		var widget = this.getWidget();
		var state = this.getState(arguments[1] || arguments[0]);
		davinci.ve.states.remove(widget, state);
	},

	isEnabled: function(context){
		return this.getWidget();
	},

	shouldShow: function(context){
		return this.getWidget();
	},
	
	getWidget: function(widget) {
		if (!widget) {
			widget = davinci.ve.states.getContainer();
		}
		return widget;
	},
	
	getState: function(state) {
		if (!state || typeof state != "string") {
			state = davinci.ve.states.getState();
		}
		return state;
	}
});
