define([
	"dojo/_base/declare",
	"../../metadata/dojo/1.7/dijit/layout/ContainerInput",
	"dijit/Dialog",
	"./GridWizard",
	"dojo/i18n!./nls/gridx",
	"davinci/css!./resources/gridInput.css",
],
function(declare, 
		ContainerInput, 
		Dialog,
		GridWizard,
		gridxLangObj) {

return declare(ContainerInput, {
	
	show: function(widgetId) {
		this._widget = davinci.ve.widget.byId(widgetId);
		if (!this._inline) {
			var gridWizard = this.gridWizard = new GridWizard({widgetId: widgetId});
			this._inline = new dijit.Dialog( {
				title : gridxLangObj.gridDialogTitle,
				onCancel: dojo.hitch(this, this.close),
				onHide: dojo.hitch(this, this.hide)
			});
			this._inline.set("content", gridWizard);
			
			//See up listeners for Finish and Cancel buttons on the wizard
			this._connection.push(dojo.connect(gridWizard, "onFinish", dojo.hitch(this,function(){
				this.updateWidget();
				this.onOk();
			})));
			this._connection.push(dojo.connect(gridWizard, "onCancel", this, this.hide));
			
			//Listen for dialog being closed via the "X" in title bar
			this._inline.onCancel = dojo.hitch(this, "onCancel");
			this._inline.callBackObj = this;
			
			//Show the dialog
			this._inline.show();
			
			//Allow wizard to do any final initialization
			gridWizard.show();	
		}
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
		this.inherited(arguments);
	},
	
	updateWidget: function() {
		this.gridWizard.updateWidget();
	}
});
});