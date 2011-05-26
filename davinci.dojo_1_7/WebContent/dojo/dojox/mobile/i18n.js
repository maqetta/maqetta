define(["./common", "dojo/i18n"], function(mcommon, i18n){
	// module:
	//		dojox/mobile/i18n
	// summary:
	//		TODOC

	dojo.getObject("mobile.i18n", true, dojox);

	dojox.mobile.i18n.load = function(/*String*/packageName, /*String*/bundleName, /*String?*/locale){
		return dojox.mobile.i18n.registerBundle(dojo.i18n.getLocalization(packageName, bundleName, locale));
	};

	dojox.mobile.i18n.registerBundle = function(/*Array*/bundle){
		if(!dojox.mobile.i18n.bundle){ dojox.mobile.i18n.bundle = []; }
		return dojo.mixin(dojox.mobile.i18n.bundle, bundle);
	};

	dojo.extend(dijit._WidgetBase, {
		mblNoConv: false,
		_cv: function(s){
			if(this.mblNoConv || !dojox.mobile.i18n.bundle){ return s; }
			return dojox.mobile.i18n.bundle[dojo.trim(s)] || s;
		}
	});

	return dojox.mobile.i18n;
});
