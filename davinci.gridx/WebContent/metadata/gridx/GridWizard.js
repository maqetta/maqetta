define([
	"dojo/_base/declare",
	"dijit/layout/StackContainer",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"./GridWizardDataSourcePanel",
	"./GridWizardSelectColumnsPanel",
	"./GridWizardPreviewPanel",
	"davinci/ve/widget",
	"dojo/i18n!./nls/gridx",
	"dojo/i18n!dijit/nls/common"
], function(declare, 
		StackContainer, 
		BorderContainer, 
		ContentPane,  
		Button, 
		GridWizardDataSourcePanel, 
		GridWizardSelectColumnsPanel, 
		GridWizardPreviewPanel, 
		Widget, 
		gridxNls, 
		dijitNls) {

return declare(ContentPane, {

	postCreate: function() {
		//Remember widget we're dealing with
		this._widget = Widget.byId(this.widgetId);

		//Create data structure to keep track of connections
		this._connections = [];
		
		//Create the elements making up our wizard
		var wizardContainer = this._createWizard();

		//Set our content
		this.set("content", wizardContainer);

		//Set-up subscriptions
		this._subs=[
			dojo.subscribe(this.wizardStackContainer.id+"-selectChild", dojo.hitch(this, this._onPageSelected))
		];
	},
	
	_createWizard: function() {
		//Set up the outer container for the all wizard elements
		var borderContainer = new BorderContainer({
			design:'headline',
			gutters:false, 
			liveSplitters:false
		});
		dojo.addClass(borderContainer.domNode, "gridWizard");
		
		//Create TOP section (containing steps)
		var topSection = this._createTopSection();
		borderContainer.addChild(topSection);
		
		//Create MAIN SECTION holding wizard panels
		var mainSection = this._createMainSection();
		borderContainer.addChild(mainSection);
		
		//Create BOTTOM section (for message and buttons)
		var bottomSection = this._createBottomSection();
		borderContainer.addChild(bottomSection);
		
		return borderContainer;
	},

	_createTopSection: function() {
		var stepsContentPane = new ContentPane({
			region: "top"
		});
		dojo.addClass(stepsContentPane.domNode, "steps");
		
		var navPage1 = this.navPage1 = this._createStepHeading(0, gridxNls.dataSourceHeader);
		dojo.place(navPage1, stepsContentPane.domNode); 
		var navPage2 = this.navPage2 = this._createStepHeading(1, gridxNls.selectColumnsHeader);
		dojo.place(navPage2, stepsContentPane.domNode); 
		var navPage3 = this.navPage3 = this._createStepHeading(2, gridxNls.configureColumnsHeader);
		dojo.place(navPage3, stepsContentPane.domNode); 
		
		return stepsContentPane;
	},
	
	_createStepHeading: function(stepIndex, stepTitle) {
		var step = dojo.create("div");
		if (stepIndex == 0) {
			dojo.addClass(step, "crumbs");
			dojo.addClass(step, "current");
			dojo.addClass(step, "sep");
		} else if (stepIndex == 1) {
			dojo.addClass(step, "crumbs");
			dojo.addClass(step, "sep");
		} else if (stepIndex == 2) {
			dojo.addClass(step, "crumbs");
			// With separators in Step 1 and Step 2, we can't make all of the crumbs the same 
			// % width, so adding a class to tweak last entry
			dojo.addClass(step, "crumbsLast"); 
		}
		this._connections.push(dojo.connect(step, "onclick", dojo.hitch(this, function(e) {
			this.select(e.target);
		})));
		
		var stepIcon = dojo.create("div");
		if (stepIndex == 0) {
			dojo.addClass(stepIcon, "done");
		} else {
			dojo.addClass(stepIcon, "todo");
		}
		dojo.place(stepIcon, step);
		
		var stepLabelSpan = dojo.create("span", {
			innerHTML: dojo.replace(gridxNls.stepHeader, [stepIndex+1, stepTitle])
		});
		dojo.place(stepLabelSpan, step);
		
		return step;
	},
	
	_createMainSection: function() {
		//Create MAIN SECTION holding wizard panels
		var wizardStackContainer = this.wizardStackContainer = new StackContainer({
			region: "center",
		});
		dojo.addClass(wizardStackContainer.domNode, "wizardStackContainer");
		
		//Create individual pages
		var page1 = this.page1 = new ContentPane();
		dojo.addClass(page1.domNode, "pageNode");
		var page2 = this.page2 = new ContentPane();
		dojo.addClass(page2.domNode, "pageNode");
		var page3 = this.page3 = new ContentPane();
		dojo.addClass(page3.domNode, "pageNode");
		wizardStackContainer.addChild(page1);
		wizardStackContainer.addChild(page2);
		wizardStackContainer.addChild(page3);

		this._initPage1();
		this._initPage2();
		this._initPage3();
		
		return wizardStackContainer;
	},
	
	_initPage1: function() {
		dataSourcePanel = this._dataSourcePanel = new GridWizardDataSourcePanel();
		dojo.addClass(dataSourcePanel.domNode, "wizardPanel");
		this.page1.set("content", dataSourcePanel);
		
		// Populate the page when it's first shown. This is especially important for dataSourcePanel
		// because of it's reliance of how it gets the embedded div for data source configuration. The
		// DataGridInput/DataStoreBasedWidgetInput classes rely on the div being in the dom tree so
		// they can look up HTML elements in the div by ID.
		this._connections.push(dojo.connect(this._dataSourcePanel, "onShow", dojo.hitch(this, function() {
			if (!this._dataSourcePanel.isPopulated()) {
				this._populatePage1();
			}
		})));
	},

	_initPage2: function() {
		var gridSelectColumnsPanel = this._gridSelectColumnsPanel = new GridWizardSelectColumnsPanel({});
		dojo.addClass(gridSelectColumnsPanel.domNode, "wizardPanel");
		this.page2.set("content", this._gridSelectColumnsPanel);
	},

	_initPage3: function() {
		var gridPreviewPanel = this._gridPreviewPanel = new GridWizardPreviewPanel({});
		dojo.addClass(gridPreviewPanel.domNode, "wizardPanel");
        this.page3.set("content", this._gridPreviewPanel);
	},
	
	_createBottomSection: function() {
		var buttonsContentPane = new ContentPane({
			region: "bottom"
		});
		dojo.addClass(buttonsContentPane.domNode, "bottomSection");
		
		var reviewMsg = this.reviewMsg = dojo.create("div");
		dojo.addClass(reviewMsg, "reviewMsg");
		dojo.place(reviewMsg, buttonsContentPane.domNode);
		
		var cancelButton = dojo.create("a");
		dojo.addClass(cancelButton, "cancelButton");
		cancelButton.href = "javascript:void(0);";
		cancelButton.innerHTML = dijitNls.buttonCancel;
		this._connections.push(dojo.connect(cancelButton, "onclick", dojo.hitch(this, function() {
			this.onCancel();
		})));
		dojo.place(cancelButton, buttonsContentPane.domNode); 
		
		var finish = this.finish = dojo.create("button");
		dojo.addClass(finish, "bottomButton");
		finish.innerHTML = gridxNls.finish;
		dojo.place(finish, buttonsContentPane.domNode);
		
		var next = this.next = dojo.create("button");
		dojo.addClass(next, "bottomButton");
		next.innerHTML = gridxNls.next;
		dojo.place(next, buttonsContentPane.domNode);
		
		var prev = this.prev = dojo.create("button");
		dojo.addClass(prev, "bottomButton");
		prev.innerHTML = gridxNls.back;
		dojo.place(prev, buttonsContentPane.domNode);
		
		this._initButtons();
		
		return buttonsContentPane;
	},
	
	_initButtons: function() {
		this.finish = new Button({
			onClick: dojo.hitch(this, function() { this._finish(); }),
		},this.finish);
		dojo.addClass(this.finish.domNode, "bottomButton");
		
		this.next = new Button({
			onClick: dojo.hitch(this, function() { this._forward(); })
		},this.next);
		dojo.addClass(this.next.domNode, "bottomButton");
		
		this.prev = new Button({
			onClick: dojo.hitch(this, function() { this._back(); }),
			disabled: true
		},this.prev);
		dojo.addClass(this.prev.domNode, "bottomButton");
	},
	
	_forward: function() {
		var selectedPage = this.wizardStackContainer.selectedChildWidget;
		
		if (selectedPage === this.page1) {
			if (this._checkValidity(this._dataSourcePanel)) {
				this._populatePage2();
			} else {
				return;
			}
		} else if (selectedPage === this.page2) {
			if (this._checkValidity(this._gridSelectColumnsPanel)) {
				this._populatePage3();
			} else {
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
	
	_checkValidity: function(wizardPane) {
		var result = true;
		var paneValidity = wizardPane.isValid();
		switch(typeof paneValidity){
			case "boolean":
				valid = paneValidity;
				break;
			case "string":
				this._showErrorMessage(paneValidity);
				result = false;
				break;
		}
		return result;
	},
	
	_populatePage1: function() {
		this._dataSourcePanel.populate(this.widgetId, this.page1);
	},
	
	_populatePage2: function() {
		var isDirty = this._dataSourcePanel.isDirty();
		
		if (!this._gridSelectColumnsPanel.isPopulated() || isDirty) {
			//Create callback to receive update command
			var updateCommandCallback = function(compoundCommand) {
				//For now, assuming if anything has changed on data source panel that 
				//we shouldn't pay any attention to current column set-up. But, that's simplistic
				//since user may have just added row or changed cell value.
				this._gridSelectColumnsPanel.populate(this._widget, compoundCommand);
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
	select: function (target) {
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
		
		if (this._dataSourcePanel.isDirty()) {
			//Basically, marking 2nd and 3rd panels as unvisited because
			//the data source has changed
			this._gridSelectColumnsPanel.unpopulate();
			this._gridPreviewPanel.unpopulate();
		} else if (this._gridSelectColumnsPanel.isDirty()) {
			//Mark third panel as unvisited because set of selected
			//columns has changed.
			this._gridPreviewPanel.unpopulate();
		}
		
		//Validate panel 1
		if (!this._checkValidity(this._dataSourcePanel)) {
			return;
		}
		
		// Use callback approach to get the update command before doing onFinish because the first panel may be dirty 
		// or we possibly haven't gotten the command at all yet. The first panel might be dirty if they've changed 
		// data without ever going forward in wizard. OR, if they have gone forward previously, but came back and 
		// changed first panel without going forward again.
		var updateCommandCallback = function(compoundCommand) {
			//Validate panel 2 (if it's populated)
			if (this._gridSelectColumnsPanel.isPopulated() && !this._checkValidity(this._gridSelectColumnsPanel)) {
				return;
			}
			
			//Validate panel 3 (if it's populated)
			if (this._gridPreviewPanel.isPopulated() && !this._checkValidity(this._gridPreviewPanel)) {
				return;
			}
			
			//Everything passed
			this.onFinish();
		}.bind(this);
		this._getUpdateCompoundCommand(updateCommandCallback);
	},
	
	updateWidget: function() {
		var callback = function(compoundCommand) {
			this._updateWidgetHelper(compoundCommand);
		}.bind(this);
		this._getUpdateCompoundCommand(callback);
	},
	
	_updateWidgetHelper: function(compoundCommand) {
		// Making assumption that validity tests have already passed... AND if data source panel
		// had been dirty when Finish was pressed that an updated command had been
		// retrieved before onFinish was called.
		
		// We need to deal with case if Finish was pressed before getting to the 2nd and/or 3rd panels
		var modifiedHeaderElements = null;
		var selectedColumnIds = null;
		if (this._gridPreviewPanel.isPopulated()) {
			//Assuming _gridPreviewPanel can only be populated if _gridSelectColumnsPanel has been populated
			modifiedHeaderElements = this._gridPreviewPanel.getUpdatedColumnStructure();
		} else if (this._gridSelectColumnsPanel.isPopulated()) {
			selectedColumnIds = this._gridSelectColumnsPanel.getSelectedColumnIds();
		}
		
		//Making assumption the last command is the one for upgrading the grid itself
		var lastCommand = compoundCommand._commands[compoundCommand._commands.length-1]; 
		
		if (modifiedHeaderElements || selectedColumnIds) {
			//We're going to need to update the structure in the command before
			//executing it...
			
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
			
			var newHeaderElements = null;
			var newStructure = null;
			if (modifiedHeaderElements) {
				// We've got data from Panel 3, so go through the structure and header elements of
				// the command and update based on that data. Assuming 1-to-1 match with structure
				// elements and headers.
				newHeaderElements = [];
				newStructure = [];
				dojo.forEach(modifiedHeaderElements, function(modifiedHeaderElement) {
					var count = 0;
					dojo.some(currentHeaderElements, function(currentHeaderElement) {
						if (modifiedHeaderElement.field === currentHeaderElement.properties.field) {
							var currentStructureElement = currentStructure[count];
			
							//create new header element
							var newHeaderElement = dojo.clone(currentHeaderElement);
							newHeaderElement.properties.width = modifiedHeaderElement.width;
							newHeaderElement.properties.name = modifiedHeaderElement.name;
							
							//create new structure element
							var newStructureElement = dojo.clone(currentStructureElement);
							newStructureElement.width = modifiedHeaderElement.width; 
							newStructureElement.name = modifiedHeaderElement.name; 
							
							//Add new elements to new arrays
							newHeaderElements.push(newHeaderElement);
							newStructure.push(newStructureElement);
						}
						//Update counter
						count++;
					});
				});
			} else if (selectedColumnIds) {
				// We've got data from Panel 2, so go through just pick out headers and structure
				// elements that the selected ids.
				newHeaderElements = [];
				newStructure = [];
				dojo.forEach(selectedColumnIds, function(selectedColumnId) {
					var count = 0;
					dojo.some(currentHeaderElements, function(currentHeaderElement) {
						if (selectedColumnId === currentHeaderElement.properties.field) {
							var currentStructureElement = currentStructure[count];
			
							//Add elements to new arrays
							newHeaderElements.push(currentHeaderElement);
							newStructure.push(currentStructureElement);
						}
						//Update counter
						count++;
					});
				});
			}
			
			//Transfer new into old data structure
			if (newHeaderElements && newStructure) {
				tRow.children = newHeaderElements;
				lastCommand._properties.structure = newStructure;
			}
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
		
		//Clean up subscriptions
		this._subs.forEach(dojo.unsubscribe);
		delete this._subs; 
		
		//Clean up connections
		this._connections.forEach(dojo.disconnect);
		delete this._connections;
	}
});
});
