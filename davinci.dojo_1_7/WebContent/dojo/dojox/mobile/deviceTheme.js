define(["dojo/_base/kernel", "dojo/_base/array", "dojo/dom-construct", "dojo/_base/window", "./_base"],
	function(dojo, darray, domConstruct, dwindow, mbase){
	// module:
	//		dojox/mobile/deviceTheme
	// summary:
	//		Automatic Theme Loader
	// description:
	//		Detects the User Agent of the browser and loads appropriate theme files.
	//		Simply dojo.require this module to enable the automatic theme loading.
	//
	//		By default, an all-in-one theme file (e.g. themes/iphone/iphone.css) is
	//		loaded. The all-in-one theme files contain style sheets for all the
	//		dojox.mobile widgets regardless of whether they are used in your
	//		application or not.
	//		If you want to choose what theme files to load, you can specify them
	//		via djConfig as shown in the following example:
	//
	//	|	djConfig="parseOnLoad:true, mblThemeFiles:['base','Button']"
	//
	//		Or you may want to use dojox.mobile.themeFiles as follows to get the
	//		same result. Note that the assignment has to be done before loading
	//		deviceTheme.js.
	//
	//	|	dojo.require("dojox.mobile");
	//	|	dojox.mobile.themeFiles = ['base','Button'];
	//	|	dojo.require("dojox.mobile.deviceTheme");
	//
	//		In the case of this example, if iphone is detected, for example, the
	//		following files will be loaded:
	//
	//	|	dojox/mobile/themes/iphone/base.css
	//	|	dojox/mobile/themes/iphone/Button.css
	//
	//		If you want to load style sheets for your own custom widgets, you can
	//		specify a package name along with a theme file name in an array.
	//
	//	|	['base',['com.acme','MyWidget']]
	//
	//		In this case, the following files will be loaded.
	//
	//	|	dojox/mobile/themes/iphone/base.css
	//	|	com/acme/themes/iphone/MyWidget.css
	//
	//		If you specify '@theme' as a theme file name, it will be replaced with
	//		the theme folder name. For example,
	//
	//	|	['@theme',['com.acme','MyWidget']]
	//
	//		will load the following files.
	//
	//	|	dojox/mobile/themes/iphone/iphone.css
	//	|	com/acme/themes/iphone/MyWidget.css

	dojox.mobile.loadCssFile = function(/*String*/file){
		dojo.create("LINK", {
			href: file,
			type: "text/css",
			rel: "stylesheet"
		}, dojo.doc.getElementsByTagName('head')[0]);
	};

	dojox.mobile.themeMap = dojox.mobile.themeMap || [
		// summary:
		//		A map of user-agents to theme files.
		// description:
		//		The first array element is a regexp pattern that matches the
		//		userAgent string.
		//
		//		The second array element is a theme folder name.
		//
		//		The third array element is an array of css file paths to load.
		//
		//		The matching is performed in the array order, and stops after the
		//		first match.
		[
			"Android",
			"android",
			[]
		],
		[
			"BlackBerry",
			"blackberry",
			[]
		],
		[
			"iPad",
			"iphone",
			[dojo.moduleUrl("dojox.mobile", "themes/iphone/ipad.css")]
		],
		[
			"Custom",
			"custom",
			[]
		],
		[
			".*",
			"iphone",
			[]
		]
	];

	dojox.mobile.loadDeviceTheme = function(){
		var t = dojo.config["mblThemeFiles"] || dojox.mobile.themeFiles || ["@theme"];
		if(!dojo.isArray(t)){ console.log("loadDeviceTheme: array is expected but found: "+t); }
		var i, j;
		var m = dojox.mobile.themeMap;
		var ua = (location.search.match(/theme=(\w+)/)) ? RegExp.$1 : navigator.userAgent;
		for(i = 0; i < m.length; i++){
			if(ua.match(new RegExp(m[i][0]))){
				var theme = m[i][1];
				var files = m[i][2];
				for(j = t.length - 1; j >= 0; j--){
					var pkg = dojo.isArray(t[j]) ? t[j][0] : "dojox.mobile";
					var name = dojo.isArray(t[j]) ? t[j][1] : t[j];
					var f = "themes/" + theme + "/" +
						(name === "@theme" ? theme : name) + ".css";
					files.unshift(dojo.moduleUrl(pkg, f));
				}
				for(j = 0; j < files.length; j++){
					dojox.mobile.loadCssFile(files[j].toString());
				}
				break;
			}
		}
	};
	
	if(dojox.mobile.configDeviceTheme){
		dojox.mobile.configDeviceTheme();
	}
	dojox.mobile.loadDeviceTheme();

	return dojox.mobile.deviceTheme;
});
