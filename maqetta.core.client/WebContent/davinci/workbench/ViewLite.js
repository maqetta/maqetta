define([
	"dojo/_base/declare",
	"./WidgetLite",
	"../ve/States"
], function(declare, WidgetLite) {

/**
 * This class is a base class for various pieces of the Properties palette
 * (i.e., pieces of SwitchingStylingViews.js).
 * At the time of writing this note, it is used by:
 *   davinci/ve/widgets/CommonProperties.js
 *   davinci/ve/widgets/EventSelection.js
 *   davinci/ve/widgets/WidgetProperties.js
 *   davinci/ve/widgets/WidgetToolBar.js
 */
return declare("davinci.workbench.ViewLite", [WidgetLite], {
	/* selected editor */
	_editor : null,
	/* selected widget */
	_widget : null,
	/* selected sub widget */
	_subWidget : null,

	constructor: function(params, srcNodeRef){
    	this.subscriptions=[];
    	this.publishing={};
    	
    	dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
		dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
	},
	
	_widgetSelectionChanged: function (changeEvent){
		if(	!this._editor ) {
			return;
		}
		var widget=changeEvent[0];
		if(widget && this._widget == widget && this._subwidget==widget.subwidget) {
			return false;
		}
		this._widget = widget;
		this._subwidget = widget && widget.subwidget;
		if(this.onWidgetSelectionChange) {
			this.onWidgetSelectionChange();
		}
	},

	_editorSelected: function(editorChange){
		this._editor = editorChange.editor;
		if(this.onEditorSelected) {
			this.onEditorSelected(this._editor);
		}
	 },	

	subscribe: function(topic,func){
		this.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	
	publish: function (topic,data){
		this.publishing[topic]=true;
		try {
			dojo.publish(topic,data);
		} catch(e) {
			console.error(e);
		}
		delete this.publishing[topic];
		
	},
	
	destroy: function(){
		dojo.forEach(this.subscriptions, dojo.unsubscribe);
		delete this.subscriptions;
	}
});
});
