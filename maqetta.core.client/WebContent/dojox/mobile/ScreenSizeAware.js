define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom",
	"dijit/registry"
], function(kernel, array, config, connect, declare, lang, win, dom, registry){

	// module:
	//		dojox/mobile/ScreenSizeAware
	// summary:
	//		A module to make a screen size aware application.

	kernel.experimental("dojox.mobile.ScreenSizeAware"); // should consider support for other UI layout patterns

	var cls = declare("dojox.mobile.ScreenSizeAware", null, {
		// summary:
		//		A module to make a screen size aware application.
		// description:
		//		This module helps you create an application that transforms its
		//		UI layout according to the screen size. It assumes that the
		//		application consists of two horizontally split panes, and the
		//		left pane has a list widget. If you place this module in such an
		//		application, the application is rendered in split view when the
		//		screen size is detected as tablet size, while it is rendered in
		//		single view layout when the screen size is detected as phone size.
		//
		// example:
		// |	<span data-dojo-type="dojox.mobile.ScreenSizeAware"></span>
		// |	<div data-dojo-type="dojox.mobile.FixedSplitter" data-dojo-props='orientation:"H"'>
		// |	  <div data-dojo-type="dojox.mobile.Container" style="width:300px;">
		// |	    <div id="leftView" data-dojo-type="dojox.mobile.ScrollableView">
		// |	      <h1 data-dojo-type="dojox.mobile.Heading" data-dojo-props='fixed:"top"'>Left Pane</h1>
		// |	      <ul data-dojo-type="dojox.mobile.EdgeToEdgeList" data-dojo-props='stateful:true'>
		// |	        <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props='label:"View1", moveTo:"view1"'></li>
		// |	        ....
		// |	      </ul>
		// |	    </div>
		// |	  </div>
		// |	  <div data-dojo-type="dojox.mobile.Container">
		// |	    <div id="view1" data-dojo-type="dojox.mobile.ScrollableView">
		// |	      <h1 data-dojo-type="dojox.mobile.Heading" data-dojo-props='fixed:"top", back:"Home", moveTo:"leftView"'>Right Pane</h1>
		// |	      ....
		// |	    </div>
		// |	  </div>
		// |	</div>

		// splitterId: String
		//		The id of the FixedSplitter.
		splitterId: "",

		// leftPaneId: String
		//		The id of the left pane.
		leftPaneId: "",

		// rightPaneId: String
		//		The id of the right pane.
		rightPaneId: "",

		// leftViewId: String
		//		The id of the left View.
		leftViewId: "",

		// leftListId: String
		//		The id of the list widget in the left view.
		leftListId: "",

		constructor: function(options){
			if (options){
				lang.mixin(this, options);
			}
			connect.subscribe("/dojox/mobile/screenSize/tablet", this, function(dim){
				this.transformUI("tablet");
			});
			connect.subscribe("/dojox/mobile/screenSize/phone", this, function(dim){
				this.transformUI("phone");
			});
		},

		init: function(){
			if(this._initialized){ return; }
			this._initialized = true;

			// analyze the page structure
			this.splitter = this.splitterId ? registry.byId(this.splitterId) :
				array.filter(registry.findWidgets(win.body()),
					function(c){ return c.declaredClass.indexOf("Splitter") !== -1; })[0];
			if(!this.splitter){
				console.error("Splitter not found.");
				return;
			}

			this.leftPane = this.leftPaneId ? registry.byId(this.leftPaneId) :
				this.splitter.getChildren()[0];
			if(!this.leftPane){
				console.error("Left pane not found.");
				return;
			}

			this.rightPane = this.rightPaneId ? registry.byId(this.rightPaneId) :
				this.splitter.getChildren()[1];
			if(!this.rightPane){
				console.error("Right pane not found.");
				return;
			}

			this.leftView = this.leftViewId ? registry.byId(this.leftViewId) :
				array.filter(registry.findWidgets(this.leftPane.containerNode),
					function(c){ return c.declaredClass.indexOf("View") !== -1; })[0];
			if(!this.leftView){
				console.error("Left view not found.");
				return;
			}

			this.leftList = this.leftListId ? registry.byId(this.leftListId) :
				array.filter(registry.findWidgets(this.leftView.containerNode),
					function(c){ return c.declaredClass.indexOf("List") !== -1 ||
								 c.declaredClass.indexOf("IconContainer") !== -1; })[0];
			if(!this.leftList){
				console.error("Left list not found.");
				return;
			}
		},

		isPhone: function(){
			return this._currentMode === "phone";
		},

		getShowingView: function(){
			var firstView =
				array.filter(this.rightPane.getChildren(), function(c){ return c.declaredClass.indexOf("View") !== -1; })[0];
			if(!firstView){ return null; }
			return firstView.getShowingView() ||
				array.filter(this.rightPane.getChildren(), function(c){ return c.selected; })[0] ||
				firstView;
		},

		updateStateful: function(){
			this.leftList.set("stateful", !this.isPhone());
		},

		getDestinationId: function(item){
			return item.moveTo;
		},

		updateBackButton: function(){
			array.forEach(this.leftList.getChildren(), function(item){
				var id = this.getDestinationId(item);
				var view = registry.byId(id);
				if(view){
					var heading = array.filter(view.getChildren(), function(c){ return c.declaredClass.indexOf("Heading") !== -1; })[0];
					if(heading.backButton){
						heading.backButton.domNode.style.display = this.isPhone() ? "" : "none";
					}
					if(heading.backBtnNode){ // TODO: remove this block later
						heading.backBtnNode.style.display = this.isPhone() ? "" : "none";
					}
				}
			}, this);
		},

		updateTransition: function(){
			var transition = this.isPhone() ? "slide" : "none";
			array.forEach(this.leftList.getChildren(), function(item){
				item.set("transition", transition);
			});
		},

		moveList: function(){
			var to = this.isPhone() ? this.rightPane: this.leftPane;
			to.containerNode.appendChild(this.leftView.domNode);
		},

		showLeftView: function(){
			this.leftPane.domNode.style.display = this.isPhone() ? "none" : "";
			this.leftView.show();
		},

		showRightView: function(){
			if(this.isPhone()){ return; }
			var view = this.getShowingView();
			if(view){
				view.show();
			}else{
				this.leftItemSelected();
			}
		},

		updateSelectedItem: function(){
			var id;
			var view = this.getShowingView();
			if(view && !this.isPhone()){
				id = view.id;
			}
			if(id){
				var items = array.filter(this.leftList.getChildren(),
					function(item){ return this.getDestinationId(item) === id; }, this);
				if(items && items.length > 0){
					items[0].set("selected", true);
				}
			}else{
				this.leftList.deselectAll && this.leftList.deselectAll();
			}
		},

		leftItemSelected: function(e){
		},

		transformUI: function(mode){
			this.init();
			if(mode === this._currentMode){ return; }
			this._currentMode = mode;
			this.updateStateful();
			this.updateBackButton();
			this.updateTransition();
			this.moveList();
			this.showLeftView();
			this.showRightView();
			this.updateSelectedItem();
		}
	});

	cls._instance = null;
	cls.getInstance = function(){
		if(!cls._instance){
			cls._instance = new cls();
		}
		return cls._instance;
	};

	return cls;
});
