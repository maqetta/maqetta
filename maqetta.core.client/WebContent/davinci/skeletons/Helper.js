/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define(["davinci/ve/widget",
		"davinci/ve/commands/RemoveCommand",
		"davinci/commands/CompoundCommand",
		"davinci/ve/commands/ReparentCommand"
		],
function(Widget, RemoveCommand, CompoundCommand, ReparentCommand){

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
		 * @param  {[Object]} allowedParentList [description]
		 * @return {Object}                   [description]
		 */
		chooseParent: function(allowedParentList) {},

		/**
		 * [cleanSrcElement description]
		 * @param  {davinci/html/HTMLElement} srcElement [description]
		 */
		cleanSrcElement: function(srcElement) {},

		/**
		 * Called  when widget is created at page loading. 
		 * Use this Helper method for complex widget creation. an example would be a widget that 
		 * has associated widget like data stores
		 * @param  {davinci/ve/_Widget} widget      Widget that is being created
		 * @param  {davinci/html/HTMLElement} srcElement - source element  from the HTML document for Widget that is being created
		 * @param  {object} useDataDojoProps 
		 */
		create: function(widget, srcElement, useDataDojoProps){ 

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
		 * [getChildren description]
		 * @param  {davinci/ve/_Widget} widget   [description]
		 * @param  {boolean} attach [description]
		 * @return {[davinci/ve/_Widget]}        [description]
		 */
		getChildren: function(widget, attach) {},

		/**
		 * [getChildrenData description]
		 * @param  {davinci/ve/_Widget} widget  [description]
		 * @param  {Object} options [description]
		 * @return {Object}         [description]
		 */
		getChildrenData: function(widget, options) {},

		/**
		 * [getContainerNode description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {DOMElement}        [description]
		 */
		getContainerNode: function(widget) {},

		/**
		 * [getData description]
		 * @param  {davinci/ve/_Widget} widget  [description]
		 * @param  {Object} options [description]
		 * @return {Object}         [description]
		 */
		getData: function(widget, options) {},

		/**
		 * [getMarginBoxPageCoords description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @return {Object}        [description]
		 */
		getMarginBoxPageCoords: function(widget) {},

		/**
		 * [getPropertyValue description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @param  {String} name   [description]
		 * @return {*}        [description]
		 */
		getPropertyValue: function(widget, name) {},


		/**
		 * Called by DeleteAction when widget is to be deleted.
		 * @param {davinci.ve._Widget} widget  Widget that is being deleted
		 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
		 * 
		 * Use this helper method to replace the default widget deletions process for complicated widgets.
		 * For example a widget that has dependent widgets dijitTree that has a data store and a model widget 
		 * that are associated with it and must be deleted also.
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