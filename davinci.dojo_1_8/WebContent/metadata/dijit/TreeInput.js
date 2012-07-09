define(
[
	"dojo/_base/declare", 
	"davinci/Runtime",
	"./layout/ContainerInput", 
	"davinci/ve/widget", 
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/ModifyAttributeCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/ve/widgets/EventSelection",
	"davinci/ve/widgets/BackgroundDialog",
	"davinci/ve/utils/CssUtils",
	"dijit/Tree",
	"dojo/store/Memory",
	"dojo/store/Observable",
	"dijit/tree/ObjectStoreModel", 
	"dijit/tree/dndSource",
	"dojo/text!./templates/treeInput.html",
	"davinci/css!./templates/treeInput.css",
	"dojo/i18n!./nls/dijit", 
	"dojo/i18n!dijit/nls/common",
	"dijit/layout/ContentPane", //used in template
	"dijit/layout/BorderContainer", //used in template
	"dijit/layout/LayoutContainer", //used in template
	"dijit/form/Button", //used in template
	"dijit/Toolbar", //used in template
	"dijit/ToolbarSeparator", //used in template
	"dijit/form/TextBox", //used in template
	"dijit/form/ComboBox", //used in template
	"davinci/ve/widgets/MetaDataStore", //used in template,
	"davinci/ui/widgets/FileFieldDialog" //user in template
],
function(declare, 
		Runtime,
		ContainerInput, 
		Widget,
		ModifyCommand,
		ModifyAttributeCommand,
		OrderedCompoundCommand,
		EventSelection,
		BackgroundDialog,
		CssUtils,
		Tree,
		Memory,
		Observable,
		ObjectStoreModel,
		dndSource,
		mainTemplateString,
		cssForTemplate,
		langObj, 
		dijitLangObj) {

/*
 * Subclassing Memory so we can support dnd and other desired operations (while maintaining order) in
 * the preview tree.
 */
var CustomMemory = declare(Memory, {
	//Needed by trees
	getChildren: function(object) {
		return this.query({parent: object.id});
	},
	
	// Need to override put to support DnD and node ordering
	put: function(object, options){
	    if(options) {
	    	// Per tree example online:
    		// 	To support DnD, the store must support put(child, {parent: parent}).
    		//	Since memory store doesn't, we hack it.
    		//	Since our store is relational, that just amounts to setting child.parent
    		//	to the parent's id. 
	    	if (options.parent){
	    		object.parent = options.parent.id;
	    		
	    		//Another hack to cause items moved into a new parent to show up as the 
	    		//last child of the parent
	    		if (!options.before) {
	    			this.remove(object.id);
	    		}
	    	}
	    	
	    	// What the examples don't tell you is that to support betweenThreshold on the tree
	   	 	// (and support setting the order of nodes), we also need to deal with the "before"
	    	// attribute (passed in by model's newItem and pasteItem implementations). So, hacking that
	    	// in as well.
	    	if (options.before) {
	    		data = this.data;
				index = this.index,
				idProperty = this.idProperty;
	    		var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
	    		if(id in index){					
					//Remove the object from its current position
					this.remove(id);
	    		}
				//Insert/add it in right position
	    		index = this.index; //there's a re-index after the remove operation
	    		var beforeRefId = options.before.id;
				if(beforeRefId in index){
					//carve out a spot for the new item
					data.splice(index[beforeRefId], 0, object);
					// now we have to reindex
					this.setData(data);
				}
	    	}
	    }
	    return this.inherited(arguments);
	}
});

/*
 * Subclassing Tree so we can show custom icons in the preview.
 */
var CustomTree = declare(Tree, {
	treeInput: null,
	
	//Need to be able to preview icon settings so attach function to tree
	getIconStyle: function(item, opened) {
		var iconStyleFieldId = item.iconStyle ? "iconStyle" : null;
		if (opened && item.iconStyleOpen) {
			iconStyleFieldId = "iconStyleOpen";
		}
		if (iconStyleFieldId) {
			var urlInside = this.treeInput._getDisplayValueFromStore(iconStyleFieldId, item);
			var urlValue = BackgroundDialog.getCSSForWorkspaceURL(this.treeInput._getBaseLocation(), urlInside);
			return {
				backgroundImage: urlValue
			}; 
		} 
		return this.inherited(arguments);
	}
});

/*
 * Subclassing ObjectStoreModel so we can support dnd and other desired operations (while maintaining order) in
 * the preview tree.
 */
var CustomObjectStoreModel = declare(ObjectStoreModel, {
	newItem: function(/* dijit/tree/dndSource.__Item */ args, /*Item*/ parent, /*int?*/ insertIndex, /*Item*/ before){
		//Call superclass
		this.inherited(arguments);
	
		//Add hack to notify tree that parent's children have changed (so ordering can be maintained)
		this._parentChildrenChanged(parent);
	},
	
	pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem,
			/*Boolean*/ bCopy, /*int?*/ insertIndex, /*Item*/ before){
		//Call superclass
		this.inherited(arguments);
		
		
		//Add hack to notify tree that new parent's children have changed (so ordering can be maintained)
		if (newParentItem && (oldParentItem != newParentItem)) {
			this._parentChildrenChanged(newParentItem);
		} else {
			this._parentChildrenChanged(oldParentItem);
		}
	},
	
	_parentChildrenChanged: function(parent) {
		delete this.childrenCache[this.getIdentity(parent)];
		var onComplete = function(children) {
			this.onChildrenChange(parent, children);
		}.bind(this);
		var onError = function() {
			console.error("CustomObjectStoreModel._parentChildrenChanged: problem getting children for parent = " + this.getIdentity(parent));
		};
		this.getChildren(parent, onComplete, onError);
	}
});

/*
 * Declaration for TreeInput dialog
 */
return declare(ContainerInput, {

	_substitutedMainTemplate: null,
	
   	constructor: function(model){
		this._nodePropWidgetMetadata = [
       		{widgetId: "treeInputLabelInput", fieldId: "name", type: "label"},
			{widgetId: "treeInputIconInput", fieldId: "iconStyle", type: "icon"},
			{widgetId: "treeInputOpenIconInput", fieldId: "iconStyleOpen", type: "icon"},
			{widgetId: "treeOnClickInput", fieldId: "onClick", type: "event"},
			{widgetId: "treeOnDblClickInput", fieldId: "onDblClick", type: "event"},
			{widgetId: "treeOnCloseInput", fieldId: "onClose", type: "event"},
			{widgetId: "treeOnOpenInput", fieldId: "onOpen", type: "event"}
       	 ];
	},
	
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);

		if (!this._inline) {
			//Set up the dialog
			this._inline = new dijit.Dialog({
				title: langObj.treeDialog,
				"class": "treeInputDialog"
			});
			this._inline.onCancel = dojo.hitch(this, "onCancel");
			this._inline.callBackObj = this;
			
			//Get template for dialog contents
			var s = this._getTemplate();
		
			//Set content
			this._inline.set("content", s);
			this._inline.show();

			//Configure inputs
			this._configureInputControls();
			
			//Configure listeners for OK/Cancel buttons
			var okButton = dijit.byId('treeInputOkButton');
			this._connection.push(dojo.connect(okButton, 'onClick', function(){
				if (this._isNodePropertyInputValid()) {
					this.updateWidget();
					this.onOk();
				}
			}.bind(this)));
			var cancelButton = dijit.byId('treeInputCancelButton');
			this._connection.push(dojo.connect(cancelButton, 'onClick', function(){
				this.onCancel();
			}.bind(this)));
			if (this._widget.inLineEdit_displayOnCreate){
				// hide cancel on widget creation #120
				delete this._widget.inLineEdit_displayOnCreate;
				dojo.style(cancelButton.domNode, "display", "none");
			}
			
			//Reset node counter for id generation
			this._currentId = 0;
			
			//Update toolbar button enablement
			this._updateToolbarButtonEnablement();
		}
	},
	
	_configureInputControls: function() {
		//Look up model
		var modelWidget = Widget.byId(this._widget._srcElement.getAttribute("model"));
		var modelWidgetData = modelWidget.getData();
		
		//Look up store
		var storeWidget = Widget.byId(modelWidget._srcElement.getAttribute("store"));
		var dataStr = storeWidget._srcElement.getAttribute("data");
		var data = JSON.parse(dataStr);
		
		//Get tree's data
		var treeWidgetData = this._widget.getData();
		
		//Create the backing Memory widget (e.g., the "store")
		var previewStore = new CustomMemory({
			data: data
		});		
		
		//wrap store with Observable so we can update the tree
		var observablePreviewStore = this._observablePreviewStore = new Observable(previewStore);
		
		//Create model for preview
		var previewModel = this._previewModel = new CustomObjectStoreModel({
			query: JSON.parse(modelWidgetData.properties.query),
			store: observablePreviewStore
		});
		
		//Create the tree
		var previewTree = this._previewTree = new CustomTree({
			showRoot: false,
			autoExpand: treeWidgetData.properties.autoExpand,
			model: previewModel,
			dndController: dndSource,
            betweenThreshold: 5,
            //For our custom tree
            treeInput: this
		});
		
		var previewPanelGridContentPane = dijit.byId("previewPanelGridContentPane");
		previewPanelGridContentPane.set("content", previewTree);
		
		//listen for selection changes
		this._connection.push(previewTree.watch("selectedItems", function (prop, oldValue, newValue) {
			this._handleSelectionChanged(newValue);
		}.bind(this)));
		
		//Set up the toolbar buttons for tree manipulations
		this._setupToolbarButtons();

		//Set up widgets in node properties section
		this._setupNodePropertyInputs();
	},
	
	_setupToolbarButtons: function() {
		var previewStore = this._observablePreviewStore;
		
		//New child button
		var treeInputNewButton = dijit.byId('treeInputAddChildButton');
		this._connection.push(dojo.connect(treeInputNewButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			this._addItem(this._selectedItem);
		}.bind(this)));
		
		//Insert before button
		var treeInputInsertBeforeButton = dijit.byId('treeInputInsertBeforeButton');
		this._connection.push(dojo.connect(treeInputInsertBeforeButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			if (this._selectedItem) {
				this._addItem(previewStore.get(this._selectedItem.parent), this._selectedItem);
			}
		}.bind(this)));
		
		//Insert after button
		var treeInputInsertAfterButton = dijit.byId('treeInputInsertAfterButton');
		this._connection.push(dojo.connect(treeInputInsertAfterButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			var selectedItem = this._selectedItem;
			if (selectedItem) {
				var itemAfterSelectedItem = this._getItemAfter(selectedItem, true);
				var parent = previewStore.get(selectedItem.parent);
				this._addItem(parent, itemAfterSelectedItem);
			}
		}.bind(this)));

		//Delete button
		var treeInputDeleteButton = dijit.byId('treeInputDeleteButton');
		this._connection.push(dojo.connect(treeInputDeleteButton, 'onClick', function(){
			if (this._selectedItem) {
				//Determine the item we want to select after the removal (first trying to
				//see if itemAfter
				var referenceItem = this._getItemAfter(this._selectedItem);
				if (!referenceItem) {
					referenceItem = this._getItemBefore(this._selectedItem);
				}
				
				//Remove the item and its children
				this._removeItemAndChildren(this._selectedItem);
				
				//Select (and make visible) the reference item
				if (referenceItem) {
					this._selectAndScrollToItem(referenceItem);	
				}
			}
		}.bind(this)));
		
		//Move up button
		var treeInputMoveUpButton = dijit.byId('treeInputMoveUpButton');
		this._connection.push(dojo.connect(treeInputMoveUpButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			var selectedItem = this._selectedItem;
			if (selectedItem) {
				var itemBefore = this._getItemBefore(selectedItem);
				if (itemBefore) {
					var oldParentItem = previewStore.get(selectedItem.parent);
					var newParentItem = previewStore.get(itemBefore.parent);
					this._moveItem(selectedItem, oldParentItem, newParentItem, itemBefore);
				}
			}
		}.bind(this)));
		
		//Move down button
		var treeInputMoveDownButton = dijit.byId('treeInputMoveDownButton');
		this._connection.push(dojo.connect(treeInputMoveDownButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			var selectedItem = this._selectedItem;
			if (selectedItem) {
				var itemAfter = this._getItemAfter(selectedItem);
				if (itemAfter) {
					//Get the item after again because we really want to insert what's after the original itemAfter
					itemAfter = this._getItemAfter(itemAfter);
				}
				var oldParentItem = previewStore.get(selectedItem.parent);
				var newParentItem = itemAfter ? previewStore.get(itemAfter.parent) : oldParentItem;
				this._moveItem(selectedItem, oldParentItem, newParentItem, itemAfter);
			}
		}.bind(this)));
		
		//Shift left
		var treeInputShiftLeftButton = dijit.byId('treeInputShiftLeftButton');
		this._connection.push(dojo.connect(treeInputShiftLeftButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			var selectedItem = this._selectedItem;
			if (selectedItem) {
				var oldParentItem = previewStore.get(selectedItem.parent);
				var newParentItem = previewStore.get(oldParentItem.parent);
				var itemAfterOldParent = this._getItemAfter(oldParentItem, true);
				this._moveItem(selectedItem, oldParentItem, newParentItem, itemAfterOldParent);
			}
		}.bind(this)));
		
		//Shift right
		var treeInputShiftRightButton = dijit.byId('treeInputShiftRightButton');
		this._connection.push(dojo.connect(treeInputShiftRightButton, 'onClick', function(){
			if (!this._isNodePropertyInputValid()) {
				return;
			}
			
			var selectedItem = this._selectedItem;
			if (selectedItem) {
				var itemBefore = this._getItemBefore(selectedItem, true);
				if (itemBefore) {
					var oldParentItem = previewStore.get(selectedItem.parent);
					var newParentItem = itemBefore;
					this._moveItem(selectedItem, oldParentItem, newParentItem);
				}
			}
		}.bind(this)));	
	},
	
	//Update toolbar button enablement
	_updateToolbarButtonEnablement: function() {
		var previewStore = this._observablePreviewStore;
		
		//New child button
		var treeInputNewButton = dijit.byId('treeInputAddChildButton');
		var enabled = true; //always enabled
		treeInputNewButton.set("disabled", !enabled);
		
		//Insert before button
		var treeInputInsertBeforeButton = dijit.byId('treeInputInsertBeforeButton');
		enabled = this._selectedItem; 
		treeInputInsertBeforeButton.set("disabled", !enabled);
		
		//Insert after button
		var treeInputInsertAfterButton = dijit.byId('treeInputInsertAfterButton');
		enabled = this._selectedItem; 
		treeInputInsertAfterButton.set("disabled", !enabled);

		//Delete button
		var treeInputDeleteButton = dijit.byId('treeInputDeleteButton');
		enabled = this._selectedItem; 
		treeInputDeleteButton.set("disabled", !enabled);
		
		//Move up button
		var treeInputMoveUpButton = dijit.byId('treeInputMoveUpButton');
		enabled = false;
		if (this._selectedItem) {
			var itemBefore = this._getItemBefore(this._selectedItem);
			enabled = this._selectedItem && itemBefore && previewStore.getIdentity(itemBefore) != "treeRoot";
		}
		treeInputMoveUpButton.set("disabled", !enabled);
		
		//Move down button
		var treeInputMoveDownButton = dijit.byId('treeInputMoveDownButton');
		enabled = false;
		if (this._selectedItem) {
			enabled = this._selectedItem && this._getItemAfter(this._selectedItem);
		}
		treeInputMoveDownButton.set("disabled", !enabled);
		
		//Shift left
		var treeInputShiftLeftButton = dijit.byId('treeInputShiftLeftButton');
		enabled = false;
		if (this._selectedItem) {
			var oldParentItem = previewStore.get(this._selectedItem.parent);
			var newParentItem = previewStore.get(oldParentItem.parent);
			enabled = this._selectedItem && newParentItem;
		}
		treeInputShiftLeftButton.set("disabled", !enabled); 
		
		//Shift right
		var treeInputShiftRightButton = dijit.byId('treeInputShiftRightButton');
		enabled = false;
		if (this._selectedItem) {
			itemBefore = this._getItemBefore(this._selectedItem, true);
			enabled = this._selectedItem && itemBefore && previewStore.getIdentity(itemBefore) != "treeRoot";
		}
		treeInputShiftRightButton .set("disabled", !enabled); 
	},
	
	_getItemAfter: function(item, sameParent) {
		var previewStore = this._observablePreviewStore;
		var itemAfter = null;
		var parent = previewStore.get(item.parent); 
		if (parent) {
			var parentChildren = previewStore.getChildren(parent);
			var count = 0;
			dojo.some(parentChildren, function(child) {
				if (previewStore.getIdentity(child) == previewStore.getIdentity(item)) {
					return true;
				}
				count++;
			});
			if (count < parentChildren.length - 1) {
				itemAfter = parentChildren[count + 1];
			} else if (!sameParent) {
				itemAfter = this._getItemAfter(parent);
				if (itemAfter) {
					return this._getItemAfter(itemAfter);
				}
			}
		}
		return itemAfter;
	},
	
	_getItemBefore: function(item, sameParent) {
		var previewStore = this._observablePreviewStore;
		var itemBefore = null;
		var parent = previewStore.get(item.parent); 
		if (parent) {
			var parentChildren = previewStore.getChildren(parent);
			var count = 0;
			dojo.some(parentChildren, function(child) {
				if (previewStore.getIdentity(child) == previewStore.getIdentity(item)) {
					return true;
				}
				count++;
			});
			if (count > 0) {
				itemBefore = parentChildren[count - 1];
			} else if (!sameParent) {
				itemBefore = parent;
			}
		}
		return itemBefore;
	},
	
	_addItem: function(parent, before) {
		var previewStore = this._observablePreviewStore;
		var previewModel = this._previewModel;
		
		var newId = this._getUniqueId();
		var newItem = {
			id: newId,
			name: dojo.replace(langObj.newNodeName, [newId])
		};
		previewModel.newItem(newItem, 
				parent ? parent : previewStore.get("treeRoot"), 
				-1, 
				before);		

		//Build up the full path (from root) to the new item and select it
		this._selectAndScrollToItem(newItem);
	},
	
	_removeItemAndChildren: function(item) {
		var previewStore = this._observablePreviewStore;
		var identity = previewStore.getIdentity(item);
		previewStore.remove(identity);
		
		//calling remove just removes a single item, so try to remove orphans
		var orphans = previewStore.query({parent: identity});
		dojo.forEach(orphans, function(orphan) {
			//recurse
			this._removeItemAndChildren(orphan);
		}.bind(this));
	},
	
	_moveItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Item*/ before) {
		var previewModel = this._previewModel;

		previewModel.pasteItem(childItem, oldParentItem, newParentItem, false, -1, before);
		
		//Build up the full path (from root) to the new item and select it
		this._selectAndScrollToItem(childItem);
	},
	
	//Generate a unique id for a new item
	_getUniqueId: function() {		
		//Increment id counter
		this._currentId++;
		
		//Keep incrementing counter until we find one that doesn't match an existing item
		while (this._observablePreviewStore.get(this._currentId.toString())) {
			this._currentId++;
		}
		
		//return the id
		return this._currentId.toString();
	},
	
	_selectAndScrollToItem: function(newItem) {
		var previewStore = this._observablePreviewStore;
		var previewTree = this._previewTree;
		
		var path = [];
		var item = newItem;
		while (item) {
			path.unshift(item.id);
			if (item.parent) {
				item = previewStore.get(item.parent);
			} else {
				item = null;
			}
		}
		previewTree.set("path", path).then(
			// After path is set, let's do a focusNode to make
			// sure new item is scrolled into view (if
			// necessary)
			function(items) {
				var item = items[0][items[0].length - 1];
				previewTree.focusNode(item);
			});
	},
	
	_handleSelectionChanged: function(selectedItems) {
		// We don't want to allow node selection change if they've entered bad data for currently
		// selected node, so re-select the previous node and abort
		if (this._selectedItem && !this._isNodePropertyInputValid()) {
			return;
		}
		
		if (selectedItems.length == 1) {
			//Keep track of what item was selected
			this._selectedItem = selectedItems[0];
			
			//Fill in props
			this._populateNodeProperties();
		} else {
			//Either nothing is selected or multiple items are selected, so...
			
			//Clear our record of what was selected
			this._selectedItem = null;
			
			//Reset the column props area
			this._clearNodeProperties();
		}
		
		//Update toolbar button enablement
		this._updateToolbarButtonEnablement();
	},
	
	_setupNodePropertyInputs: function() {
		// Set base location on the FileFieldDialog, so the project name is not part
		// of the path put in the file text box
		var iconInput = dijit.byId("treeInputIconInput");
		iconInput.set("baseLocation", this._getBaseLocation());
		iconInput.set("intermediateChanges", true);
		iconInput = dijit.byId("treeInputOpenIconInput");
		iconInput.set("baseLocation", this._getBaseLocation());
		iconInput.set("intermediateChanges", true);
		
		//Add state items to combo box fields in node props section
		dojo.forEach(this._nodePropWidgetMetadata, function(nodePropWidget) {
			if (nodePropWidget.type === "event") {
				this._addOptionsForEventField(nodePropWidget.widgetId);
			}
		}.bind(this));
		
		//Listen for changes to the input fields in the node props section
		dojo.forEach(this._nodePropWidgetMetadata, function(nodePropWidget) {
			this._setupTextFieldChangeListener(nodePropWidget.widgetId, nodePropWidget.fieldId);
		}.bind(this));
	},
	
	_getBaseLocation: function() {
		return this._widget._edit_context._srcDocument.fileName;
	},
	
	_setupTextFieldChangeListener: function(textFieldId, fieldId) {
		var textField = dijit.byId(textFieldId);
		this._connection.push(dojo.connect(textField,
				"onChange", function(newValue) {
					this._handleTextFieldChanged(fieldId, newValue);
				}.bind(this)));
	},
	
	_clearNodeProperties: function() {
		//Clear and disable property fields
		var treeInputFieldOutput = dojo.byId("treeInputFieldOutput");
		treeInputFieldOutput.innerHTML = "";
		
		dojo.forEach(this._nodePropWidgetMetadata, function(nodePropWidget) {
			this._populateNodeProperty(nodePropWidget.widgetId, "", true);
		}.bind(this));
	},
	
	_populateNodeProperties: function() {
		var selectedItem = this._selectedItem;
		if (selectedItem) {
			//Fill and enable property fields
			var treeInputFieldOutput = dojo.byId("treeInputFieldOutput");
			treeInputFieldOutput.innerHTML = this._selectedItem.id;
			
			dojo.forEach(this._nodePropWidgetMetadata, function(nodePropWidget) {
				var value = this._getDisplayValueFromStore(nodePropWidget.fieldId, selectedItem);
				this._populateNodeProperty(nodePropWidget.widgetId, value, false);
			}.bind(this));
		}
	},
	
	_populateNodeProperty: function(fieldWidgetId, value, disabled) {
		var fieldWidget = dijit.byId(fieldWidgetId);
		fieldWidget.set("value", value ? value : "");
		fieldWidget.set("disabled", disabled ? disabled : false);
	},
	
	_addOptionsForEventField: function(fieldWidgetId) {
		var items = EventSelection.getEventSelectionValues(this._widget.getContext().rootNode);
		var inputField = dijit.byId(fieldWidgetId);
		var store = inputField.get("store");
		store.setValues(items);
	},
	
	_handleTextFieldChanged: function(fieldId, newValue) {
		if (this._selectedItem) {
			var value = this._getFieldValueToStore(fieldId, newValue);
			this._selectedItem[fieldId] = value;
			this._observablePreviewStore.put(this._selectedItem);
		}
	},
	
	_getFieldValueToStore: function(fieldId, value) {
		if (value && value.trim() != "") {
			if (this._getWidgetTypeFromFieldId(fieldId) === "icon") {
				var backgroundImageURL = 'url(\'' + value + '\')';
				
				//Really just care about file name now, but trying to position ourselves to handle other
				//style attributes storing as a JSON object
				var jsonStyle = {};
				jsonStyle["background-image"] = backgroundImageURL ;
	
				value = jsonStyle;
			} else if (this._getWidgetTypeFromFieldId(fieldId) === "event") {
				value = EventSelection.getEventScriptFromValue(value);
			}
		} else {
			//Let's not put empty values into the store
			value = null;
		}
		
		return value;
	},
	
	_getWidgetTypeFromFieldId: function(fieldId) {
		var returnVal = null;
		dojo.some(this._nodePropWidgetMetadata, function(nodePropWidget) {
			if (nodePropWidget.fieldId == fieldId) {
				returnVal = nodePropWidget.type;
				return true;
			}
		}.bind(this));
		return returnVal;
	},
	
	_getDisplayValueFromStore: function(fieldId, item) {
		var value = item[fieldId];
		if (value) {
			if (this._getWidgetTypeFromFieldId(fieldId) === "icon") {
				var backgroundImage = value["background-image"];
				if (backgroundImage) {
					var bgdData = CssUtils.parseBackgroundImage(backgroundImage);
					value = (bgdData && bgdData.url) ? bgdData.url : "";
				}
			} else if (this._getWidgetTypeFromFieldId(fieldId) === "event") {
					value = EventSelection.getValueFromEventScript(value);
			}
		}
		
		return value;
	},
	
	hide: function(cancel) {
		if (this._inline) {
			//Clean up connections
			var connection;
			while (connection = this._connection.pop()){
				dojo.disconnect(connection);
			}
			
			//Destroy dialog and widgets
			this._inline.destroyRecursive();
			delete this._inline;
		}
		this.inherited(arguments);
	},
	
	//Updates underlying Dijit Tree
	updateWidget: function() {		
		var compoundCommand = new OrderedCompoundCommand();

		var modelWidget = Widget.byId(this._widget._srcElement.getAttribute("model"));
		var storeWidget = Widget.byId(modelWidget._srcElement.getAttribute("store"));
		
		var userModifiedStoreData = this._observablePreviewStore.data;

		var props= {
			data: userModifiedStoreData
		};
		var command = new ModifyCommand(storeWidget, props);
		compoundCommand.add(command);

		// create the store and model (which must be created in context of page)
		var global = this._widget.getContext().getGlobal();
		global['require']([
			"dojo/store/Memory", 
			"dijit/tree/ObjectStoreModel",
		], function(MemoryPage, ObjectStoreModelPage) {
			//modify the modelWidget using a new store
			var newMemoryProps = {
				data: props.data
			};
			var newStore = new MemoryPage(newMemoryProps);
			newStore.getChildren = function(object) {return this.query({parent: object.id});};
			var newModelProps = {
				store: newStore
			};
			var command = new ModifyCommand(modelWidget, newModelProps);
			compoundCommand.add(command);
		
			//modify the tree using new model
			var newModel = new ObjectStoreModelPage({
				query: JSON.parse(modelWidget.getData().properties.query),
				store: newStore
			});
			newModel.id = modelWidget.id;
		
			var newTableProps = {
				model: newModel
			};
			command = new ModifyCommand(this._widget, newTableProps, this._getUpdatedTreeChildren(this._widget));
			compoundCommand.add(command);
			
			// Need the actual store object in the ModifyCommand, but now need to change to id
			// so it get's put out in source correctly
			command = new ModifyAttributeCommand(modelWidget, {store: storeWidget.id});
			compoundCommand.add(command);
			
			// Need the actual model object in the ModifyCommand, but now need to change to id
			// so it get's put out in source correctly
			command = new ModifyAttributeCommand(this._widget, {model: modelWidget.id});
			compoundCommand.add(command);
		
			//Execute the command
			this._executeCommand(compoundCommand);
		}.bind(this));
	},
	
	_getUpdatedTreeChildren: function(widget) {
		var children = [];
		
		//need <script> block for getIconStyle
		var jsString = 
			"var iconStyle = item.iconStyle;" +
			"if (opened && item.iconStyleOpen) {" +
			"	iconStyle = item.iconStyleOpen;" +
			"};" + 
			"return iconStyle;";
		children.push(this._createScriptBlockData("dojo/method", "getIconStyle", "item, opened", jsString));
		
		//need <script> block for onClick
		jsString = this._getJavaScriptForTreeEvent("onClick");
		children.push(this._createScriptBlockData("dojo/connect", "onClick", "item, node, evt", jsString));
		
		//need <script> block for onDblClick
		jsString = this._getJavaScriptForTreeEvent("onDblClick");
		children.push(this._createScriptBlockData("dojo/connect", "onDblClick", "item, node, evt", jsString));
		
		//need <script> block for onClose
		jsString = this._getJavaScriptForTreeEvent("onClose");
		children.push(this._createScriptBlockData("dojo/connect", "onClose", "item, node", jsString));
		
		//need <script> block for onOpen
		jsString = this._getJavaScriptForTreeEvent("onOpen");
		children.push(this._createScriptBlockData("dojo/connect", "onOpen", "item, node", jsString));

		return children;
	},
	
	_createScriptBlockData: function(methodType, dojoEvent, argNames, jsString) {
		var data = {
			type: "html.script",
			properties: {
				type: methodType
			},
			children: jsString
		};
		data.properties["data-dojo-event"] = dojoEvent;
		data.properties["data-dojo-args"] = argNames;
		return data;
	},
	
	_getJavaScriptForTreeEvent: function(eventType) {
		var jsString = 
			"if (item." + eventType + ") { " +
			"	dojo.eval(item." + eventType + ");" +
			"};";
		return jsString;
	},
	
	_executeCommand: function(compoundCommand) {
		var context = this._getContext();
		
		//Execute command
		context.getCommandStack().execute(compoundCommand);
		
		//Find and select the new table widget
		dojo.some(compoundCommand._commands, function(command) {
			if (command.newWidget && command.newWidget.type === "dijit.Tree") {
				context.select(command.newWidget);
				return true;
			}
		});
	},
	
	_isNodePropertyInputValid: function() {
		return true;
	},
	
	_getTemplate: function() {
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
					preview: langObj.preview,
					previewNote: langObj.previewNote,
					nodeProperties: langObj.nodeProperties,
					idLabel: langObj.idLabel,
					labelLabel: langObj.labelLabel,
					iconLabel: langObj.iconLabel,
					openIconLabel: langObj.openIconLabel,
					onClickLabel: langObj.onClickLabel,
					onDblClickLabel: langObj.onDblClickLabel,
					onCloseLabel: langObj.onCloseLabel,
					onOpenLabel: langObj.onOpenLabel,
					addChild: langObj.addChild,
					insertBefore: langObj.insertBefore,
					insertAfter: langObj.insertAfter,
					remove: langObj.remove,
					moveUp: langObj.moveUp,
					moveDown: langObj.moveDown,
					shiftLeft: langObj.shiftLeft,
					shiftRight: langObj.shiftRight,
					buttonOk: dijitLangObj.buttonOk,
					buttonCancel: dijitLangObj.buttonCancel,
				});
		}
			
		return this._substitutedMainTemplate;
	}
});
});