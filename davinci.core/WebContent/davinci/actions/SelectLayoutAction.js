dojo.provide("davinci.actions.SelectLayoutAction");
dojo.require("davinci.actions.Action");
dojo.require("davinci.resource");
//dojo.require("davinci.ve.commands.ChangeThemeCommand");



dojo.declare("davinci.actions.SelectLayoutAction", davinci.actions.Action, {
	
	run: function(selection){
		if (!this.isEnabled(null)) return;
		this.showLayouts(); 

	},

	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();

		if (e.declaredClass == 'davinci.ve.PageEditor') // this is a hack to only support undo for theme editor for 0.5
			return true;
		else return false;

	},


	_changeLayoutCommand: function(newLayout){
		
		var d = dijit.byId('selectLayout');
		if (d){
			d.destroyRecursive(false);
		}
		var e = davinci.Workbench.getOpenEditor();
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

		var e = davinci.Workbench.getOpenEditor();
		var c = e.getContext();
		var flowLayout = c.getFlowLayout();
		e._visualChanged();
		var formHtml = 
        '<select dojoType="dijit.form.ComboBox" id="layout" name="layout" >';
		if (flowLayout){
			formHtml = formHtml + '<option>Absolute positioning</option>';
			formHtml = formHtml + '<option selected>Flow positioning</option>';
		} else {
			formHtml = formHtml + '<option selected>Absolute positioning</option>';
			formHtml = formHtml + '<option>Flow positioning</option>';
		}
			

		formHtml = formHtml + '</select><br/>';
		var	dialog = new dijit.Dialog({id: "selectLayout", title:"New widgets should use: ", style: "width: 200px",
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


}
	);
davinci.preference_layout_ATTRIBUTE = 'dvFlowLayout';
