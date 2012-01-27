define([
	"dojo/_base/declare",
	"./Action",
	"../Workbench",
	"dojo/i18n!./nls/actions"
], function(declare, Action, actionsStrings) {

davinci.preference_layout_ATTRIBUTE = 'dvFlowLayout';

return declare("davinci.actions.SelectLayoutAction", Action, {
	
	run: function(selection){
		if (!this.isEnabled(null)) return;
		this.showLayouts(); 
	},

	isEnabled: function(selection){
		var e = Workbench.getOpenEditor();

		if (e.declaredClass == 'davinci.ve.PageEditor') // this is a hack to only support undo for theme editor for 0.5
			return true;
		else return false;
	},

	_changeLayoutCommand: function(newLayout){
		
		var d = dijit.byId('selectLayout');
		if (d){
			d.destroyRecursive(false);
		}
		var e = Workbench.getOpenEditor();
		if (e && e.getContext){
			var flowLayout = true;
			if (newLayout === 'Absolute positioning'){
				flowLayout = false;
			} 
			var c = e.getContext();
			c.setFlowLayout(flowLayout);
			e._visualChanged();
		}
	},

	showLayouts : function(){

		var e = Workbench.getOpenEditor();
		var c = e.getContext();
		var flowLayout = c.getFlowLayout();
		e._visualChanged();
		var formHtml = 
        '<select dojoType="dijit.form.ComboBox" id="layout" name="layout" >';
		if (flowLayout){
			formHtml += '<option>Absolute positioning</option>';
			formHtml += '<option selected>Flow positioning</option>';
		} else {
			formHtml += '<option selected>Absolute positioning</option>';
			formHtml += '<option>Flow positioning</option>';
		}
		formHtml = formHtml + '</select><br/>';
		var	dialog = new dijit.Dialog({id: "selectLayout", title:actionsStrings.newWidgetsShouldUse,
			onCancel:function(){this.destroyRecursive(false);}});	
		dialog._selectLayout = this;
		dojo.connect(dialog, 'onLoad', function(){
			
			var cb = dijit.byId('layout');
			cb._selectLayout = this._selectLayout;
			
				
			dojo.connect(cb, "onChange", function(layout){
				this._selectLayout._changeLayoutCommand(layout);
			});
			
		});
		dialog.setContent(formHtml);
		
		
		dialog.show();
	}
});
});
