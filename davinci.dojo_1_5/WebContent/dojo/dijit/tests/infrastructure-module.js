dojo.provide("dijit.tests.infrastructure-module");

try{
	// _Widget
	doh.registerUrl("dijit.tests._Widget-lifecycle", dojo.moduleUrl("dijit", "tests/_Widget-lifecycle.html"), 99999999);
	doh.registerUrl("dijit.tests._Widget-attr", dojo.moduleUrl("dijit", "tests/_Widget-attr.html"), 99999999);
	doh.registerUrl("dijit.tests._Widget-subscribe", dojo.moduleUrl("dijit", "tests/_Widget-subscribe.html"), 99999999);
	doh.registerUrl("dijit.tests.Widget-placeAt", dojo.moduleUrl("dijit", "tests/Widget-placeAt.html"), 99999999);
	doh.registerUrl("dijit.tests.robot._Widget-deferredConnect", dojo.moduleUrl("dijit","tests/robot/_Widget-deferredConnect.html"), 99999999);
	doh.registerUrl("dijit.tests.robot._Widget-ondijitclick_mouse", dojo.moduleUrl("dijit","tests/robot/_Widget-ondijitclick_mouse.html"), 99999999);

	doh.registerUrl("dijit.tests.robot._Widget-ondijitclick_a11y", dojo.moduleUrl("dijit","tests/robot/_Widget-ondijitclick_a11y.html"), 99999999);

	// _Templated and other base classes
	doh.registerUrl("dijit.tests._Templated", dojo.moduleUrl("dijit", "tests/_Templated.html"), 99999999);
	doh.registerUrl("dijit.tests._Templated-widgetsInTemplate", dojo.moduleUrl("dijit", "tests/_Templated-widgetsInTemplate.html"), 99999999);
	doh.registerUrl("dijit.tests._Container", dojo.moduleUrl("dijit", "tests/_Container.html"), 99999999);
}catch(e){
	doh.debug(e);
}