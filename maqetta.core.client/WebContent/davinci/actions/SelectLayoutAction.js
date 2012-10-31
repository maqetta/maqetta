define([
      "dojo/_base/declare",
      "dijit/_WidgetBase",
      "dijit/_TemplatedMixin",
      "dijit/_WidgetsInTemplateMixin",
    	"./Action",
    	"../Workbench",
    	"dojo/i18n!./nls/actions",
    	"dojo/text!../ui/templates/SwitchLayout.html",
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Action, Workbench, langObj, templateString){

declare("davinci.actions.SelectLayoutActionContent", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
  templateString: templateString,

	langObj: langObj,

	combobox: null,

	flowLayout: null,

	postCreate: function() {
		this.combobox.set("value", this.flowLayout ? langObj.flow : langObj.abs);
	},

	getValue: function() {
		return this.combobox.get("value") == langObj.flow ? "Flow positioning" : "Absolute positioning";
	}
});

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
			if (newLayout === 'absolute' || newLayout === 'Absolute positioning'){
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

		var ui = new davinci.actions.SelectLayoutActionContent({flowLayout: flowLayout});

		function _callback() {
			this._changeLayoutCommand(ui.getValue());
		}

		Workbench.showDialog(langObj.newWidgetsShouldUse, ui, {width: 200}, dojo.hitch(this, _callback), langObj.select);
	}
});
});

