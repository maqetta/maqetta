define([
	"dojo/i18n!./nls/webContent",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"./commands/CommandStack",
	"./ui.plugin",
	"./html/html.plugin",
	"./js/js.plugin",
	"./ve/ve.plugin",
	"./ve/themeEditor/themeEditor.plugin",
	"./review/review.plugin",
	"./review/Color"
], function(
	webContent,
	Dialog,
	Button,
	TextBox,
	CommandStack,
	ui_plugin,
	html_plugin,
	js_plugin,
	ve_plugin,
	themeEditor_plugin,
	review_plugin,
	Color
) {

// list of plugins to load
var plugins = [
	ui_plugin,
	html_plugin,
	js_plugin,
	ve_plugin,
	themeEditor_plugin,
	review_plugin
];

var Runtime = {
	plugins: [],
	extensionPoints: [],
	subscriptions: [],
	currentSelection: [],
	commandStack: new CommandStack(),
	
	addPlugin: function(pluginName) {
		url = pluginName + ".plugin";
		dojo.xhrGet( {
			// The following URL must match that used to test
			// the server.
			url:url,
			handleAs:"json",
			sync:true,
			load: function(responseObject, ioArgs) {
				Runtime._loadPlugin(responseObject,url);
			}
		});
	},

	getUser: function() {
		return dojo.cookie("DAVINCI.USER");
	},
	
	loadPlugins: function() {
		plugins.forEach(function(plugin) {
			var pluginID = plugin.id;
			Runtime.plugins[pluginID] = plugin;
			for (var id in plugin) {
				var extension = plugin[id];
				if (typeof extension != "string") {
					if (extension instanceof Array) {
						extension.forEach(function(ext) {
							Runtime._addExtension(id, ext, pluginID);
						});
					} else {
						Runtime._addExtension(id, extension, pluginID);
					}
				}
			}
		});
	},
	
	singleUserMode : function() {
		return Runtime.isLocalInstall;
	},

	/*
	 * If in single user mode, returns the current active project.
	 * 
	 */
	
	location: function(){
		return document.location.href.split("?")[0];
	},
	
	//Not sure review-specific function like this belongs in Runtime, but 
	//called from welcome_to_maqetta.html
	publish: function(node) {
		var publish = new davinci.review.actions.PublishAction();
		publish.run(node);
	},
	
	//Review-specific... This should really be removed from Runtime
	getColor: function(/*string*/ name) {
		var index;
		dojo.some(Runtime.reviewers,function(item,n){
			if (item.name==name) {
				index = n;
				return true;
			}
			return false;
		});
		return Color.colors[index];
	},
	
	run: function() {
		// add class to root HTML element to indicate if mac or windows
		// this is because of different alignment on mac/chrome vs win/chrome
		// FIXME: this platform-dependent logic might not be necessary if
		// main toolbar changes or different CSS applies to that toolbar
		if (dojo.isMac) {
			dojo.addClass(document.documentElement,"isMac");
		}
		
	    // determine if the browser supports CSS3 transitions
	    var thisStyle = document.body.style;
	    Runtime.supportsCSS3Transitions = thisStyle.WebkitTransition !== undefined ||
	        thisStyle.MozTransition !== undefined ||
	        thisStyle.OTransition !== undefined ||
	        thisStyle.transition !== undefined;
		
		Runtime.subscribe("/davinci/ui/selectionChanged",Runtime._selectionChanged);
		
		// intercept BS key - prompt user before navigating backwards
		dojo.connect(dojo.doc.documentElement, "onkeypress", function(e){
			if(e.charOrCode==8){
				window.davinciBackspaceKeyTime = Date.now();
			}
		});	
		
		dojo.addOnUnload(function (e) {
			//This will hold a warning message (if any) that we'll want to display to the
			//user.
			var message = null;
			
			//Loop through all of the editor containers and give them a chance to tell us
			//the user should be warned before leaving the page.
			var editorContainers = davinci.Workbench.editorTabs.getChildren();
			var editorsWithWarningsCount = 0;
			for (var i = 0; i < editorContainers.length; i++) {
				var editorContainer = editorContainers[i];
				if (editorContainer.editor) {
					var editorResponse = editorContainer.editor.getOnUnloadWarningMessage();

					if (editorResponse) {
						//Let's keep track of the first message. If we end up finding multiple messages, we'll
						//augment what the user will see shortly.
						if (!message) {
							message = editorResponse;
						}
						editorsWithWarningsCount++;
					}
				}
			}
			//If multiple warnings, augment message user will see
			if (editorsWithWarningsCount > 1) {
				message = dojo.string.substitute(webContent.multipleFilesUnsaved, [message, editorsWithWarningsCount]);
			}
			
			if (!message) {
				//No warnings so far, let's see if use maybe accidentally hit backspace
				var shouldDisplayForBackspace = Date.now() - window.davinciBackspaceKeyTime < 100;
				if (shouldDisplayForBackspace) {
					message = webContent.careful;
				}
			}
			
			if (message) {
				// We've found warnings, so we want to warn the user they run the risk of 
				// losing data if they leave the page.
				
				// For Mozilla/IE, we need to see the return value directly on the 
				// event. But, note in FF 4 and later that the browser ignores our
				// message and uses a default message of its own.
				if (e = e || window.event) {
					e.returnValue = message;
				}
				
				// For other browsers (like Chrome), the message returned by the
				// handler is honored.
				return message;
			}
		});
	},
	
	subscribe: function(topic,func) {
		Runtime.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	destroy: function() {
		dojo.forEach(Runtime.subscriptions, dojo.unsubscribe);
	},
	
	_addExtension: function(id, extension, pluginID) {
		if (extension.id) {
			extension.id = pluginID + "." + extension.id;
		}

		Runtime.extensionPoints[id] = Runtime.extensionPoints[id] || [];
		var extensions = Runtime.extensionPoints[id];
		extensions.push(extension);
		Runtime.extensionPoints[id] = extensions;
	},
	
	getExtensions: function(extensionID, testFunction) {
		
		var extensions = Runtime.extensionPoints[extensionID];
		if (testFunction) {
			var matching=[];
			var isFunction = testFunction instanceof Function;
			if (extensions) {
				return extensions.filter(function(ext) {
					return (isFunction && testFunction(ext)) || ext.id == testFunction;
				});
			}
		}
		return extensions;
	},
	
	getExtension: function(extensionID, testFunction) {
		return Runtime.getExtensions(extensionID, testFunction)[0];
	},

	handleError: function(error) {
		var redirectUrl = "welcome";
		if(Runtime.singleUserMode()){
			redirectUrl = ".";
		}
		
		window.document.body.innerHTML = 
			"<div><h1>Problem connecting to the Maqetta Server...</h1></div><div><center><h1><a href='"+ redirectUrl +
			"'>Return to Maqetta Login</a></h1></center></div><br><br><div><h2>Error description:</h2>" + error + 
			"</div>"; // TODO: i18n
	},

	executeCommand: function(cmdID) {
		var cmd=Runtime.getExtension("davinci.commands", cmdID);
		if (cmd && cmd.run) {
			cmd.run();
		}
	},
	
	_selectionChanged: function(selection) {
		Runtime.currentSelection=selection;
	},
	
	getSelection: function() {
		return Runtime.currentSelection;
	},

	doLogin: function() {
		var retry=true;
		var formHtml = "<table>" +
        "<tr><td><label for=\"username\">User: </label></td>" +
        "<td><input dojoType=\dijit.form.TextBox\ type=\"text\" name=\"username\" id='username' ></input></td></tr>" +
        "<tr><td><label for=\"password\">Password: </label></td> <td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"password\" id='password'></input></td></tr>" +
        "<tr><td colspan=\"2\" align=\"center\"><button dojoType=\"dijit.form.Button\" type=\"submit\" >Login</button></td>" +
        "</tr></table>"; // FIXME: i18n
		do {
			var isInput=false;
			var dialog = new Dialog({
				id: "connectDialog",
				title: "Please login", 
				onExecute: function(){
					dojo.xhrGet({
						url: "cmd/login",
						sync: true,
						handleAs: "text",
						content:{
						    userName: dojo.byId("username").value,
						    password: dojo.byId("password").value,
						    noRedirect: true
						}
					}).then(function(result) {
						if (result=="OK") {
						    // cheap fix.
						    //window.location.reload();
						    window.location.href= 'welcome';
						    //retry=false;
						} else {
						    console.warn("Unknown error: result="+result);
						}
					    }, function(error) {
					    	console.warn("Login error", error);
					    });
					isInput=true;
				},
				onCancel:function(){
				    isInput=true;
				    Runtime.destroyRecursive(false);
				}
			});	
			dialog.setContent(formHtml);
			dialog.show();			
		} while (retry);
	},
	
	serverJSONRequest: function (ioArgs) {
		var resultObj;
		var args={handleAs:"json" };
		dojo.mixin(args, ioArgs);
		var userOnError=ioArgs.error;
		var retry = false;
		
		do {
			dojo.xhrGet(args).then(function(result) {
				if (result) {
					resultObj=result;
				}
			});
		} while (retry);	

		return resultObj;
	},

	logoff: function(args) {
		var loading = dojo.create("div",null, dojo.body(), "first");
		loading.innerHTML='<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Logging off...</td></tr></table>'; // FIXME: i18n
		dojo.addClass(loading, 'loading');
		require("davinci/Workbench").unload();
		Runtime.serverJSONRequest({
			url:"cmd/logoff", handleAs:"text", sync:true
		});
		if (Runtime.plugins.joomlaplugin) {
			location.href = "http://" + window.location.hostname + "/index.php?option=com_user&task=logout&return=Lw";
		} else { // non-Joomla plugins use the default welcome page
			var newLocation = Runtime.location();
			var lastChar=newLocation.length-1;
			if (newLocation.charAt(lastChar)=='/') {
				newLocation=newLocation.substr(0,lastChar);
			}
			location.href = newLocation+"/welcome";
		}
	}
};

davinci.Runtime = Runtime; //FIXME: shouldn't need this
return Runtime;
});
