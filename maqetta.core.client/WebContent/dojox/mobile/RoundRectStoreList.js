define([
	"dojo/_base/declare",
	"./RoundRectList",
	"./_StoreListMixin"
], function(declare, RoundRectList, StoreListMixin){

	// module:
	//		dojox/mobile/RoundRectStoreList
	// summary:
	//		An enhanced version of RoundRectList.

	return declare("dojox.mobile.RoundRectStoreList", [RoundRectList, StoreListMixin], {
		// summary:
		//		An enhanced version of RoundRectList.
		// description:
		//		RoundRectStoreList is an enhanced version of RoundRectList. It
		//		can generate ListItems according to the given dojo.store store.
	});
});
