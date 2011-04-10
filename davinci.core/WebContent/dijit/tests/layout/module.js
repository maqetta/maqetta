dojo.provide("dijit.tests.layout.module");

try{
	doh.registerUrl("dijit.tests.layout.ContentPane", dojo.moduleUrl("dijit", "tests/layout/ContentPane.html"), 99999999);
	doh.registerUrl("dijit.tests.layout.ContentPaneLayout", dojo.moduleUrl("dijit", "tests/layout/ContentPaneLayout.html"), 99999999);

	doh.registerUrl("dijit.tests.layout.StackContainer", dojo.moduleUrl("dijit", "tests/layout/nestedStack.html"), 99999999); 

	doh.registerUrl("dijit.tests.layout.TabContainer", dojo.moduleUrl("dijit", "tests/layout/TabContainer.html"), 99999999);
	doh.registerUrl("dijit.tests.layout.robot.TabContainer_a11y", dojo.moduleUrl("dijit","tests/layout/robot/TabContainer_a11y.html"), 99999999);
	doh.registerUrl("dijit.tests.layout.robot.TabContainer_mouse", dojo.moduleUrl("dijit","tests/layout/robot/TabContainer_mouse.html"), 99999999);

	doh.registerUrl("dijit.tests.layout.AccordionContainer", dojo.moduleUrl("dijit", "tests/layout/AccordionContainer.html"), 99999999);
	doh.registerUrl("dijit.tests.layout.robot.AccordionContainer_a11y", dojo.moduleUrl("dijit","tests/layout/robot/AccordionContainer_a11y.html"), 99999999);
	doh.registerUrl("dijit.tests.layout.robot.AccordionContainer_mouse", dojo.moduleUrl("dijit","tests/layout/robot/AccordionContainer_mouse.html"), 99999999);

	doh.registerUrl("dijit.tests.layout.robot.BorderContainer", dojo.moduleUrl("dijit", "tests/layout/robot/BorderContainer.html"), 99999999); 
}catch(e){
	doh.debug(e);
}
