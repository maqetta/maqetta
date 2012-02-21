define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/review/model/ReviewTreeModel",
	"davinci/Workbench",
	"davinci/workbench/ViewPart",
	"davinci/ui/widgets/ToggleTree",
	"davinci/review/model/Resource",
	"dojo/date/locale",
	"davinci/review/actions/CloseVersionAction",
	"davinci/review/actions/EditVersionAction",
	"davinci/review/actions/OpenVersionAction",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dijit/form/Button",
	"dijit/form/TextBox",
    "dojo/i18n!./nls/view",
    "dojo/i18n!../widgets/nls/widgets"
], function(declare, Runtime, ReviewTreeModel, Workbench, ViewPart, ToggleTree, Resource, locale, CloseVersionAction,
		EditVersionAction, OpenVersionAction, Toolbar, ToolbarSeparator, Button, TextBox, viewNls, widgetsNls) {

return declare("davinci.review.view.CommentExplorerView", ViewPart, {

	postCreate: function() {
		this.inherited(arguments);

		var model= new ReviewTreeModel();
		this.model = model;
		//FIXME: try using dijit.Tree and davinci.ui.widgets.TransformTreeMixin instead of ToggleTree
		this.tree = new ToggleTree({
			id: "reviewCommentExplorerViewTree",
			showRoot: false,
			model: model,
			labelAttr: "name", 
			childrenAttrs: "children",
			getIconClass: dojo.hitch(this, this._getIconClass),
			filters: [Resource.dateSortFilter, this.commentingFilter],
			isMultiSelect: true
		});

		this.setContent(this.tree); 
		this.tree.startup();
		dojo.connect(this.tree, 'onDblClick',  
				dojo.hitch(this, this._dblClick));
		dojo.connect(this.tree, 'onClick', dojo.hitch(this, this._click));
		dojo.connect(this.tree,'_onNodeMouseEnter', dojo.hitch(this, this._over));
		dojo.connect(this.tree,'_onNodeMouseLeave', dojo.hitch(this, this._leave));
		this.tree.notifySelect = dojo.hitch(this, function (item) {
			var items = dojo.map(this.tree.getSelectedItems(), function(item) { return {resource:item};});
			this.publish("/davinci/ui/selectionChanged", [items, this]);
		});

		this.subscribe("/davinci/ui/selectionChanged", "_updateActionBar");
		this.subscribe("/davinci/review/resourceChanged", function(arg1, arg2, arg3) {
			if (arg3 && arg3.timeStamp) {
				var node = davinci.review.model.resource.root.findVersion(arg3.timeStamp);
				if (node) { 
					this.tree.set("selectedItem", node);
				} else {
					this.publish("/davinci/ui/selectionChanged", [{}, this]);
				}
			}
		});

		var popup = Workbench.createPopup({ 
			partID: 'davinci.review.reviewNavigator',
			domNode: this.tree.domNode, 
			openCallback:this.tree.getMenuOpenCallback()
		});

		this.infoCardContent = dojo.cache("davinci" ,"review/widgets/templates/InfoCard.html");
		if (Runtime.getRole() != "Designer") { 
			dojo.style(this.toolbarDiv, "display", "none");
		}

		// Customize dijit._masterTT so that it will not be closed when the cursor is hovering on it
		if (!dijit._masterTT) { 
			dijit._masterTT = new dijit._MasterTooltip();
		}
		this.connect(dijit._masterTT.domNode, "mouseover", function() {
			if (this._delTimer) {
				clearTimeout(this._delTimer);
				this._delTimer = null;
			}
		});
		this.connect(dijit._masterTT.domNode, "mouseleave", function() {
			this._lastAnchorNode && this._leave();
		});
	},

	_updateActionBar: function(item, context) {
		if (context!=this||!item||!item.length) {
			this.closeBtn.set("disabled",true);
			this.editBtn.set("disabled",true);
			return;
		}
		var selectedVersion = item[0].resource.elementType == "ReviewFile" ? item[0].resource.parent : item[0].resource;
		var isVersion = selectedVersion.elementType == "ReviewVersion";
		var isDraft = selectedVersion.isDraft;
		this.closeBtn.set("disabled", !isVersion || selectedVersion.closed || isDraft);
		this.openBtn.set("disabled", !isVersion || !selectedVersion.closedManual || isDraft);
		this.editBtn.set("disabled", !isVersion);
	},

	getTopAdditions: function() {
		var toolbar = new Toolbar({}, dojo.create("div"));
		var closeBtn = new Button({
			id: toolbar.get("id") + ".Close",
			showLabel: false,
			label: viewNls.closeVersion,
			disabled: true,
			iconClass: "viewActionIcon closeVersionIcon",
			onClick: dojo.hitch(this, "_closeVersion")
		});
		this.closeBtn = closeBtn;

		var openBtn = new Button({
			id: toolbar.get("id")+".Open",
			showLabel:false,
			label: viewNls.openVersion,
			disabled:true,
			iconClass: "viewActionIcon openVersionIcon",
			onClick: dojo.hitch(this,"_openVersion")
		});
		this.openBtn = openBtn;
		var editBtn = new Button({
			id: toolbar.get("id") + ".Edit",
			showLabel: false,
			label: viewNls.editVersion,
			disabled: true,
			iconClass: "viewActionIcon editVersionIcon",
			onClick: dojo.hitch(this,"_editVersion")
		});
		this.editBtn = editBtn;

		var input = new TextBox({
			id:"reviewExplorerFilter",
			placeHolder: viewNls.filter,
			onKeyUp: dojo.hitch(this,this._filter)
		});

		toolbar.addChild(closeBtn);
		toolbar.addChild(openBtn);
		toolbar.addChild(new dijit.ToolbarSeparator());
		toolbar.addChild(editBtn);

		dojo.place(dojo.create("br"), toolbar.domNode);
		toolbar.addChild(input);
		return toolbar.domNode;
	},

	_closeVersion: function() {
		(new CloseVersionAction()).run(this);
	},

	_openVersion: function() {
		(new OpenVersionAction()).run(this);
	},

	_editVersion: function() {
		(new EditVersionAction()).run(this);
	},

	_filter: function(e) {
		//if(e.keyCode != dojo.keys.ENTER)return;
		var text = dijit.byId("reviewExplorerFilter").get("value");
		this.commentingFilter.filterString=text;
		dojo.forEach(this.model.root.children,dojo.hitch(this, function(item) {
			var newChildren;
			item.getChildren(function(children) { newChildren=children; }, true);
			this.model.onChildrenChange(item, newChildren);
		}));
	},

	commentingFilter : {
		filterString:"",
		filterItem : function(item) {
			if (!this.filterString) { 
				return false;
			} else {
				if (item.elementType == "ReviewFile") {
					if (item.name.toLowerCase().indexOf(this.filterString.toLowerCase()) >= 0) {
						return false;
					} else {} 
					return true;
				}
				return false;
			}
		}
	},

	destroy: function() {
		this.inherited(arguments);
	},

	_dblClick: function(node) {
		if (Runtime.getMode() == "reviewPage") {
			if (node.isDraft || node.parent.isDraft) {
				if (Runtime.getRole() == "Designer") {
					this._openPublishWizard(node.isDraft ? node : node.parent);
				}
				return;
			}
			if (node.elementType == "ReviewFile") {
				WorkBench.openEditor({
					fileName: node,
					content: node.getText()
				});
			}
		} else if (Runtime.getMode() == "designPage") {
			if (node.isDraft || node.parent.isDraft) {
				if (Runtime.getRole()=="Designer") {
					this._openPublishWizard(node.isDraft?node:node.parent);
				}
				return;
			}
			if (node.elementType == "ReviewFile") {
//				window.open(this._location()+"review/"+Runtime.userName+"/"+node.parent.timeStamp+"/"
//						+node.name+"/default");
				console.debug("CommentExplorerView: review/"+Runtime.userName+"/"+node.parent.timeStamp+"/"+
						node.name+"/default");
				WorkBench.openEditor({
					fileName: node,
					content: node.getText()
				});
			}
		}
	},

	_location: function() {
		var fullPath = document.location.href;
		var split = fullPath.split("?");
		var location = split[0].match(/http:\/\/.+:\d+\//);

		return location;
	},

	_click: function(node) {
		this.select = node;
	},

	_over: function(node) {
		if (node.item.elementType != "ReviewVersion") { 
			return;
		}
		if (!this._showTimer) {
			// Build the tooltip
			var item = node.item, template = {}, c;

			template.detail_title = item.name;

			template.your_role = widgetsNls.yourRole;
			template.due_by = widgetsNls.dueBy;
			template.created_by = widgetsNls.createdBy;
			template.artifacts_in_rev = widgetsNls.artifactsInRev;
			template.reviewers = widgetsNls.reviewers;

			template.detail_role = Runtime.getRole();
			template.detail_dueDate = item.dueDate == "infinite" ? "Infinite" : locale.format(item.dueDate, {
				selector:'date',
				formatLength:'long',
				datePattern:'MMM dd, yyyy', //FIXME: use of pattern prevents globalization
				timePattern:'HH:mm:ss' //FIXME: not used if selector is 'date'
			});
			template.detail_creator = Runtime.getDesigner()
			+ "&nbsp;&lt" + Runtime.getDesignerEmail() + "&gt";
			template.detail_files = "";
			item.getChildren(function(children) { c = children; }, true);
			dojo.forEach(c, function(i) {
				var label = i.getLabel();
				template.detail_files += "<div><span>"
					+ label.substr(0, label.length - 4)
					+ "</span><span class='dijitTreeIcon reviewFileIcon detail_file'></span></div>";
			});
			template.detail_reviewers = "";
			dojo.forEach(item.reviewers, function(i) {
				template.detail_reviewers += "<div>" + i.name + "</div>";
			});
			item.closed ? template.detail_dueDate_class = "closed" : template.detail_dueDate_class = "notClosed";

			this._showTimer = setTimeout(dojo.hitch(this, function() {
				if(this._delTimer){
					clearTimeout(this._delTimer);
					delete this._delTimer;
				}
				dijit.showTooltip(dojo.string.substitute(this.infoCardContent, template), node.rowNode);
				this._lastAnchorNode = node;
				delete this._showTimer;
			}), 1000);
		}

	},

	_leave: function(node) {
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		if (this._lastAnchorNode) {
			this._delTimer = setTimeout(dojo.hitch(this, function() {
				dijit.hideTooltip(this._lastAnchorNode.rowNode);
				delete this._delTimer;
			}), 1000);
		}
	},

	_openPublishWizard: function(node) {
		var action = new davinci.review.actions.PublishAction(node);
		action.run();
	},

	_getIconClass: function(item, opened) {
		// summary:
		//		Return the icon class of the tree nodes
		if (item.elementType == "ReviewVersion") {
			if (item.isDraft) { 
				return "draft-open";
			}
			if (item.closed) {
				return opened ? "reviewFolder-open-disabled":"reviewFolder-closed-disabled";
			}
			if (!item.closed) {
				return opened ? "reviewFolder-open":"reviewFolder-closed";
			}
		}

		if (item.elementType=="ReviewFile") {
			if (item.parent.closed) {
				return "disabledReviewFileIcon";
			}
			var icon;
			var fileType = item.getExtension();
			var extension = Runtime.getExtension("davinci.fileType", function (extension) {
				return extension.extension == fileType;
			});
			if (extension) {
				icon=extension.iconClass;
			}
			return icon ||	"dijitLeaf";
		}
		return "dijitLeaf";
	}

});
});
