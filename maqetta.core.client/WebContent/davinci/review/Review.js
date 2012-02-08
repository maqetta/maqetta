define([
	"dojo/_base/lang",
	"davinci/Runtime",
//	"davinci/Workbench",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer"
], function(lang, Runtime, /*Workbench,*/ BorderContainer, ContentPane, TabContainer) {

davinci.review = {};

var Review = davinci.review.Review = lang.mixin(davinci.Workbench, {

	
	/* casues bugs #1661 1646 and 1626. TODO: @waynevicknair: refactor this in Review editor in tab changes. */
//	_updateWorkbenchState: function() {
//		//override for NOOP
//	},

	runComment: function() {
		this._initKeys();
		this._baseTitle = dojo.doc.title;
		var perspective = Runtime.initialPerspective || "davinci.review.comment";
		var mainBody = dojo.byId('mainBody');
		var location = davinci.Workbench.location().match(/http:\/\/.*:\d+\//);
		mainBody.editorsWelcomePage =
			new ContentPane({
				id : "editorsWelcomePage",
				href: location + "maqetta/app/davinci/review/resources/welcome_to_maqetta.html"
			});
		this.showPerspective(perspective);
		Runtime.subscribe("/davinci/ui/editorSelected", davinci.Workbench._updateMainToolBar );
		Runtime.subscribe("/davinci/resource/resourceChanged", this._resourceChanged );
		this._state={editors:[]};
	},

	//FIXME: workaround - set minSize before adding child to the borderContainer
	showView: function(viewId, shouldFocus) {
		try {

			var mainBodyContainer = dijit.byId('mainBody'),
			view = Runtime.getExtension("davinci.view", viewId),
			mainBody = dojo.byId('mainBody'),
			perspectiveId = davinci.Workbench.getActivePerspective(),
			perspective = Runtime.getExtension("davinci.perspective",	perspectiveId),
			position = 'left',
			cp1 = null;

			dojo.some(perspective.views, function(view) {
				if (view.viewID ==  viewId) {
					position = view.position;
					return true;
				}	
			});

			mainBody.tabs = mainBody.tabs || {};				
			mainBody.tabs.perspective = mainBody.tabs.perspective || {};

			if (position == 'right' && !mainBody.tabs.perspective.right) {
				mainBodyContainer.addChild(mainBody.tabs.perspective.right = new BorderContainer({
					'class':'davinciPaletteContainer', 
					style: 'width: 275px;', 
					id:"right_mainBody", 
					region:'right', 
					gutters: false, 
					splitter:true
				}));
				mainBody.tabs.perspective.right.startup();
				mainBody.tabs.perspective.right.set("minSize", 325);
			}

			if (position == 'left' && !mainBody.tabs.perspective.left) {
				mainBodyContainer.addChild(mainBody.tabs.perspective.left = new BorderContainer({
					'class':'davinciPaletteContainer', 
					style: 'width: 200px;', 
					id:"left_mainBody", 
					region:'left', 
					gutters: false, 
					splitter:true
				}));
				mainBody.tabs.perspective.left.startup();
			}

			if (position == 'left' || position == 'right') { position += "-top"; }
			var positionSplit = position;

			if (!mainBody.tabs.perspective[position]) {
				positionSplit = position.split('-');

				var region = positionSplit[0],
				parent = mainBodyContainer,
				clazz = '',
				style = '';
				if (positionSplit[1] && (region == 'left' || region == 'right')) {
					parent = mainBody.tabs.perspective[region];
					region = positionSplit[1];
					if (positionSplit[1] == "top") {
						region = "center";
						clazz = "davinciTopPalette";
					} else {
						style = 'height:35%;';
						clazz = "davinciBottomPalette";
					}
				} else if(region == 'bottom') {
					style = 'height:80px;';
					clazz = "davinciBottomPalette";
				}
				cp1 = mainBody.tabs.perspective[position] = new TabContainer({
					region: region,
					'class': clazz,
					style: style,
					splitter: region != "center",
					controllerWidget: "dijit.layout.ScrollingTabController"
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
				if (view.viewClass) {
					dojo["require"](view.viewClass);
					viewClass = dojo.getObject(view.viewClass);
				} else {
					viewClass = ViewPart;
				}
				var tab = new viewClass( {
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
			console.error("Error loading view " + view.id);
			console.error(ex);
		}
	}
});

return Review;

});
