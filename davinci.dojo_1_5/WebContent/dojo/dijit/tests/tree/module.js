dojo.provide("dijit.tests.tree.module");

try{
	var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g,"").replace(/^&/,"?"),
		test_robot = true;

	doh.registerUrl("dijit.tests.Tree", dojo.moduleUrl("dijit", "tests/Tree.html"), 99999999);
	doh.registerUrl("dijit.tests.Tree_with_JRS", dojo.moduleUrl("dijit", "tests/Tree_with_JRS.html"), 99999999);
	if(test_robot){
		doh.registerUrl("dijit.tests.robot.Tree_a11y", dojo.moduleUrl("dijit","tests/robot/Tree_a11y.html"+userArgs), 99999999);
		doh.registerUrl("dijit.tests.robot.Tree_DnD", dojo.moduleUrl("dijit","tests/robot/Tree_dnd.html"+userArgs), 99999999);
		doh.registerUrl("dijit.tests.robot.Tree_DnD_multiParent", dojo.moduleUrl("dijit","tests/robot/Tree_dnd_multiParent.html"+userArgs), 99999999);
	}
}catch(e){
	doh.debug(e);
}