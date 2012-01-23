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

    _updateWorkbenchState: function() {
        
    },

    runComment: function() {
        this._initKeys();
        this._baseTitle=dojo.doc.title;
        var perspective= davinci.Runtime.initialPerspective || "davinci.review.comment";
        var mainBody = dojo.byId('mainBody');
        var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
        mainBody.editorsWelcomePage =
            new dijit.layout.ContentPane({
                        id : "editorsWelcomePage",
                        href: location + "maqetta/app/davinci/review/resources/welcome_to_maqetta.html"
                    });
        this.showPerspective(perspective);
        davinci.Runtime.subscribe("/davinci/ui/editorSelected",davinci.Workbench._updateMainToolBar );
        davinci.Runtime.subscribe("/davinci/resource/resourceChanged",this._resourceChanged );
        this._state={editors:[]};
    },
    //FIXME: walk around of set the minSize before add child into the borderContainer
    showView: function(viewId, shouldFocus) {
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

    		dojo.some(perspective.views, function(view) {
    			if (view.viewID ==  viewId) {
    				position = view.position;
    				return true;
    			}	
    		});

    		mainBody.tabs = mainBody.tabs || {};				
    		mainBody.tabs.perspective = mainBody.tabs.perspective || {};

    		if (position == 'right' && !mainBody.tabs.perspective.right) {
    			mainBodyContainer.addChild(mainBody.tabs.perspective.right =
    				new dijit.layout.BorderContainer({
    					'class': 'davinciPaletteContainer',
    					style: 'width: 350px;',
    					id: "right_mainBody",
    					region: 'right',
    					gutters: false,
    					splitter: true
    				}));
    			mainBody.tabs.perspective.right.startup();
    			mainBody.tabs.perspective.right.set("minSize", 325);
    		}

    		if (position == 'left' && !mainBody.tabs.perspective.left) {
    			mainBodyContainer.addChild(mainBody.tabs.perspective.left =
    				new dijit.layout.BorderContainer({
    					'class': 'davinciPaletteContainer',
    					style: 'width: 200px;',
    					id: "left_mainBody",
    					region: 'left',
    					gutters: false,
    					splitter: true
    				}));
    			mainBody.tabs.perspective.left.startup();
    		}

    		if (position == 'left' || position == 'right') { position += "-top"; }
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
    		if (shouldFocus) { cp1.selectChild(tab); }
    	} catch (ex) {
    		console.error("error loading view "+view.id);
    		console.error(ex);
    	}
    }
});
