define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"dijit/Dialog",
    	"dojo/i18n!./nls/actions"
], function(declare, Action, Workbench, Dialog, langObj){

return declare("davinci.actions.SelectLayoutAction", Action, {
	
	run: function(selection){
		if (!this.isEnabled(null)) {
			return;
		}
		this.showLayouts(); 
	},

	isEnabled: function(selection){
		// this is a hack to only support undo for theme editor for 0.5
		return Workbench.getOpenEditor().declaredClass == 'davinci.ve.PageEditor';
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
	
	showLayouts: function(){
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
			
		formHtml += '</select><br/>';
		var	dialog = new Dialog({id: "selectLayout", title:langObj.newWidgetsShouldUse,
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

