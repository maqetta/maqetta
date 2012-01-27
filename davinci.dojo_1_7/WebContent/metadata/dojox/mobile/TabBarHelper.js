define([
	"dojo/_base/lang",
	"./_FixedElemMixin"
], function(
		lang,
		_FixedElemMixin
) {

var TabBarHelper = {};

// brings in getPropertyValue()
lang.mixin(TabBarHelper, _FixedElemMixin);

return TabBarHelper;

});