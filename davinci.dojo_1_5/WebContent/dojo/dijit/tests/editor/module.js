dojo.provide("dijit.tests.editor.module");

try{
	var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g,"").replace(/^&/,"?");

	// Base editor functionality
	doh.registerUrl("dijit.tests.editor.robot.Editor_mouse", dojo.moduleUrl("dijit","tests/editor/robot/Editor_mouse.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.Editor_a11y", dojo.moduleUrl("dijit","tests/editor/robot/Editor_a11y.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.Misc", dojo.moduleUrl("dijit","tests/editor/robot/Editor_misc.html"+userArgs), 99999999);

	// Plugins
	doh.registerUrl("dijit.tests.editor.robot.EnterKeyHandling", dojo.moduleUrl("dijit","tests/editor/robot/EnterKeyHandling.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.FullScreen", dojo.moduleUrl("dijit","tests/editor/robot/Editor_FullScreen.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.ViewSource", dojo.moduleUrl("dijit","tests/editor/robot/Editor_ViewSource.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.NewPage", dojo.moduleUrl("dijit","tests/editor/robot/Editor_NewPage.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.LinkDialog", dojo.moduleUrl("dijit","tests/editor/robot/Editor_LinkDialog.html"+userArgs), 99999999);
	doh.registerUrl("dijit.tests.editor.robot.FontChoice", dojo.moduleUrl("dijit","tests/editor/robot/Editor_FontChoice.html"+userArgs), 99999999);
	if(!dojo.isWebKit){
		// The back button on webkit is URL for the browser itself, restarting the entire test suite,
		// rather than just for the iframe holding the test file (BackForwardState.html and BackForwardStateHelper.html)
		doh.registerUrl("dijit.tests.editor.robot.BackForwardState", dojo.moduleUrl("dijit","tests/editor/robot/BackForwardState.html"+userArgs), 99999999);
	}

}catch(e){
	doh.debug(e);
}



