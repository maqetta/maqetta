dojo.provide("davinci.review.Review");

dojo.require("davinci.Workbench");
//dojo.require("davinci.review.editor.CommentingEditorContainer");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("davinci.Runtime");
dojo.require("dojox.widget.Standby");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.Dialog");

dojo.mixin(davinci.Workbench, {

	_updateWorkbenchState: function(){
		
	},

	runComment: function(){
		this._initKeys();
		this._baseTitle=dojo.doc.title;
		var perspective= davinci.Runtime.initialPerspective || "davinci.review.comment";
		var mainBody = dojo.byId('mainBody');
		mainBody.editorsWelcomePage =
			new dijit.layout.ContentPane(
					{
						id : "editorsWelcomePage",
						href: "app/davinci/review/resources/welcome_to_maqetta.html"
//						content: "<div><span id='welcome_page_new_open_container'/></div>\n"+
//							"<div id='welcome_page_content'>\n"+
//							"<h1>Welcome to Maqetta Review Board!</h1>\n"+
//							"<p>You can get started by using the menus at the top/right:</p>\n"+
//							"<ul class='welcome_page_bullets'>\n"+
//							"<li>Click on <img src='app/davinci/img/help_menu_image.png'/> for tutorials.</li>\n"+
//							"</ul>\n"+
//							"</div>\n"
					});
		this.showPerspective(perspective);
		davinci.Runtime.subscribe("/davinci/ui/editorSelected",davinci.Workbench._updateMainToolBar );
		davinci.Runtime.subscribe("/davinci/resource/resourceChanged",this._resourceChanged );
		this._state={editors:[]};
	},
	//FIXME: walk around of set the minSize before add child into the borderContainer
	showView: function(viewId, shouldFocus){
		try {
			
		var mainBodyContainer = dijit.byId('mainBody'),
			view = davinci.Runtime.getExtension("davinci.view", viewId),
			mainBody = dojo.byId('mainBody'),
			perspectiveId = this.getActivePerspective(),
			perspective = davinci.Runtime.getExtension("davinci.perspective",	perspectiveId),
			position = 'left',
			cp1 = null,
			created = false,
			pxHeight = this._getPageHeight() - 5;
		
		dojo.some(perspective.views, function(view){
			if(view.viewID ==  viewId){
				position = view.position;
				return true;
			}	
		});
		
		mainBody.tabs = mainBody.tabs || {};				
		mainBody.tabs.perspective = mainBody.tabs.perspective || {};

		if(position == 'right' && !mainBody.tabs.perspective.right){
			mainBodyContainer.addChild(mainBody.tabs.perspective.right = new dijit.layout.BorderContainer({'class':'davinciPaletteContainer', style: 'width: 350px;', id:"right_mainBody", region:'right', gutters: false, splitter:true}));
			mainBody.tabs.perspective.right.startup();
			mainBody.tabs.perspective.right.set("minSize",325);
		}

		if(position == 'left' && !mainBody.tabs.perspective.left){
			mainBodyContainer.addChild(mainBody.tabs.perspective.left = new dijit.layout.BorderContainer({'class':'davinciPaletteContainer', style: 'width: 200px;', id:"left_mainBody", region:'left', gutters: false, splitter:true}));
			mainBody.tabs.perspective.left.startup();
		}

		if(position == 'left' || position == 'right') position += "-top";
		var positionSplit = position;

		if (!mainBody.tabs.perspective[position]) {
			positionSplit = position.split('-');

			var region = positionSplit[0],
				parent = mainBodyContainer,
				style = '';
			if (positionSplit[1] && (region == 'left' || region == 'right')) {
				parent = mainBody.tabs.perspective[region];
				region = positionSplit[1];
				if (positionSplit[1] == "top") {
					region = "center";
				} else {
					style = 'height:35%;';
				}
			} else if(region == 'bottom') {
				style = 'height:80px;';
			}
			cp1 = mainBody.tabs.perspective[position] = new dijit.layout.TabContainer({
				region: region,
				style: style,
				splitter: region != "center",
				controllerWidget: "dijit.layout.TabController"
			});
			parent.addChild(cp1);
		} else {
			cp1 = mainBody.tabs.perspective[position];
		}

		if (dojo.some(cp1.getChildren(), function(child){ return child.id == view.id; })) {
			return;
		}

		var tab = dijit.byId(view.id);
		if (!tab) {
				var viewClass;
				if (view.viewClass){
					dojo["require"](view.viewClass);
					viewClass = dojo.getObject(view.viewClass);
				}
				else
					viewClass =   davinci.workbench.ViewPart;
				tab = new viewClass( {
					position: positionSplit[1] || positionSplit[0],
					title: view.title,
					id: view.id,
					closable: true,
					view: view
				});
		}
			
		cp1.addChild(tab);
		if(shouldFocus) cp1.selectChild(tab);
	  } catch (ex) {
	  	console.error("error loading view "+view.id);
		console.error(ex);
	  }
	}
});



dojo.mixin(davinci.Runtime, {
	// summary:
	// Customize davinci.Runtime so that all the XHR request URL is absolute
	// This could avoid URL redirecting.
	

	
	doLogin: function(){
		
		//var retry=true;
		var formHtml = "<table>" +
		"<tr><div id='review_login_result'/></tr>"+
        "<tr><td><label for=\"username\">User: </label></td>" +
        "<td><input dojoType=\"dijit.form.TextBox\" type=\"text\" name=\"username\" id='username' tabindex='1'></input></td></tr>" +
        "<tr><td><label for=\"password\">Password: </label></td> <td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"password\" id='password' tabindex='2'></input></td></tr>" +
        "<tr><td colspan=\"2\" align=\"center\"><button dojoType=dijit.form.Button type=\"button\" onClick=\"dijit.byId('connectDialog').login();\" tabindex='3'>Login</button></td>" +
        "</tr></table>";
		
			var isInput=false;
			var	dialog = new dijit.Dialog({id: "connectDialog", closable: true, title:"Please login", 
				login:function(){
					dojo.xhrGet({url:"./cmd/login",sync:true,handleAs:"text",
						error:function(e){
							dojo.byId("review_login_result").innerHTML="Invalid userid or password!";
							dojo.style("review_login_result","color","red");
					},
						content:{'userName':dojo.byId("username").value, 
							'password': dojo.byId("password").value, 
							'noRedirect':true,
							
							designerName:davinci.Runtime.commenting_designerName}
					}).then(function(result){
			            if (result=="OK")
			            {
			            	// cheap fix.
			            	window.location.reload();
			            	//retry=false;
			            }
			            
					});
				    isInput=true;
				},
				onCancel:function(){}
			});	
			dialog.setContent(formHtml);		
			dialog.show();
			dojo.connect(dojo.byId("password"),"onkeypress",function(e){
				if(e.keyCode==13)
					dijit.byId("connectDialog").login();
			});
	},
	serverJSONRequest : function (ioArgs)
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
				
				davinci.Runtime.doLogin();
				retry=false;
				return;
			}
			else if (response.status==400)
			{
				debugger;
			}
			else if (userOnError)
				userOnError(response, ioArgs);
		}
		args.error=onError;
			    
			 do {
			 	dojo.xhrGet(args).then(function(result){
			 	if (result)
			 	{
			 		resultObj=result;
			 	}
			 	});
			 } while (retry);	
		return resultObj;
	}
});

