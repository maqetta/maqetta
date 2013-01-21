define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/Workbench",
	"davinci/ve/actions/ContextAction",
	"davinci/workbench/Preferences",
	"dijit/registry",
	"davinci/ve/States",
	"davinci/actions/Action",
	"dojo/i18n!davinci/ve/nls/ve",
	"davinci/ve/actions/_ManageStatesWidget"
], function(
	declare,
	Runtime,
	Workbench,
	ContextAction,
	Preferences,
	registry,
	States,
	Action,
	veNls,
	_ManageStatesWidget){

return declare("davinci.ve.actions.ManageStates", [ContextAction], {

	run: function(){
		var context;
		if(Runtime.currentEditor && Runtime.currentEditor.currentEditor && Runtime.currentEditor.currentEditor.context){
			context = Runtime.currentEditor.currentEditor.context;
		}else{
			return;
		}
		var statesFocus = States.getFocus(context.rootNode);
		if(!statesFocus || !statesFocus.stateContainerNode){
			return;
		}
		var w = new davinci.ve.actions._ManageStatesWidget({node: statesFocus.stateContainerNode });
		w._calledBy = 'ManageStates';
		w.okButton.set("label", veNls.updateLabel);
		w.updateDialog();
		var dialog = Workbench.showModal(w, veNls.manageStates, {width: 400}, null, true);
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		var e = Workbench.getOpenEditor();
		if (e && context) {
			if(e.declaredClass == 'davinci.ve.PageEditor'){
				return (context.getSelection().length > 0);
			}else{
				return false;
			}
		}else{
			return false;
		}
	},

	shouldShow: function(context){
		context = this.fixupContext(context);
		var editor = context ? context.editor : null;
		return (editor && editor.declaredClass == 'davinci.ve.PageEditor');
	}
});
});