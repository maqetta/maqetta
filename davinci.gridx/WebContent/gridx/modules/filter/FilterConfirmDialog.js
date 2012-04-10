define([
	"dojo/_base/kernel",
	"dijit",
	"dojo/_base/declare",
	"dojo/text!../../templates/FilterConfirmDialog.html",
	"dijit/Dialog",
	"dijit/layout/AccordionContainer",
	"dojo/data/ItemFileReadStore",
	"./FilterPane",
	"./Filter"
], function(dojo, dijit, declare, template){

	return declare(dijit.Dialog, {
		title: 'Clear Filter',
		cssClass: 'gridxFilterConfirmDialog',
		autofocus: false,
		postCreate: function(){
			this.inherited(arguments);
			this.set('content', template);
			var arr = dijit.findWidgets(this.domNode);
			this.btnClear = arr[0];
			this.btnCancel = arr[1];
			this.connect(this.btnCancel, 'onClick', 'hide');
			this.connect(this.btnClear, 'onClick', 'onExecute');
		},
		onExecute: function(){
			this.execute();
		},
		execute: function(){}
	});
});