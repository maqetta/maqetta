define([
    	"dojo/_base/declare",
    	"davinci/actions/Action",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"dojo/i18n!davinci/ve/nls/ve",
    	"dojo/i18n!dijit/nls/common"
], function(declare, Action, CompoundCommand, RemoveCommand, veNls, commonNls){


return declare("davinci.ve.actions.ChooseDeviceAction", [Action], {

	
	run: function(selection){
		if (!this.isEnabled(null)){ return; }
		this.showDevices(); 
	},

	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		return e.declaredClass == 'davinci.ve.PageEditor'; // this is a hack to only support undo for theme editor for 0.5
	},

	showDevices: function(){

		var e = davinci.Workbench.getOpenEditor(),
			c = e.getContext(),
			device = c.visualEditor.deviceName,
			deviceList = ["none", "iphone", "ipad", "android_340x480", "android_480x800", "androidtablet", "blackberry"],
			formHtml = '<select dojoType="dijit.form.ComboBox" id="devices" name="devices">';
		e._visualChanged();
		formHtml += deviceList.map(function(name){
			return '<option' + (name == device ? ' selected' : '') + '>' + name+ '</option>';			
		}).join("")
			+ '</select><br/>';
		var	dialog = new dijit.Dialog({id: "selectDevices", title:veNls.chooseDeviceSilhouette,
			onCancel:function(){this.destroyRecursive(false);}});	
		dojo.connect(dialog, 'onLoad', function(){
			var cb = dijit.byId('devices');
			dojo.connect(cb, "onChange", function(newDevice){
				dialog.destroyRecursive(false);
				var e = davinci.Workbench.getOpenEditor();
				var context = e.getContext();
				context.visualEditor.setDevice(newDevice);
				e._visualChanged();
			});
		}, this);

		dialog.setContent(formHtml);
		dialog.show();
	}
});

});
