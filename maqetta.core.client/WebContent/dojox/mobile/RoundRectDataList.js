define([
	"dojo/_base/declare",
	"./RoundRectList",
	"./_DataListMixin"
], function(declare, RoundRectList, DataListMixin){

	// module:
	//		dojox/mobile/RoundRectDataList
	// summary:
	//		An enhanced version of RoundRectList.

	return declare("dojox.mobile.RoundRectDataList", [RoundRectList, DataListMixin], {
		// summary:
		//		An enhanced version of RoundRectList.
		// description:
		//		RoundRectDataList is an enhanced version of RoundRectList. It
		//		can generate ListItems according to the given dojo.data store.
	});
});
