dojo.provide("davinci.Runtime");

dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("davinci.Workbench");
dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.metadata");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci", "webContent");

dojo.declare("davinci.Runtime", null, {});

dojo.mixin(davinci.Runtime,	{
	plugins: [],
	extensionPoints: [],
	subscriptions: [],
	widgetTable: {},
	
	_DEFAULT_PROJECT: "project1",
	
	currentSelection: [],
	commandStack: new davinci.commands.CommandStack(),
	clipboard: null,
	
	addPlugin: function(pluginName) {
		url = pluginName + "_plugin.js";
		dojo.xhrGet( {
			// The following URL must match that used to test
			// the server.
			url:url,
			handleAs:"json",
			sync:true,
			load: function(responseObject, ioArgs) {
				davinci.Runtime._loadPlugin(responseObject,url);
			},
			error: function(response, ioArgs) {
				if (response.status==401)
				{
//					davinci.Runtime.doLogin();
//					retry=true;
					window.location.reload();
				} else {
					var langObj = dojo.i18n.getLocalization("davinci","webContent");
					davinci.Runtime.handleError(dojo.string.substitute(langObj.errorLoadingPlugin, [pluginName, response]));
				}
			}
		});
	},

	getUser : function(){
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
			   davinci.Runtime._loadPlugins(responseObject);
			},
			error: function(response, ioArgs) {
				if (response.status==401)
				{
//					davinci.Runtime.doLogin();
//					retry=true;
					//window.location.reload();
					window.location.href= 'welcome';
				}else{
					var langObj = dojo.i18n.getLocalization("davinci","webContent");
					davinci.Runtime.handleError(langObj.errorLoadingPlugins);
				}
			}
		});
	},
	
	_loadPlugins: function(plugins) {
		for (var i=0;i<plugins.length;i+=2)
		{
			var url=plugins[i];
			var plugin=plugins[i+1];
			this._loadPlugin(plugin, url);
		}
	},
	/*
	 * running in single project mode or mulit project mode
	 */
	singleProjectMode: function(){
		return true;
	},
	
	
	/*
	 * If in single user mode, returns the current active project.
	 * 
	 */
	
	getProject: function(){
		var params = davinci.Workbench.queryParams();
		if(params.project) {
			return decodeURI(params.project);
		}
		
		return davinci.Runtime._DEFAULT_PROJECT;
	},
	
	loadProject: function(projectName){

		var params = davinci.Workbench.queryParams();
		params.project = encodeURI(projectName);
		
		window.location.href=davinci.Workbench.location() + "?" + dojo.objectToQuery(params);
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
	    davinci.Runtime.supportsCSS3Transitions = thisStyle.WebkitTransition !== undefined ||
	        thisStyle.MozTransition !== undefined ||
	        thisStyle.OTransition !== undefined ||
	        thisStyle.transition !== undefined;
		davinci.ve.metadata.init();
		this.subscribe("/davinci/ui/selectionChanged",davinci.Runtime._selectionChanged );
		davinci.Workbench.run();
		// intercept BS key - prompt user before navigating backwards
		dojo.connect(dojo.doc.documentElement, "onkeypress", function(e){
			if(e.charOrCode==8){
				window.davinciBackspaceKeyTime = new Date().getTime();
			}
		});	
		window.onbeforeunload = function (e) {
			var shouldDisplay = new Date().getTime() - window.davinciBackspaceKeyTime < 100;
			if (shouldDisplay) {
				var langObj = dojo.i18n.getLocalization("davinci","webContent");
				var message = langObj.careful;
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
	
	unload: function ()
	{
		davinci.Workbench.unload();
	},
	subscribe: function(topic,func)
	{
		this.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	destroy: function ()
	{
		dojo.forEach(this.subscriptions, dojo.unsubscribe);
	},
	_loadPlugin: function(plugin,url) {
		
		var pluginID = plugin.id;
		this.plugins[pluginID]= plugin;
		if (plugin.css)
			this._loadCSS(plugin,url);
		for (var id in plugin) {
			var extension = plugin[id];
			if (typeof (extension) != "string") {
				if (extension instanceof Array) {
					for ( var i = 0, len = extension.length; i < len; i++) {
						this._addExtension(id, extension[i], pluginID);
					}
				} else {
					this._addExtension(id, extension, pluginID);
				}
			}
		}
	},
	
	_addExtension: function(id, extension, pluginID) {
		
		if (extension.id)
			extension.id = pluginID + "." + extension.id;
		var extensions = this.extensionPoints[id];
		if (extensions == null)
			extensions = [];
		extensions.push(extension);
		if(!this.extensionPoints[id]) this.extensionPoints[id] = [];
		this.extensionPoints[id] = extensions;
	},
	
	getExtensions: function(extensionID, testFunction) {
		
		var extensions = this.extensionPoints[extensionID];
		if (testFunction) {
			var matching=[];
			var isFunction = testFunction instanceof Function;
			if (extensions)
				for ( var i = 0, len = extensions.length; i < len; i++)
					if (isFunction)
					{
						if (testFunction(extensions[i]))
							matching.push(extensions[i]);
					}
					else if (extensions[i].id == testFunction)
						matching.push(extensions[i]);
			return matching;
		} else
			return extensions;
	},
	
	getExtension: function(extensionID, testFunction) {
		var extensions = this.extensionPoints[extensionID];
		if (testFunction) {
			var isFunction = testFunction instanceof Function;
			if (extensions)
				for ( var i = 0, len = extensions.length; i < len; i++)
					if (isFunction)
					{
						if (testFunction(extensions[i]))
							return extensions[i];
					}
					else if (extensions[i].id == testFunction)
						return extensions[i];
			return null;
		} else {
			return extensions[0];
		}
	},
	
	
	
	handleError: function(error) {
		alert(error);
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
		
	executeCommand: function (cmdID)
	{
		var cmd=this.getExtension("davinci.commands", cmdID);
		if (cmd && cmd.run)
		{
			cmd.run();
		}
	},
	
	_selectionChanged: function (selection)
	{
		this.currentSelection=selection;
	},
	
	getSelection: function ()
	{
		return this.currentSelection;
	},


	doLogin: function(){

		var retry=true;
		var formHtml = "<table>" +
        "<tr><td><label for=\"username\">User: </label></td>" +
        "<td><input dojoType=\dijit.form.TextBox\ type=\"text\" name=\"username\" id='username' ></input></td></tr>" +
        "<tr><td><label for=\"password\">Password: </label></td> <td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"password\" id='password'></input></td></tr>" +
        "<tr><td colspan=\"2\" align=\"center\"><button dojoType=dijit.form.Button type=\"submit\" >Login</button></td>" +
        "</tr></table>";
		do {
			var isInput=false;
			var	dialog = new dijit.Dialog({id: "connectDialog", title:"Please login", 
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
				onCancel:function(){isInput=true;this.destroyRecursive(false);}
			});	
			dialog.setContent(formHtml);
			dialog.show();
//TODO: find a way to wait here (instead of alert)
			//alert("must log in");
			
		} while (retry);
		

	},
	
	serverJSONRequest: function (ioArgs)
	{
		var resultObj;
		var args={handleAs:"json" };
		dojo.mixin(args, ioArgs);
		var userOnError=ioArgs.error;
		var retry = false;
		function onError(response, ioArgs)
		{
			if (response.status==401)
			{
//				davinci.Runtime.doLogin();
//				retry=true;
				//window.location.reload();
				window.location.href= 'welcome';
			}
			else if (response.status==400)
			{
				console.warn("unknown error: status="+response.status);
			}
			else if (userOnError)
			{
				userOnError(response, ioArgs);
			}
			else
			{
				console.warn("unknown error: status="+response.status);
			}
		}
		args.error=onError;
			    
			 do {
			 	dojo.xhrGet(args).then(function(result){
			 	if (result)
			 	{
			 		resultObj=result;
			 	}
			 	}, function(error) {
			 		console.warn("unknown error: result ="+result);
			 	});
			 } while (retry);	

		return resultObj;
	},
	serverPut: function(args)
	{
		dojo.xhrPut(args);	
	},
	logoff: function(args)
	{
		var loading = dojo.create("div",null, dojo.body(), "first");
		loading.innerHTML='<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;Logging off...</td></tr></table>';
		dojo.addClass(loading, 'loading');
		this.unload();
		davinci.Runtime.serverJSONRequest({
			   url:"cmd/logoff", handleAs:"text",
				   sync:true  });
		var newLocation = davinci.Workbench.location(); //
		var lastChar=newLocation.length-1;
		if (newLocation.charAt(lastChar)=='/')
			newLocation=newLocation.substr(0,lastChar);
		location.href = newLocation+"/welcome";
	},	
	arrayRemove: function (array,item)
	{
		array.splice(dojo.indexOf(array,item),1);
	},
	arrayAddOnce: function(array,item)
	{
		if (dojo.indexOf(array,item)==-1){
			array.push(item);
		}
	}
});

davinci.isMac = dojo.isMac; //FIXME: remove
