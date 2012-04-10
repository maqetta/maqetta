define([
	"dojo/_base/declare",
	"./_PaginationBarBase",
	"./LinkPager",
	"../../core/_Module",
	"./GotoPagePane",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/form/NumberTextBox"
], function(declare, _PaginationBarBase, Pager, _Module, GotoPagePane, Dialog, Button, NumberTextBox){

	return _Module.register(
	declare(/*===== "gridx.modules.pagination.PaginationBar", =====*/_PaginationBarBase, {
		// summary:
		//		This module implements a pagination bar UI that uses link buttons for pages and page sizes.

		// gotoButton: Boolean|String
		gotoButton: true,

		// visibleSteppers: Integer
		visibleSteppers: 3,

		// sizeSeparator: String
		sizeSeparator: '|',

		// gotoPagePane: [private]
		gotoPagePane: GotoPagePane,

		// dialogClass: [private]
		dialogClass: Dialog,

		// buttonClass: [private]
		buttonClass: Button,

		// numberTextBoxClass: [private]
		numberTextBoxClass: NumberTextBox,

	/*=====
		// Configurable texts on the pagination bar:
		pageIndexTitleTemplate: '',
		pageIndexWaiTemplate: '',
		pageIndexTemplate: '',
		pageSizeTitleTemplate: '',
		pageSizeWaiTemplate: '',
		pageSizeTemplate: '',
		pageSizeAllTitleText: '',
		pageSizeAllWaiText: '',
		pageSizeAllText: '',
		descriptionTemplate: '',
		descriptionSelectionTemplate: '',
	=====*/

		// pagerClass: [private]
		pagerClass: Pager
	}));	
});
