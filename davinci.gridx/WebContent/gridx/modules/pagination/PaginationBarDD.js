define([
	"dojo/_base/declare",
	"../../core/_Module",
	"./_PaginationBarBase",
	"./DropDownPager",
	"dijit/form/FilteringSelect",
	"dijit/form/Select"
], function(declare, _Module, _PaginationBarBase, Pager,
	FilteringSelect, Select){

	return _Module.register(
	declare(_PaginationBarBase, {
		// summary:
		//		This module implements a pagination bar UI that uses drop down lists for pages and page sizes.
		//		This implementation saves more horizontal space compared to the link button version of pagination bar.

		// stepperClass: [private]
		stepperClass: FilteringSelect,

		// sizeSwitchCalss [private]
		sizeSwitchClass: Select,

	/*=====
		// Configurable texts on the pagination bar:
		pageSizeAllText: '',
		descriptionTemplate: '',
		descriptionSelectionTemplate: '',
	=====*/

		// pagerClass: [private]
		pagerClass: Pager
	}));	
});

