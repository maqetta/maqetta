/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define([
	"davinci/ve/widget",
	"davinci/ve/commands/RemoveCommand",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/ReparentCommand"
], function(
	Widget,
	RemoveCommand,
	CompoundCommand,
	ReparentCommand
) {

	var Helper = function() {};
	Helper.prototype = {

		/**
		 * NOTE: Only applies to widgets of class "dijit".
		 * @param {davinci/ve/DijitWidget} widget        [description]
		 * @param {dijit/_Widget} dijitWidget [description]
		 * @param {Number} index       [description]
		 */
		addChild: function(widget, dijitWidget, index) {},

		/**
		 * [checkValue description]
		 * @param  {*} value [description]
		 * @return {*}       [description]
		 */
		checkValue: function(value) {},

		/**
		 * [chooseParent description]
		 * @param  {Object[]} allowedParentList [description]
		 * @return {Object}                   [description]
		 */
		chooseParent: function(allowedParentList) {},

		/**
		 * [cleanSrcElement description]
		 * @param  {davinci/html/HTMLElement} srcElement [description]
		 */
		cleanSrcElement: function(srcElement) {},

		/**
		 * Invoked when adding a new widget to the page; when changing properties on a widget (and
		 * the widget is recreated); or for each widget when loading a page into the visual editor.
		 *
		 * XXX The following sounds like it is describing CreateTool.create ---
		 * Use this method for complex widget creation. An example would be a widget that 
		 * has associated widget like data stores
		 *
		 * XXX In which situations would someone use this instead of CreateTool.create()?
		 *
		 * XXX This is invoked from _Widget.attach().  Rename to "attach"?
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 *             the widget instance that is being created
		 * @param  {davinci/html/HTMLElement} srcElement
		 *             HTML model element corresponding to widget instance
		 */
		create: function(widget, srcElement) {

			try{
				/*
				 * Find the widget that is associated with widget be created.
				 */
				var storeId = "";
				if (widget.dijitWidget && widget.dijitWidget.store) {
					var store = widget.dijitWidget.store;
					storeId = store.id ? store.id : store._edit_object_id;
				}
				if(storeId){
					/*
					 * we may have the store as an object, stores must be 
					 * created before the widgets that use them
					 * So lets make sure this store is defined in the document 
					 * before the widget we are create.
					 */
					
					dojo.withDoc(widget.getContext().getDocument(), function(){
						var assocatedWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
						if (assocatedWidget && widget.dijitWidget && widget.dijitWidget.store){
							/*
							 * Now that we have the associated widget lets find where to move it to
							 */
							var parent = widget.getParent();
							var assocatedParent = assocatedWidget.getParent();
							var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
							var i = parent.indexOf(widget);
							var x = assocatedParent.indexOf(assocatedWidget);
							if ((parent === assocatedParent) && (i < x )){ // same parent
								newIndex = parent.indexOf(widget);
							} else if (parent != assocatedParent) {
								newIndex = i;
							}
							/*
							 * We do not need to add this to the command stack, but we can use the ReparentCommand 
							 * for code reuse. 
							 */
							var command = new ReparentCommand(assocatedWidget, parent, newIndex);
							command.execute();
						}
					}.bind(this));
				}
				
			} 
			catch (e) {
				console.error('Helper.Create error processing tree.');
			}
		},

		/**
		 * [destroy description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		destroy: function(widget) {},

		/**
		 * [disableDragging description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {boolean}        [description]
		 */
		disableDragging: function(widget) {},

		/**
		 * Override the default action, which is to return all "widgets" that are children of the
		 * container node belonging to 'widget' (the container node is the value returned by
		 * 'widget.getContainerNode()').  This function is called to display the child widgets in
		 * the Outline view, for example.
		 *
		 * Implement this function for widgets whose children are not neatly encapsulated in the
		 * container node.
		 *
		 * XXX The helper func should not have to deal with 'attach'. That's an internal Maqetta
		 *     detail, and should be handled after calling this func.
		 * 
		 * @param  {davinci/ve/_Widget} widget  the widget instance
		 * @param  {boolean} attach if true attach widgets to this child node.
		 *             If true, function must "attach" child widget nodes by calling 
		 *             'require("davinci/ve/widget").getWidget(node)'.
		 * 
		 * @return {davinci/ve/_Widget[]}  array of child widgets
		 */
		getChildren: function(widget, attach) {
			var children = [];

			// Dijit specific code here.  We only want items inside the box node, and not
			// the label node (for now).
			if (widget && widget.dijitWidget && widget.dijitWidget.box) {
				dojo.forEach(widget.dijitWidget.box.children, function(node) {
					// the label
					if(dojo.hasClass(node, "mblListItemLabel")) {
						return;
					}
					if (attach) {
						children.push(require("davinci/ve/widget").getWidget(node));
					} else {
						var widget = node._dvWidget;
						if (widget) {
							children.push(widget);
						}
					}
				});
			}

			return children;
		},
		
		/**
		 * Override the default implementation of 'widget.getChildrenData()', which calls
		 * 'getData()' on the children of 'widget' (the value returned from 'widget.getChildren()').
		 * 
		 * @param  {davinci/ve/_Widget} widget  the widget instance
		 * @param  {Object} options
		 * @param  {boolean} options.identify  XXX TODO
		 * @param  {boolean} options.preserveTagName  XXX TODO
		 * 
		 * @return {Object[]}  An array data for the widget's children.  See 'getData()' docs for
		 *                     more information on the structure.
		 */
		getChildrenData: function(widget, options) {},

		/**
		 * Override default implementation, which returns the widget's DOM node which contains the
		 * widget's children (if any).
		 * 
		 * @param  {davinci/ve/_Widget} widget  the widget instance
		 * 
		 * @return {DOMElement|null}  If 'widget' can have child widgets, then return the DOM node
		 *             which contains those children; otherwise, return null.
		 */
		getContainerNode: function(widget) {},

		/**
		 * Override the default implementation of 'widget._getData()', which returns an object
		 * containing the attributes needed to reconstruct the given 'widget'.
		 * 
		 * @param  {davinci/ve/_Widget} widget  the widget instance
		 * @param  {Object} options
		 * @param  {boolean} options.identify  XXX TODO
		 * @param  {boolean} options.preserveTagName  XXX TODO
		 *
		 * XXX Why is the 'options' arg necessary? Does this need to be exposed to helpers?
		 * 
		 * @return {Object} An object containing the widget's attributes, with the following props:
		 *             {
		 *                 type:        // {String} widget type identifier (i.e. "dijit.form.Button")
		 *                 properties:  // {Object} properties (from metadata) and their current values
		 *                 tagName:     // {String} top-most DOM tag for widget
		 *                 children:    // {[Object]} data for child widgets (from 'widget.getChildrenData()')
		 *             }
		 */
		getData: function(/*Widget*/ widget, /*Object*/ options) {
			if(!widget){
				return undefined;
			}
		
			// call the base  _getData to get most of the widgets data
			var data = widget._getData(options);
			/*
			 * Add in the missing DataStore and query properties that would be needed to
			 * reconstruct this widget
			 */
			if (widget.dijitWidget.store){
				data.properties.store = widget.dijitWidget.store; // add the data old store if it has one.
				data.properties.query = widget.dijitWidget.query;
			}
			return data;
		},

		/**
		 * [getMarginBoxPageCoords description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {Object}        [description]
		 */
		getMarginBoxPageCoords: function(widget) {},

		/**
		 * Override the default implementation, which simply gets the value of the named attribute
		 * from the widget's DOM node.
		 * 
		 * @param  {davinci/ve/_Widget} widget  the widget instance
		 * @param  {String} name  the property whose value we are querying
		 * 
		 * @return {*}
		 */
		getPropertyValue: function(widget, name) {},


		/**
		 * Called by DeleteAction when a widget is to be deleted.  Use this function to replace the
		 * default widget deletion process for complicated widgets.  For example, when adding the
		 * "dijit/Tree" widget, store and model widgets will also get added.  When deleting
		 * "dijit/Tree", we can use this function to create a command which will also delete the
		 * associated store and model widgets.
		 * 
		 * @param {davinci.ve._Widget} widget  the widget instance to be deleted
		 * 
		 * @return {davinci.commands.CompoundCommand}
		 *             A command to delete 'widget' and perform any other necessary actions. Will be
		 *             added to the command stack.
		 */
		getRemoveCommand: function(widget) {
			
			/*
			 * Create a CompoundCommand for the undo/redo functionality
			 */
			var command = new CompoundCommand();
			command.add(new RemoveCommand(widget));
			/*
			 * Find the model widget to add to the delete
			 */
			var modelId = widget.domNode._dvWidget._srcElement.getAttribute("model");
			var modelWidget = Widget.byId(modelId);
			command.add(new RemoveCommand(modelWidget));
			/*
			 * Find the Store and add it also
			 */
			var storeId = modelWidget._srcElement.getAttribute("store");
			var storeWidget = Widget.byId(storeId);
			// order is important for undo... 
			command.add(new RemoveCommand(storeWidget));
			/*
			 * Return the command object to be used by DeleteAction
			 */
			return command;
			
		}, 

		/**
		 * [getTargetOverlays description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {[type]}        [description]
		 */
		getTargetOverlays: function(widget) {},

		/**
		 * [getWidgetText description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {String}        [description]
		 */
		getWidgetText: function(widget) {},

		/**
		 * [initialSize description]
		 * @param  {[type]} args [description]
		 * @return {[type]}      [description]
		 */
		initialSize: function(args) {},

		/**
		 * [isAllowed description]
		 * @param  {Object}  args [description]
		 * @return {Boolean}      [description]
		 */
		isAllowed: function(args) {},

		/**
		 * [isAllowedError description]
		 * @param  {Object}  args [description]
		 * @return {Boolean}      [description]
		 */
		isAllowedError: function(args) {},

		/**
		 * [onCreateResize description]
		 * @param  {[type]} command [description]
		 * @param  {[type]} w       [description]
		 * @param  {[type]} width   [description]
		 * @param  {[type]} height  [description]
		 * @return {[type]}         [description]
		 */
		onCreateResize: function(command, w, width, height) {},

		/**
		 * [onDeselect description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		onDeselect: function(widget) {},

		/**
		 * [onHideSelection description]
		 * @param  {Object} args          [description]
		 */
		onHideSelection: function(args) {},

		/**
		 * [onLoad description]
		 * @param  {davinci/ve/_Widget} widget  [description]
		 * @param  {[type]} already [description]
		 */
		onLoad: function(widget,already) {},

		/**
		 * May optionally return a function to call after remove command has
		 * finished the removal.
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {Function}        [description]
		 */
		onRemove: function(widget) {},

		/**
		 * [onSelect description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		onSelect: function(widget) {},

		/**
		 * [onShowSelection description]
		 * @param  {Object} args          [description]
		 */
		onShowSelection: function(args) {},

		/**
		 * [onToggleVisibility description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @param  {[type]} on     [description]
		 * @return {[type]}        [description]
		 */
		onToggleVisibility: function(widget, on) {},

		/**
		 * [onWidgetPropertyChange description]
		 * @param  {Object} args [description]
		 */
		onWidgetPropertyChange: function(args) {},

		/**
		 * [popup description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		popup: function(widget) {},

		/**
		 * [preProcessData description]
		 * @param  {Object} data [description]
		 * @return {Object}      [description]
		 */
		preProcessData: function(data) {},

		/**
		 * Called by ReparentCommand when widget is reparent, used for widget that have associated
		 * That must be reparented to ensure that they appear in the document in the correct order
		 * For Example widgets with stores and models like dijitTree.
		 * @param  {davinci/ve/_Widget} widget - Widget that is being reparentted
		 * @param  {object} useDataDojoProps - Widget that is being reparentted
		 */
		reparent: function(widget, useDataDojoProps){ 

			try{
				/*
				 * Find the widget that is associated with widget be reparented.
				 */
				var storeId = "";
				if (widget.dijitWidget && widget.dijitWidget.store) {
					var store = widget.dijitWidget.store;
					storeId = store.id ? store.id : store._edit_object_id;
				}
				if(storeId){
					// we may have the store as an object
					dojo.withDoc(widget.getContext().getDocument(), function(){
						var assocatedWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
						if (assocatedWidget && widget.dijitWidget && widget.dijitWidget.store){
							/*
							 * Now that we have the associated widget lets find where to move it to
							 */
							var parent = widget.getParent();
							var assocatedParent = assocatedWidget.getParent();
							var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
							var i = parent.indexOf(widget);
							var x = assocatedParent.indexOf(assocatedWidget);
							if ((parent === assocatedParent) && (i < x )){ // same parent
								newIndex = parent.indexOf(widget);
							} else if (parent != assocatedParent) {
								newIndex = i;
							}
							/*
							 * This code is already be executed from the command stack so no need to add this command to the 
							 * undo/redo stack. Just use the ReparentCommand for code reuse, no need to recode the wheel.
							 */
							var command = new ReparentCommand(assocatedWidget, parent, newIndex);
							command.execute();
						}
					}.bind(this));
				}
				
				} 
				catch (e) {
					console.error('Helper.Reparent error processing tree.');
				}
		},

		/**
		 * NOTE: Only applies to widgets of class "dijit".
		 * @param  {davinci/ve/DijitWidget} widget [description]
		 */
		resize: function(widget) {},

		/**
		 * [tearDown description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		tearDown: function(widget) {}
	};

	return Helper;

});