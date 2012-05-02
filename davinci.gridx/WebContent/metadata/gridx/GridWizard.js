define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"./GridWizardDataSourcePanel",
	"./GridWizardSelectColumnsPanel",
	"./GridWizardPreviewPanel",
	"davinci/ve/widget",
	"dojo/i18n!./nls/gridx",
	"dojo/i18n!dijit/nls/common",
	"dojo/text!./templates/gridWizard.html"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StackContainer, ContentPane,  
		Button, GridWizardDataSourcePanel, GridWizardSelectColumnsPanel, GridWizardPreviewPanel, 
		Widget, gridxNls, dijitNls, templateString) {

return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

	templateString: templateString,

	postMixInProperties: function() {
		this.inherited(arguments);
		dojo.mixin(this, gridxNls);
		dojo.mixin(this, dijitNls);
	},

	postCreate: function() {
		//Remember widget we're dealing with
		this._widget = Widget.byId(this.widgetId);

		//Set up the wizard
		var sc = this.wizardStackContainer = new StackContainer({}, this.wizardStackContainer);

		var page1 = this.page1 = new ContentPane({style:"overflow:hidden;"});
		var page2 = this.page2 = new ContentPane({style:"overflow:hidden;"});
		var page3 = this.page3 = new ContentPane({style:"overflow:auto;"});
		this.wizardStackContainer.addChild(page1);
		this.wizardStackContainer.addChild(page2);
		this.wizardStackContainer.addChild(page3);

		this._initPage1();
		this._initPage2();
		this._initPage3();
		this._initButtons();

		dojo.place(this.page1Node,page1.domNode);
		dojo.place(this.page2Node,page2.domNode);
		dojo.place(this.page3Node,page3.domNode);

		sc.startup();

		this._subs=[
			dojo.subscribe(sc.id+"-selectChild", dojo.hitch(this, this._onPageSelected))
		];
	},

	_initPage1: function() {
		
	},

	_initPage2: function() {
		this._gridSelectColumnsPanel = new GridWizardSelectColumnsPanel({
			style: "width:100%;height:100%"
		},this.gridSelectColumnsPane);
	},

	_initPage3: function() {
		this._gridPreviewPanel = new GridWizardPreviewPanel({
			style: "width:100%;height:100%"
		},this.gridPreviewPane);
	},
	
	show: function() {
		//Get everything sized right
		this.wizardStackContainer.resize();
		
		//Populate the first page
		this._populatePage1();
	},

	_initButtons: function() {
		this.finish = new Button({
			onClick: dojo.hitch(this, function() { this._finish(); }),
			style: "float:right;"
		},this.finish);
		this.next = new Button({
			onClick: dojo.hitch(this, function() { this._forward(); }),
			style: "float:right;"
		},this.next);
		this.prev = new Button({
			onClick: dojo.hitch(this, function() { this._back(); }),
			style: "float:right;"
		},this.prev);
	},
	
	_forward: function() {
		var selectedPage = this.wizardStackContainer.selectedChildWidget;
		
		if (selectedPage === this.page1) {
			if (this._dataSourcePanel.isValid()) {
				this._populatePage2();
			} else {
				this._showErrorMessage(this._dataSourcePanel.getValidationMessage());
				return;
			}
		} else if (selectedPage === this.page2) {
			if (this._gridSelectColumnsPanel.isValid()) {
				this._populatePage3();
			} else {
				this._showErrorMessage(this._gridSelectColumnsPanel.getValidationMessage());
				return;
			}
		}
		
		//Didn't run into issues, so let's move wizard forward
		this._clearErrorMessage();
		this.wizardStackContainer.forward();
	},
	
	_back: function() {
		this.wizardStackContainer.back();
	},
	
	_populatePage1: function() {
		this._dataSourcePanel = new GridWizardDataSourcePanel();
		this._dataSourcePanel.populate(this.widgetId, this.dataSourceInput);
	},
	
	_populatePage2: function() {
		var isDirty = this._dataSourcePanel.isDirty();
		
		if (!this._gridSelectColumnsPanel.isPopulated() || isDirty) {
			//Create callback to receive update command
			var updateCommandCallback = function(compoundCommand) {
				//For now, assuming if anything has changed on data source panel that 
				//we shouldn't pay any attention to current column set-up. But, that's simplistic
				//since user may have just added row or changed cell value.
				this._gridSelectColumnsPanel.populate(this._widget, compoundCommand, isDirty);
			}.bind(this);
			this._getUpdateCompoundCommand(updateCommandCallback);
		}
	},
	
	_populatePage3: function() {
		var isDirty = this._gridSelectColumnsPanel.isDirty();
		
		if (!this._gridPreviewPanel.isPopulated() || isDirty) {
			var callback = function(compoundCommand) {
				var selectedColumnIds = this._gridSelectColumnsPanel.getSelectedColumnIds();
				this._gridPreviewPanel.populate(this._widget, compoundCommand, selectedColumnIds, this._dataSourcePanel._gridInput);
			}.bind(this);
			this._getUpdateCompoundCommand(callback);
		}
	},
	
	_getUpdateCompoundCommand: function(updateCommandCallback) {
		if (this._dataSourcePanel.isDirty() || !this._compoundCommand) {
			var callback = function(compoundCommand) {
				this._compoundCommand = compoundCommand;
				updateCommandCallback(this._compoundCommand);
			}.bind(this);
			this._dataSourcePanel.getUpdateWidgetCommand(callback);
		} else {
			updateCommandCallback(this._compoundCommand);
		}
	},

	_onPageSelected: function(page) {
		this.prev.set("disabled", page.isFirstChild);
		this.next.set("disabled", page.isLastChild);
		dojo.removeClass(this.navPage1, "current");
		dojo.removeClass(this.navPage2, "current");
		dojo.removeClass(this.navPage3, "current");

		if (page == this.page1) {
			dojo.addClass(this.navPage1 ,"current");
		}
		if (page == this.page2) {
			dojo.addClass(this.navPage2, "current");
		}
		if (page == this.page3) {
			dojo.addClass(this.navPage3, "current");
		}
	},

	/* AWE TODO: Deal with properly setting status icons on page headers
	updateSubmit : function() {
		var valid = this.versionTitle.isValid() && this.dueDate.isValid();
		var valid2 = this.reviewFiles && this.reviewFiles.length > 0;
		var valid3 = this.userData.length > 0;
		dojo.removeClass(this.navPage1Icon, valid ? "todo" : "done");
		dojo.addClass(this.navPage1Icon, valid ? "done" : "todo");
		dojo.removeClass(this.navPage2Icon, valid2 ? "todo" : "done");
		dojo.addClass(this.navPage2Icon, valid2 ? "done" : "todo");
		dojo.removeClass(this.navPage3Icon, valid3 ? "todo" : "done");
		dojo.addClass(this.navPage3Icon, valid3 ? "done" : "todo");
		this.finish.set("disabled", !(valid && valid2 && valid3));
		var errMsg="";
		if (!valid3) {
			errMsg = gridxNls.noReviewersSelected;
		}
		if (!valid2) {
			errMsg = gridxNls.noFilesSelected;
		}
		if (!this.dueDate.isValid()) {
			errMsg = gridxNls.dueDateIncorrect;
		}
		if (!this.versionTitle.isValid()) {
			errMsg = gridxNls.titleRequired;
		}
		this.reviewMsg.innerHTML = errMsg;
	},
	*/
	
	_showErrorMessage: function(errMsg) {
		this.reviewMsg.innerHTML = errMsg;
	},
	
	_clearErrorMessage: function() {
		this._showErrorMessage("");
	},

	//AWE TODO: Deal with going to page directly (rather than with forward and back buttons)
	select: function (evt) {
		/*
		var target = evt.target;
		var stackContainer = this.wizardStackContainer;
		if (target == this.navPage1 || target == this.navPage1Icon) {
			stackContainer.selectChild(this.page1, true);
		} else if (target == this.navPage2 || target == this.navPage2Icon) {
			stackContainer.selectChild(this.page2, true);
		} else if (target == this.navPage3 || target == this.navPage3Icon) {
			stackContainer.selectChild(this.page3, true);
		}
		*/
	},
	
	_finish: function(value) {
		//Clear any current messages
		this._clearErrorMessage();
		
		//AWE TODO: Need to also handle case if they've never gone to 2nd or 3rd panels (or has changed
		//data on first panel since last visiting them)
		
		//Validate panel 1
		if (!this._dataSourcePanel.isValid()) {
			this._showErrorMessage(this._dataSourcePanel.getValidationMessage());
			return;
		}
		
		//Validate panel 2
		if (!this._gridSelectColumnsPanel.isValid()) {
			this._showErrorMessage(this._gridSelectColumnsPanel.getValidationMessage());
			return;
		}
		
		//Validate panel 3
		if (!this._gridPreviewPanel.isValid()) {
			this._showErrorMessage(this._gridPreviewPanel.getValidationMessage());
			return;
		}
		
		//Everything passed
		this.onFinish();
	},
	
	updateWidget: function() {
		var callback = this._updateWidgetHelper.bind(this);
		this._getUpdateCompoundCommand(callback);
	},
	
	_updateWidgetHelper: function(compoundCommand) {
		//Making assumption the last command is the one for upgrading the grid itself
		var lastCommand = compoundCommand._commands[compoundCommand._commands.length-1];
		
		var modifiedHeaderElements = null;
		try {
			//AWE TODO: Temporary try/catch to gracefully deal with case of user having not gone forward to 3rd panel
			var modifiedHeaderElements = this._gridPreviewPanel.getPersistedGridUpdates().column;
		} catch (e) {
			console.error("GridWizard._updateWidgetHelper e = " + e.message);
		}
		
		if (modifiedHeaderElements) {
			//Find THEAD
			var tHead = null;
			dojo.some(lastCommand._children, function(child) {
				if (child.type === "html.thead") {
					tHead = child;
					return true;
				}
			});
			
			//Find TR
			var tRow = null;
			tHeadChildren = tHead.children;
			dojo.some(tHeadChildren, function(tHeadChild) {
				if (tHeadChild.type === "html.tr") {
					tRow = tHeadChild;
					return true;
				}
			});
			
			var currentHeaderElements = tRow.children;
			var currentStructure = lastCommand._properties.structure;
			
			//Assuming 1-to-1 match with current headers and structure
			var newHeaderElements = [];
			var newStructure = [];
			dojo.forEach(modifiedHeaderElements, function(modifiedHeaderElement) {
				var count = 0;
				dojo.some(currentHeaderElements, function(currentHeaderElement) {
					if (modifiedHeaderElement.field === currentHeaderElement.properties.field) {
						var currentStructureElement = currentStructure[count];
		
						//create new header element
						var newHeaderElement = dojo.clone(currentHeaderElement);
						newHeaderElement.properties.width = modifiedHeaderElement.width;
						
						//create new structure element
						var newStructureElement = dojo.clone(currentStructureElement);
						newStructureElement.width = modifiedHeaderElement.width; 
						
						//Add new elements to new arrays
						newHeaderElements.push(newHeaderElement);
						newStructure.push(newStructureElement);
					}
					//Update counter
					count++;
				});
			});
			
			//Transfer new into old data structure
			tRow.children = newHeaderElements;
			lastCommand._properties.structure = newStructure;
		}
		
		//Execute command
		var context = this._widget.getContext();
		context.getCommandStack().execute(compoundCommand);	
		context.select(lastCommand.newWidget);
	},

	onCancel: function() {
	},
	
	onFinish: function() {
	},

	destroy: function() {
		this.inherited(arguments);
		
		//Destroy the individual panels
		this._dataSourcePanel.destroy();
		this._gridSelectColumnsPanel.destroyRecursive();
		this._gridPreviewPanel.destroyRecursive();
		
		//Clean up subscriptions
		this._subs.forEach(dojo.unsubscribe);
		delete this._subs; 
	}
});
});
