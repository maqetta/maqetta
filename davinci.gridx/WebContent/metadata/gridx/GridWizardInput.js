define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dijit/layout/ContainerInput",
	"davinci/ui/Dialog",
	"./GridWizard",
	"dojo/i18n!./nls/gridx",
	"davinci/css!./resources/gridInput.css"
], function(
	declare,
	ContainerInput,
	Dialog,
	GridWizard,
	gridxLangObj
) {

return declare(ContainerInput, {
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);
		//Create wizard
		var gridWizard = this.gridWizard = new GridWizard({
			widgetId: widgetId
		});
		
		//Create dialog and add wizard to it
		this._inline = Dialog.showModal(gridWizard, gridxLangObj.gridDialogTitle, {}, function(){});
		
		//See up listeners for Finish and Cancel buttons on the wizard
		this._connection.push(dojo.connect(gridWizard, "onFinish", dojo.hitch(this,function(){
			this.updateWidget();
			this.hide();
		})));
		this._connection.push(dojo.connect(gridWizard, "onCancel", dojo.hitch(this,function(){
			this.hide();
		})));
				
		//Listen for dialog being closed via the "X" in title bar
		this._inline.onCancel = dojo.hitch(this, "onCancel");
	},
	
	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			var connection;
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}
			
			//Destroy dialog and widgets
			this._inline.destroyRecursive();
			delete this._inline;
		}
	},
	
	updateWidget: function() {
		this.gridWizard.updateWidget();
	}
});
});