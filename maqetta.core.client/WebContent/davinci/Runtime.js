define([
//	"./Workbench", //FIXME: circular ref?
	"./commands/CommandStack",
	"./ve/metadata",
	"dojo/i18n!./nls/webContent",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/form/TextBox"
], function(/*Workbench, */CommandStack, metadata, webContent, Dialog) {

var Runtime = {
	plugins: [],
	extensionPoints: [],
	subscriptions: [],
	widgetTable: {},
	
	_DEFAULT_PROJECT: "project1",
	
	currentSelection: [],
	commandStack: new CommandStack(),
//	clipboard: null,
	
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
			},
			error: function(response, ioArgs) {
				if (response.status==401)
				{
//					Runtime.doLogin();
//					retry=true;
					window.location.reload();
				} else {
					Runtime.handleError(dojo.string.substitute(webContent.errorLoadingPlugin, [pluginName, response]));
				}
			}
		});
	},

	getUser: function(){
		return dojo.cookie("DAVINCI.USER");
	},
	
	loadPlugins: function() {
		dojo.xhrGet( {
			// The following URL must match that used to test
			// the server.
			url:'cmd/getPlugins',
			handleAs:"json",
			sync:true,
			load: function(responseObject, ioArgs) {
			   Runtime._loadPlugins(responseObject);
			},
			error: function(response, ioArgs) {
				if (response.status==401)
				{
//					Runtime.doLogin();
//					retry=true;
					//window.location.reload();
					window.location.href= 'welcome';
				}else{
					Runtime.handleError(webContent.errorLoadingPlugins);
				}
			}
		});
	},
	
	_loadPlugins: function(plugins) {
		for (var i=0;i<plugins.length;i+=2) {
			var url=plugins[i];
			var plugin=plugins[i+1];
			Runtime._loadPlugin(plugin, url);
		}
	},
	/*
	 * running in single project mode or multi project mode
	 */
	singleProjectMode: function(){
		return true;
	},
	
	
	singleUserMode : function(){
		return Runtime.isLocalInstall;
	},

	/*
	 * If in single user mode, returns the current active project.
	 * 
	 */
	
	getProject: function(){
		/*
		var params = davinci.Workbench.queryParams();
		if(params.project) {
			return decodeURI(params.project);
		}
		*/
		return davinci.Workbench.getActiveProject() || Runtime._DEFAULT_PROJECT;
	},
	
	loadProject: function(projectName){
		/*
		var params = davinci.Workbench.queryParams();
		params.project = encodeURI(projectName);
		
		
		window.location.href=davinci.Workbench.location() + "?" + dojo.objectToQuery(params);
		*/
		davinci.Workbench.setActiveProject(projectName);
		location.reload(true);
	},
	
	getRole: function(){
		if(!davinci.Runtime.commenting_designerName)
			return "Designer";
		else{
			if(!davinci.Runtime.userInfo){
	            var result = davinci.Runtime.serverJSONRequest({
	                url: "maqetta/cmd/getReviewUserInfo",
	                sync: true
	            });
				davinci.Runtime.userInfo = result;
			}
			if(davinci.Runtime.userInfo.userName==davinci.Runtime.commenting_designerName)
				return "Designer";
		}
		return "Reviewer";
	},
	
	getDesigner: function(){
		if(davinci.Runtime.commenting_designerName)
			return davinci.Runtime.commenting_designerName;
		else{
				if(!davinci.Runtime.userInfo){
		            var result = davinci.Runtime.serverJSONRequest({
		                url: "maqetta/cmd/getReviewUserInfo",
		                sync: true
		            });
					davinci.Runtime.userInfo = result;
				}
				return davinci.Runtime.userInfo.userName;
			}
	},
	
	getDesignerEmail: function(){
		if(davinci.Runtime.commenting_designerEmail)
			return davinci.Runtime.commenting_designerEmail;
		else{
				if(!davinci.Runtime.userInfo){
		            var result = davinci.Runtime.serverJSONRequest({
		                url: "maqetta/cmd/getReviewUserInfo",
		                sync: true
		            });
					davinci.Runtime.userInfo = result;
				}
				return davinci.Runtime.userInfo.email;
			}
	},
	
	publish: function(node){
		var publish = new davinci.review.actions.PublishAction();
		publish.run(node);
	},
	
	//two modes in design page and in review page
	getMode: function(){
		if(davinci.Runtime.commenting_designerName)
			return "reviewPage";
		else return "designPage";
	},
	
	
	getColor: function(/*string*/ name){
		var index;
		dojo.some(this.reviewers,function(item,n){
			if(item.name==name){
				index = n;
				return true;
			}
			return false;
		});
		return davinci.review.colors.colors[index];
	},
	
	run: function() {
		// add class to root HTML element to indicate if mac or windows
		// this is because of different alignment on mac/chrome vs win/chrome
		// FIXME: this platform-dependent logic might not be necessary if
		// main toolbar changes or different CSS applies to that toolbar
		if(dojo.isMac){
			dojo.addClass(document.documentElement,"isMac");
		}
		
	    // determine if the browser supports CSS3 transitions
	    var thisStyle = document.body.style;
	    Runtime.supportsCSS3Transitions = thisStyle.WebkitTransition !== undefined ||
	        thisStyle.MozTransition !== undefined ||
	        thisStyle.OTransition !== undefined ||
	        thisStyle.transition !== undefined;
		metadata.init();
		Runtime.subscribe("/davinci/ui/selectionChanged",Runtime._selectionChanged);
		davinci.Workbench.run();
		// intercept BS key - prompt user before navigating backwards
		dojo.connect(dojo.doc.documentElement, "onkeypress", function(e){
			if(e.charOrCode==8){
				window.davinciBackspaceKeyTime = Date.now();
			}
		});	
		window.onbeforeunload = function (e) {
			var shouldDisplay = Date.now() - window.davinciBackspaceKeyTime < 100;
			if (shouldDisplay) {
				var message = webContent.careful;
				// Mozilla/IE
				// Are you sure you want to navigate away from this page?
				// Careful! You will lose any unsaved work if you leave this page now.
				// Press OK to continue, or Cancel to stay on the current page.
				if (e = e || window.event) {
					e.returnValue = message;
				}
				// Webkit
				// Careful! You will lose any unsaved work if you leave this page now.
				// [Leave this Page] [Stay on this Page]
				return message;
			}
		};
	},
	
	unload: function () {
		davinci.Workbench.unload();
	},

	subscribe: function(topic, func) {
		Runtime.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	destroy: function () {
		dojo.forEach(Runtime.subscriptions, dojo.unsubscribe);
	},
	_loadPlugin: function(plugin,url) {
		var pluginID = plugin.id;
		Runtime.plugins[pluginID] = plugin;
		if (plugin.css) {
			Runtime._loadCSS(plugin,url);
		}
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
	},
	
	_addExtension: function(id, extension, pluginID) {
		
		if (extension.id) {
			extension.id = pluginID + "." + extension.id;
		}
		var extensions = Runtime.extensionPoints[id];
		if (extensions == null) {
			extensions = [];
		}
		extensions.push(extension);
		if (!Runtime.extensionPoints[id]) { Runtime.extensionPoints[id] = []; }
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
		
		window.document.body.innerHTML = "<div><h1>Problem connecting to the Maqetta Server...</h1></div><div><center><h1><a href='"+ redirectUrl + "'>Return to Maqetta Login</a></h1></center></div><br><br><div><h2>Error description:</h2>" + error + "</div>" // TODO: i18n
	},

	_loadCSS: function(plugin,pluginURL) {
		pluginURL=pluginURL.split('/');
		var cssURL=plugin.css.split('/');
		pluginURL.pop(); //remove plugin name
		cssURL=pluginURL.concat(cssURL).join('/');
		var headID = dojo.doc.getElementsByTagName("head")[0];         
		var cssNode = dojo.doc.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = cssURL;
		headID.appendChild(cssNode);
	},
		
	executeCommand: function (cmdID) {
		var cmd=Runtime.getExtension("davinci.commands", cmdID);
		if (cmd && cmd.run) {
			cmd.run();
		}
	},
	
	_selectionChanged: function (selection) {
		Runtime.currentSelection=selection;
	},
	
	getSelection: function () {
		return Runtime.currentSelection;
	},


	doLogin: function(){

		var retry=true;
		var formHtml = "<table>" +
        "<tr><td><label for=\"username\">User: </label></td>" +
        "<td><input dojoType=\dijit.form.TextBox\ type=\"text\" name=\"username\" id='username' ></input></td></tr>" +
        "<tr><td><label for=\"password\">Password: </label></td> <td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"password\" id='password'></input></td></tr>" +
        "<tr><td colspan=\"2\" align=\"center\"><button dojoType=dijit.form.Button type=\"submit\" >Login</button></td>" +
        "</tr></table>"; // FIXME: i18n
		do {
			var isInput=false;
			var	dialog = new Dialog({id: "connectDialog", title:"Please login", 
				onExecute:function(){
					dojo.xhrGet({url:"cmd/login",sync:true,handleAs:"text",
						content:{'userName':dojo.byId("username").value, 'password': dojo.byId("password").value, 'noRedirect':true}
					}).then(function(result){
			            if (result=="OK")
			            {
			            	// cheap fix.
			            	//window.location.reload();
			            	window.location.href= 'welcome';
			            	//retry=false;
			            } else {
			            	console.warn("Unknown error: result="+result);
			            }
					}, function(error){
						console.warn("Login error", error);
					});
				    isInput=true;
				},
				onCancel:function(){isInput=true;Runtime.destroyRecursive(false);}
			});	
			dialog.setContent(formHtml);
			dialog.show();
//TODO: find a way to wait here (instead of alert)
			//alert("must log in");
			
		} while (retry);
		

	},
	
	serverJSONRequest: function (ioArgs) {
		var resultObj;
		var args={handleAs:"json" };
		dojo.mixin(args, ioArgs);
		var userOnError=ioArgs.error;
		var retry = false;
		function onError(response, ioArgs) {
			if (response.status==401) {
//				Runtime.doLogin();
//				retry=true;
				//window.location.reload();
				window.location.href= 'welcome';
			} else if (response.status==400) {
				Runtime.handleError("unknown error: status="+ response.status);
			} else if (userOnError) {
				userOnError(response, ioArgs);
			} else {
				Runtime.handleError("unknown error: status="+ response.status);
				//console.warn("unknown error: status="+response.status);
			}
		}
		args.error=onError;
			    
			 do {
			 	dojo.xhrGet(args).then(function(result){
			 	if (result) {
			 		resultObj=result;
			 	}
			 	}, function(error) {
		 		Runtime.handleError(error);
			 	});
			 } while (retry);	

		return resultObj;
	},

	logoff: function(args) {
		var loading = dojo.create("div",null, dojo.body(), "first");
		loading.innerHTML='<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Logging off...</td></tr></table>'; // FIXME: i18n
		dojo.addClass(loading, 'loading');
		Runtime.unload();
		Runtime.serverJSONRequest({
			url:"cmd/logoff", handleAs:"text", sync:true
		});
		var newLocation = davinci.Workbench.location(); //
		var lastChar=newLocation.length-1;
		if (newLocation.charAt(lastChar)=='/') {
			newLocation=newLocation.substr(0,lastChar);
		}
		location.href = newLocation+"/welcome";
	}
};

davinci.Runtime = Runtime; //FIXME: shouldn't need this
return Runtime;
});
