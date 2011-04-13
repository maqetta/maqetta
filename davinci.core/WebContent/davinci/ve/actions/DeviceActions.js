dojo.provide("davinci.ve.actions.DeviceActions");
dojo.require("davinci.actions.Action");

dojo.declare("davinci.ve.actions.ChooseDeviceAction", davinci.actions.Action, {
	
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
			deviceList = ["none", "ipad", "iphone", "android_480x800", "blackberry"],
			formHtml = '<select dojoType="dijit.form.ComboBox" id="devices" name="devices">';
		e._visualChanged();
		formHtml += deviceList.map(function(name){
			return '<option' + (name == device ? ' selected' : '') + '>' + name+ '</option>';			
		}).join("")
			+ '</select><br/>';
		var	dialog = new dijit.Dialog({id: "selectDevices", title:"Choose a device silhouette: ", style: "width: 200px",
			onCancel:function(){this.destroyRecursive(false);}});	
		dojo.connect(dialog, 'onLoad', function(){
			var cb = dijit.byId('devices');
			dojo.connect(cb, "onChange", function(newDevice){
				dialog.destroyRecursive(false);
				c.visualEditor.setDevice(newDevice);
				e._visualChanged();
			});
		}, this);

		dialog.setContent(formHtml);
		dialog.show();
	}
});

dojo.declare("davinci.ve.actions.RotateDeviceAction", davinci.actions.Action, {
	
	run: function(selection){

		var e = davinci.Workbench.getOpenEditor();
		var context = e.getContext();
		dojo.toggleClass(context.visualEditor.contentPane.domNode, 'landscape');
	},
	
	isEnabled: function(selection){
		var e = davinci.Workbench.getOpenEditor();
		if (e && e.getContext)
	//	if (e.declaredClass == 'davinci.themeEditor.ThemeEditor') // this is a hack to only support undo for theme editor for 0.5
			return (e.getContext().getCommandStack().canRedo());
		else return false;
		//	return davinci.Runtime.commandStack.canRedo();
	}
}
);
