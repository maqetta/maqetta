define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/review/model/ReviewTreeModel",
	"davinci/Workbench",
	"davinci/workbench/ViewPart",
	"dijit/Tree",
	"dojo/date/stamp",
	"dojo/date/locale",
	"davinci/review/actions/CloseVersionAction",
	"davinci/review/actions/EditVersionAction",
	"davinci/review/actions/OpenVersionAction",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dijit/form/Button",
	"dijit/form/TextBox",
    "dojo/i18n!./nls/view",
    "dojo/i18n!../widgets/nls/widgets",
    "davinci/ui/widgets/TransformTreeMixin"
], function(declare, Runtime, ReviewTreeModel, Workbench, ViewPart, Tree, stamp, locale, CloseVersionAction,
		EditVersionAction, OpenVersionAction, Toolbar, ToolbarSeparator, Button, TextBox, viewNls, widgetsNls) {

var getIconClass = function(item, opened) {
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
};
	
getLabelClass = function(item, opened) {
	// summary:
	//		Return the label class of the tree nodes
	
	var labelClass = "dijitTreeLabel";
	if (item.elementType == "ReviewVersion") {
		if (item.designerId == Runtime.userName) {
			labelClass = "reviewOwnedByUserLabel";
		} else {
			labelClass = "reviewOwnedByOtherLabel";
		}
	}
	
	return labelClass;
};

var getSortTransforms = function() {
	return [
	    function(items) {
	    	return items.sort(function (file1,file2) {
	    		return file1.timeStamp > file2.timeStamp ? -1 : file1.timeStamp < file2.timeStamp ? 1 : 0;
	    	});
	    }
	];
};
	
var CommentExplorerView = declare(ViewPart, {

	postCreate: function() {
		this.inherited(arguments);

		var model= new ReviewTreeModel();
		this.model = model;
		var transforms = getSortTransforms();
		transforms.push(function(items) {
			return items.filter(this.commentingFilter.filterItem, this);
		}.bind(this));
		this.tree = new Tree({
			id: "reviewCommentExplorerViewTree",
			persist: false,
			showRoot: false,
			model: model,
			labelAttr: "name", 
			childrenAttrs: "children",
			getIconClass: dojo.hitch(this, this._getIconClass),
			getLabelClass: dojo.hitch(this, this._getLabelClass),
			transforms: transforms,
			isMultiSelect: true
		});

		this.setContent(this.tree); 
		this.attachToolbar();
		this.tree.startup();
		dojo.connect(this.tree, 'onDblClick',  
				dojo.hitch(this, this._dblClick));
		dojo.connect(this.tree, 'onClick', dojo.hitch(this, this._click));
		dojo.connect(this.tree,'_onNodeMouseEnter', dojo.hitch(this, this._over));
		dojo.connect(this.tree,'_onNodeMouseLeave', dojo.hitch(this, this._leave));
		dojo.connect(this.tree,'_setSelectedNodesAttr', function () {
			this._publishSelectionChanges();
		}.bind(this));

		this.subscribe("/davinci/review/selectionChanged", "_updateActionBar");
		this.subscribe("/davinci/review/resourceChanged", function(result, type, changedResource) {
			if (changedResource && changedResource.timeStamp) {
				davinci.review.model.resource.root.findVersion(changedResource.timeStamp).then(function(node){
					if (node) { 
						this.tree.set("selectedItem", node);
					} else {
						this.tree.set("selectedItems", []);
					}
					this._publishSelectionChanges();
					
					// NOTE: This feels like a hack, but if all children of the root are deleted (making the
					// root empty), then the tree will collapse the root node. And, then when we add a node back in,
					// that node is invisible because the tree thinks the root node is collapsed.  So, 
					// we'll circumvent that by telling it the root node to expand. If already expanded, this 
					// has no effect.
					this.tree.rootNode.expand();
				}.bind(this));
			}
		});

		var popup = Workbench.createPopup({ 
			partID: 'davinci.review.reviewNavigator',
			context: this,
			domNode: this.tree.domNode, 
			openCallback: function (event) {
				//Select the item in the tree user right-clicked on
				var w = dijit.getEnclosingWidget(event.target);
				if(!w || !w.item){
					return;
				}
				this.tree.set("path", this._buildTreePath(w.item));
		 	}.bind(this)
		});

		var o = Workbench.getActionSets("davinci.review.reviewNavigator");
		var actions = o.clonedActionSets;
		if (actions && actions.length == 1) {
			dojo.forEach(actions[0].actions, dojo.hitch(this, function(action) {
					if (action.keyBinding) {
						if (!this.keyBindings) {
							this.keyBindings = [];
						}

						this.keyBindings.push({keyBinding: action.keyBinding, action: action});
					}
			}));
		}

		dojo.connect(this.tree.domNode, "onkeypress", this, "_onKeyPress");

		this.infoCardContent = dojo.cache("davinci" ,"review/widgets/templates/InfoCard.html");

		// Customize dijit._masterTT so that it will not be closed when the cursor is hovering on it
		if (!dijit._masterTT) { 
			dijit._masterTT = new dijit._MasterTooltip();
		}
		this.connect(dijit._masterTT.domNode, "mouseover", function() {
			this._deleteDelTimer();
		});
		this.connect(dijit._masterTT.domNode, "mouseleave", function() {
			this._lastAnchorNode && this._leave();
		});
		
		//Keep track of editor selection so that we can expand tree appropriately
		dojo.subscribe("/davinci/ui/editorSelected", function(obj){
			var editor = obj.editor;
			if (editor && editor.editorID === "davinci.review.CommentReviewEditor") {
				var fileNodeItem = editor.resourceFile;
				var versionNodeItem = fileNodeItem.parent;
				
				//We want to collapse everything but the version folder of the review held in the editor
				dojo.forEach(this.model.root.children, function(nodeItem) {
					if (nodeItem != versionNodeItem) {
						var treeNodes = this.tree.getNodesByItem(nodeItem);
						
						if (treeNodes.length > 0) {
							var treeNode = treeNodes[0];
							if (treeNode.isExpanded) {
								// NOTE: Hate to use private function of dijit.Tree, but if I
								// use treeNode.collapse, the node can no longer be re-expanded
								// by the user
								this.tree._collapseNode(treeNode);
							}
						}
					}
				}.bind(this));
				
				//Set the path (which expands tree as necessary)
				this.tree.set("path", this._buildTreePath(fileNodeItem));
			}
		 }.bind(this));
	},
	
	_buildTreePath: function(item) {
		var path = [];
		for(var loopItem=item; loopItem; loopItem = loopItem.parent) {
			path.unshift(loopItem);
		}
		return path;
	},

	_updateActionBar: function(item, context) {
		if (context!=this||!item||!item.length) {
			this.closeBtn.set("disabled",true);
			this.editBtn.set("disabled",true);
			return;
		}
		var selectedVersion = item[0].resource.elementType == "ReviewFile" ? item[0].resource.parent : item[0].resource;
		Runtime.reviewers = selectedVersion.reviewers || [];
		var isDesigner = selectedVersion.designerId == Runtime.userName;
		var isVersion = selectedVersion.elementType == "ReviewVersion";
		var isDraft = selectedVersion.isDraft;
		this.closeBtn.set("disabled", !isDesigner || !isVersion || selectedVersion.closed || isDraft); 
		this.openBtn.set("disabled", !isDesigner || !isVersion || !selectedVersion.closedManual || isDraft);
		this.editBtn.set("disabled", !isDesigner || !isVersion);
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
		dojo.addClass(toolbar.domNode, "davinciCommentExplorer");
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
			item.getChildren(function(children) { 
				this.model.onChildrenChange(item, children);
			}.bind(this));
		}));
	},

	commentingFilter: {
		filterString: "",
		filterItem: function(item) {
			var filterString = this.commentingFilter.filterString;
			if (!filterString) { 
				return true;
			} else {
				if (item.elementType == "ReviewFile") {
					return item.name.toLowerCase().indexOf(filterString.toLowerCase()) >= 0;
				}
				return true;
			}
		}
	},

	destroy: function() {
		this.inherited(arguments);
	},

	_dblClick: function(node) {
		if (node.isDraft || node.parent.isDraft) {
			if (node.designerId == Runtime.userName || node.parent.designerId == Runtime.userName) {
				this._openPublishWizard(node.isDraft ? node : node.parent);
			}
			return;
		}
		if (node.elementType == "ReviewFile") {
			Workbench.openEditor({
				fileName: node,
				content: node.getText()
			});
		}
	},

	_click: function(node) {
		this._publishSelectionChanges();
	},
	
	_publishSelectionChanges: function() {
		var items = this.getSelection();
		this.publish("/davinci/review/selectionChanged", [items, this]);
	},
	
	getSelection: function() {
		var items = dojo.map(this.tree.get('selectedItems'), function(item) { return {resource:item};});
		return items;
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
			template.creation_date = widgetsNls.creationDate;
			template.artifacts_in_rev = widgetsNls.artifactsInRev;
			template.reviewers = widgetsNls.reviewers;

			
			template.detail_role = (item.designerId == Runtime.userName) ? viewNls.designer : viewNls.reviewer;
			template.detail_dueDate = item.dueDate == "infinite" ? viewNls.infinite : locale.format(item.dueDate, {
				selector:'date',
				formatLength:'long'
			});
			
			var creatorString = Runtime.getUserDisplayNamePlusEmail({
				email: item.designerEmail,
				userDisplayName: item.designerDisplayName,
				userId: item.designerId
			});
			template.detail_creator = creatorString;
			
			//Creation date - use short format, but tolerate RFC3339
			var stampArgs = item.timeStamp.match(/^(\d{4})(\d{2})(\d{2})\T(\d{2})(\d{2})(\d{2})\Z$/);
			var timeStampDate = stamp.fromISOString(stampArgs ? dojo.replace("{1}-{2}-{3}T{4}:{5}:{6}Z", stampArgs) : item.timeStamp);
			template.detail_creationDate = locale.format(timeStampDate, {
				formatLength:'medium'
			});

			template.detail_files = "";
			item.getChildren(function(children) {
				dojo.forEach(children, function(i) {
					var label = i.getLabel();
					template.detail_files += "<div><span>"
						+ label.substr(0, label.length - 4)
						+ "</span><span class='dijitTreeIcon reviewFileIcon detail_file'></span></div>";
				});
				template.detail_reviewers = "";
				dojo.forEach(item.reviewers, function(i) {
					if (i.email != item.designerEmail) {
						var reviewer = "<div>" + i.email + "</div>";
						if ((i.displayName != "") && (i.email != i.displayName)) {
							reviewer = "<div>" + i.displayName +" &lt;" + i.email + "&gt;</div>";
						}
						template.detail_reviewers += reviewer;
					}
				});
				item.closed ? template.detail_dueDate_class = "closed" : template.detail_dueDate_class = "notClosed";
	
				this._showTimer = setTimeout(dojo.hitch(this, function() {
					this._deleteDelTimer();
					dijit.showTooltip(dojo.string.substitute(this.infoCardContent, template), node.rowNode);
					this._lastAnchorNode = node;
					delete this._showTimer;
					this._createDelTimer(15000);
				}), 1000);
			}.bind(this));
		}
	},

	_leave: function(node) {
		this._deleteDelTimer();
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		if (this._lastAnchorNode) {
			this._createDelTimer(1000);
		}
	},
	
	_createDelTimer: function(timeoutMs){
		this._delTimer = setTimeout(dojo.hitch(this, function() {
			this._hideTooltip();
			delete this._delTimer;
		}), timeoutMs);
	},
	
	_deleteDelTimer: function(){
		if(this._delTimer){
			clearTimeout(this._delTimer);
			delete this._delTimer;
		}
	},
	
	_hideTooltip: function(){
		if (this._lastAnchorNode) {
			dijit.hideTooltip(this._lastAnchorNode.rowNode);
			this._lastAnchorNode = null;
		}
	},

	_openPublishWizard: function(node) {
		var action = new davinci.review.actions.PublishAction(node);
		action.run();
	},

	_getIconClass: function(item, opened) {
		return getIconClass(item, opened);
	},
	
	_getLabelClass: function(item, opened) {
		return getLabelClass(item, opened);
	},

	_onKeyPress: function(e) {
		var stopEvent = dojo.some(this.keyBindings, dojo.hitch(this, function(binding) {
			if (Runtime.isKeyEqualToEvent(binding.keyBinding, e)) {
				davinci.Workbench._runAction(binding.action, this, binding.action.id);
				return true;
			}
		}));

		if (stopEvent) {
			dojo.stopEvent(e);
		}

		return stopEvent;
	}
});

//Make get getIconClass, etc. publicly available as a "static" function
CommentExplorerView.getIconClass = getIconClass;
CommentExplorerView.getLabelClass = getLabelClass;
CommentExplorerView.getSortTransforms = getSortTransforms;

return CommentExplorerView;

});
