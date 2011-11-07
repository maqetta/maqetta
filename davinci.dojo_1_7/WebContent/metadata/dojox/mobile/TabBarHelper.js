define([
	"dojo/_base/lang",
	"./_FixedElemMixin"
	], function(
			lang,
			_FixedElemMixin
	) {

	var TabBarHelper = function() {};

	// brings in getPropertyValue()
	lang.extend(TabBarHelper, _FixedElemMixin);

	return TabBarHelper;

});