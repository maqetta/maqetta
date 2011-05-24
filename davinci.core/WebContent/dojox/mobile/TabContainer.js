dojo.provide("dojox.mobile.TabContainer");

dojo.require("dojox.mobile");

// Deprecated. Use dojox.mobile.TabBar instead.
dojo.declare(
	"dojox.mobile.TabContainer",
	dijit._WidgetBase,
{
	iconBase: "",
	iconPos: "",
	fixedHeader: false,

	constructor: function(){
		dojo.deprecated("dojox.mobile.TabContainer is deprecated", "use dojox.mobile.TabBar instead", 2.0);
	},

	buildRendering: function(){
		var node = this.domNode = this.srcNodeRef;
		node.className = "mblTabContainer";
		var headerNode = this.tabHeaderNode = dojo.doc.createElement("DIV");
		var paneNode = this.containerNode = dojo.doc.createElement("DIV");

		// reparent
		for(var i = 0, len = node.childNodes.length; i < len; i++){
			paneNode.appendChild(node.removeChild(node.firstChild));
		}

		headerNode.className = "mblTabPanelHeader";
		headerNode.align = "center";
		if(this.fixedHeader){
			var view = dijit.getEnclosingWidget(this.domNode.parentNode); // parentNode is null if created programmatically
			view.domNode.insertBefore(headerNode, view.domNode.firstChild);
			dojo.style(headerNode, {
				position: "absolute",
				width: "100%",
				top: "0px",
				zIndex: "1"
			});
			view.fixedHeader = headerNode;
		}else{
			node.appendChild(headerNode);
		}
		paneNode.className = "mblTabPanelPane";
		node.appendChild(paneNode);
	},

	startup: function(){
		this.createTabButtons();
		this.inherited(arguments);
	},

	createTabButtons: function(){
		var div = dojo.doc.createElement("DIV");
		div.align = "center";
		var tbl = dojo.doc.createElement("TABLE");
		var cell = tbl.insertRow(-1).insertCell(-1);
		var children = this.containerNode.childNodes;
		for(var i = 0; i < children.length; i++){
			var pane = children[i];
			if(pane.nodeType != 1){ continue; }
			var widget = dijit.byNode(pane);
			if(widget.selected || !this._selectedPane){
				this._selectedPane = widget;
			}
			pane.style.display = "none";
			var tab = dojo.doc.createElement("DIV");
			tab.className = "mblTabButton";
			if(widget.icon){
				var imgDiv = dojo.create("DIV");
				var img = dojo.create("IMG");
				imgDiv.className = "mblTabButtonImgDiv";
				img.src = widget.icon;
				dojox.mobile.setupIcon(img, widget.iconPos);
				imgDiv.appendChild(img);
				tab.appendChild(imgDiv);
			}
			tab.appendChild(dojo.doc.createTextNode(widget.label));
			tab.pane = widget;
			widget.tab = tab;
			this.connect(tab, "onclick", "onTabClick");
			cell.appendChild(tab);
		}
		div.appendChild(tbl);
		this.tabHeaderNode.appendChild(div);
		this.selectTab(this._selectedPane.tab);
	},

	selectTab: function(/*DomNode*/tab){
		this._selectedPane.domNode.style.display = "none";
		dojo.removeClass(this._selectedPane.tab, "mblTabButtonSelected");
		this._selectedPane = tab.pane;
		this._selectedPane.domNode.style.display = "";
		dojo.addClass(tab, "mblTabButtonSelected");
		if(dojo.isBB){
			var ref = tab.nextSibling;
			tab.parentNode.insertBefore(tab.parentNode.removeChild(tab), ref);
		}
		var view = dijit.getEnclosingWidget(this.domNode.parentNode);
		if(this.fixedHeader){
			// This widget stacks multiple panes and controls their visibility.
			// Each pane cannot have its own scroll position status, because
			// the entire widget scrolls.
			// When in the fixedHeader mode, the user can always select a tab
			// even when the current pane is scrolled down to the bottom.
			// Even in such cases, the next page should be shown from the top.
			if(view && view.scrollTo){
				view.scrollTo({y:0});
			}
		}
		view.flashScrollBar && view.flashScrollBar();
	},

	onTabClick: function(e){
		var tab = e.currentTarget;
		dojo.addClass(tab, "mblTabButtonHighlighted");
		setTimeout(function(){
			dojo.removeClass(tab, "mblTabButtonHighlighted");
		}, 200);
		this.selectTab(tab);
	}
});

dojo.declare(
	"dojox.mobile.TabPane",
	dijit._WidgetBase,
{
	label: "",
	icon: "",
	iconPos: "",
	selected: false,

	inheritParams: function(){
		var parent = this.getParentWidget();
		if(parent){
			if(!this.icon){ this.icon = parent.iconBase; }
			if(!this.iconPos){ this.iconPos = parent.iconPos; }
		}
	},

	buildRendering: function(){
		this.inheritParams();
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblTabPane";
	},

	getParentWidget: function(){
		var ref = this.srcNodeRef || this.domNode;
		return ref && ref.parentNode ? dijit.getEnclosingWidget(ref.parentNode) : null;
	}
});
