/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define(["davinci/ve/widget",
		"davinci/ve/commands/RemoveCommand",
		"davinci/commands/CompoundCommand",
		],
function(Widget, RemoveCommand, CompoundCommand){

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
		 * [create description]
		 * @param  {davinci/ve/_Widget} widget     [description]
		 * @param  {davinci/html/HTMLElement} srcElement [description]
		 */
		create: function(widget, srcElement) {},

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
		 * [reparent description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		reparent: function(widget) {},

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