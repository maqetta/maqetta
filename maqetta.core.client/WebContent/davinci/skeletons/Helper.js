/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define(function() {

	var Helper = function() {};
	Helper.prototype = {

		/**
		 * Override the default "add child" action when adding the child widget
		 * to the Visual Editor DOM (the default implementation varies depending
		 * on the widget type).
		 * 
		 * @param {davinci/ve/_Widget} parentWidget  a (Maqetta) widget instance
		 * @param {davinci/ve/_Widget} childWidget
		 *             the (Maqetta) widget instance to add to 'parentWidget'
		 * @param {Number|String} [index]
		 *             The equivalent of the 'pos' parameter to 'dojo.place()', can be a number or
		 *             a position name.  Defaults to "last".
		 */
		addChild: function(parentWidget, childWidget, index) {},
		
		/**
		 * Override the default "remove child" action when removing the child widget
		 * from the Visual Editor DOM (the default implementation varies depending
		 * on the widget type).
		 * 
		 * @param {davinci/ve/_Widget} parentWidget  a (Maqetta) widget instance
		 * @param {davinci/ve/_Widget} childWidget
		 *             the (Maqetta) widget instance to remove from 'parentWidget'
		 */
		removeChild: function(parentWidget, childWidget) {},

		/**
		 * Check that there are no discrepencies with 'value'.
		 * 
		 * XXX Currently only used by AnalogGaugeHelper.js.  Still necessary?
		 * XXX Also, badly designed interface: there is no mention of property this value belongs to.
		 * 
		 * @param  {*} value
		 * @return {*}
		 * @deprecated DO NOT USE, this API will be removed.
		 */
		checkValue: function(value) {},

		/**
		 * Override the default action, which adds a new widget as a child of the most deeply nested
		 * valid container that is under the mouse pointer, when dragging/dropping.  Implement this
		 * function to allow a different default parent choice.
		 * 
		 * @param {davinci.ve._Widget[]} allowedParentList
		 *             List of candidate parent widgets, where typically BODY is item 0.
		 * 
		 * @return {davinci.ve._Widget}  an element from 'allowedParentList' array
		 */
		chooseParent: function(allowedParentList) {},

		/**
		 * Allows you to "clean" (update) an HTML model element.
		 * 
		 * For example, for some widgets, other code will handle certain attributes within
		 * 'data-dojo-props' or via child HTML element, and you would not want to allow those
		 * attributes to be written to source.  You can use this function to clean out those
		 * attributes.
		 *
		 * XXX We should handle this some other way. Shouldn't require a helper.
		 * 
		 * XXX Should have a 'widget' param.  Useful in the case where helper is shared amongst
		 *     many diff. widget types.  Can at least check 'widget.type' or other info.
		 * 
		 * @param  {davinci/html/HTMLElement} srcElement
		 */
		cleanSrcElement: function(srcElement) {},
		
		/**
		 * Invoked after new widget is created but before being adding a new widget to the page; 
		 * when changing properties on a widget (and the widget is recreated).
		 *
		 * XXX This is invoked from widget.createWidget().  
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 *             the widget instance that is being created
		 * 
		 */
		postCreateWidget: function(widget){},

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
		 * XXX Remember that the CreateTool helper stuff needs to be redone such that we don't
		 *     copy code out of CreateTool.js into individual widget versions of create()
		 *
		 * XXX This is invoked from _Widget.attach().  Rename to "attach"?
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 *             the widget instance that is being created
		 * @param  {davinci/html/HTMLElement} srcElement
		 *             HTML model element corresponding to widget instance
		 */
		create: function(widget, srcElement) {

//		Example:
//			try{
//				/*
//				 * Find the widget that is associated with widget be created.
//				 */
//				var storeId = "";
//				if (widget.dijitWidget && widget.dijitWidget.store) {
//					var store = widget.dijitWidget.store;
//					storeId = store.id ? store.id : store._edit_object_id;
//				}
//				if(storeId){
//					/*
//					 * we may have the store as an object, stores must be 
//					 * created before the widgets that use them
//					 * So lets make sure this store is defined in the document 
//					 * before the widget we are create.
//					 */
//					
//					dojo.withDoc(widget.getContext().getDocument(), function(){
//						var assocatedWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
//						if (assocatedWidget && widget.dijitWidget && widget.dijitWidget.store){
//							/*
//							 * Now that we have the associated widget lets find where to move it to
//							 */
//							var parent = widget.getParent();
//							var assocatedParent = assocatedWidget.getParent();
//							var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
//							var i = parent.indexOf(widget);
//							var x = assocatedParent.indexOf(assocatedWidget);
//							if ((parent === assocatedParent) && (i < x )){ // same parent
//								newIndex = parent.indexOf(widget);
//							} else if (parent != assocatedParent) {
//								newIndex = i;
//							}
//							/*
//							 * We do not need to add this to the command stack, but we can use the ReparentCommand 
//							 * for code reuse. 
//							 */
//							var command = new ReparentCommand(assocatedWidget, parent, newIndex);
//							command.execute();
//						}
//					}.bind(this));
//				}
//				
//			} 
//			catch (e) {
//				console.error('Helper.Create error processing tree.');
//			}
		},

		/**
		 * Override the default action, which attempts to destroy the child widgets of 'widget'.
		 * Invoked when a widget is removed from page editor.
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 */
		destroy: function(widget) {},

		/**
		 * Allows you to disable dragging of a widget within the Visual Editor.
		 * 
		 * There are various cases where widgets are not allowed to be moved by the user, 
		 * such as a ContentPane child of a TabContainer.
		 * 
		 * @param  {davinci.ve._Widget} widget
		 * 
		 * @return {boolean}  'true' is dragging of 'widget' should be disabled
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
			
//		Example:
//			var children = [];
//
//			// Dijit specific code here.  We only want items inside the box node, and not
//			// the label node (for now).
//			if (widget && widget.dijitWidget && widget.dijitWidget.box) {
//				dojo.forEach(widget.dijitWidget.box.children, function(node) {
//					// the label
//					if(dojo.hasClass(node, "mblListItemLabel")) {
//						return;
//					}
//					if (attach) {
//						children.push(require("davinci/ve/widget").getWidget(node));
//					} else {
//						var widget = node._dvWidget;
//						if (widget) {
//							children.push(widget);
//						}
//					}
//				});
//			}
//
//			return children;
		},
		/**
		 * Override the default action, in some cases the children of a widget have been hidden and
		 * replaced with different widgets at runtime. In cases like this the widget from the html 
		 * source  does not match the runtime widget and we need to find the corresponding runtime
		 * widget to select.
		 *
		 * Implement this function for widgets whose children are not neatly encapsulated in the
		 * container node.
		 * 
		 * @param  {davinci/ve/_Widget} ParentWidget  the parent widget instance
		 * @param  {davinci/ve/_Widget} childWidget  the child widget instance.
		 *             If true, function must "attach" child widget nodes by calling 
		 *             'require("davinci/ve/widget").getWidget(node)'.
		 * 
		 * @return {null} 
		 */
		selectChild: function(parentWidget, childWidget){},
		
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
			
//		Example:
//			if(!widget){
//				return undefined;
//			}
//		
//			// call the base  _getData to get most of the widgets data
//			var data = widget._getData(options);
//			/*
//			 * Add in the missing DataStore and query properties that would be needed to
//			 * reconstruct this widget
//			 */
//			if (widget.dijitWidget.store){
//				data.properties.store = widget.dijitWidget.store; // add the data old store if it has one.
//				data.properties.query = widget.dijitWidget.query;
//			}
//			return data;
		},

		/**
		 * Override default action, which is to call 'GeomUtils.getMarginBoxPageCoords(widget.domNode)'.
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 * 
		 * @return {Object}  coordinates object of form {l:, t:, w:, h: }
		 * @see davinci/ve/utils/GeomUtils#getMarginBoxPageCoords
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
		getPropertyValue: function(widget, name) {
			/*
			 * Note: Should always use the base implementations for names that 
			 * are not overridden
			 */
			return widget._getPropertyValue(name);
		},


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
			
//		Example:
//			/*
//			 * Create a CompoundCommand for the undo/redo functionality
//			 */
//			var command = new CompoundCommand();
//			command.add(new RemoveCommand(widget));
//			/*
//			 * Find the model widget to add to the delete
//			 */
//			var modelId = widget.domNode._dvWidget._srcElement.getAttribute("model");
//			var modelWidget = Widget.byId(modelId);
//			command.add(new RemoveCommand(modelWidget));
//			/*
//			 * Find the Store and add it also
//			 */
//			var storeId = modelWidget._srcElement.getAttribute("store");
//			var storeWidget = Widget.byId(storeId);
//			// order is important for undo... 
//			command.add(new RemoveCommand(storeWidget));
//			/*
//			 * Return the command object to be used by DeleteAction
//			 */
//			return command;
			
		}, 

		/**
		 * Invoked by Snap.js from core application to get a snapping rect for this widget
		 * and/or a set of snapping points.
		 *
		 * XXX Only used by _PathHelperMixin.js in the Shapes library.  Is there some other way of
		 *     handling this, other than through a helper?
		 * 
		 * @param {davinci/ve/_Widget} widget
		 * @param {Object} widgetSnapInfo  Default snapping info if helper doesn't override.
		 * @param {Object} widgetSnapInfo.snapRect
		 *             Object in form of {l:, c:, r:, t:, m:, b:} // all numbers in page coordinate system
		 * 
		 * @return {Object}  either the original 'widgetSnapInfo' or an alternate object that can
		 *      contain a snapRect sub-object and/or a snapPoints sub-object (array of objects)
		 *      {
		 *         snapRect: {l:, c:, r:, t:, m:, b:} // all numbers in page coordinate system
		 *         snapPoints: [{x:, y:}] // all numbers in page coordinate system
		 *      }
		 */
		getSnapInfo: function(widget, widgetSnapInfo){},

		/**
		 * Normally, a widget is treated as a single entity in the Visual Editor.  But some widgets
		 * have children/sub-component widgets which the user should be allowed to select, in
		 * order to further customize (change properties).
		 *
		 * Implement this helper in order to let the Visual Editor know about the regions within
		 * the widget container that should be covered by "target overlays" (and are therefore
		 * made user-selectable).
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 * 
		 * @return {Object[]}  An array of "overlay" objects, containing coordinate and 
		 *             dimension properties: { x:, y:, width:, height: }.  Coordinates are in
		 *             the page coordinate system.
		 */
		getTargetOverlays: function(widget) {},

		/**
		 * Provide additional widget descriptor.
		 *
		 * XXX Only used by ContentPaneHelper.js.  Remove?
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 * 
		 * @return {String}  additional label text
		 */
		getWidgetDescriptor: function(widget) {},

		/**
		 * Helper that allows a custom string that will show as the widget's name
		 * in various parts of the Maqetta UI (e.g., Outline palette).
		 *
		 * XXX Not actually used any where.
		 * XXX Seems unnecessary.  Why not handle this through metadata?
		 *
		 * XXX If we must keep around helpers related to a widget's label, then combine 'getWidgetText',
		 *     'getWidgetTextExtra' and 'getWidgetDescriptor' into one function.
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 * 
		 * @return {string}
		 */
		getWidgetText: function(widget) {},

		/**
		 * Adds additional text to a widget's label.
		 *
		 * XXX Only used by MenuHelper.js.  Remove?
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 * 
		 * @return {String}  additional label text
		 */
		getWidgetTextExtra: function(widget) {},

		/**
		 * Return the initial size for a widget, overriding the default code in CreateTool.js.
		 *
		 * XXX Should pass in 'widget' instance, to keep in line with other helpers.  Also, wouldn't
		 *     we be able to use this (widget.parent??) instead of passing in 'args.parent'?
		 * 
		 * @param {object} args
		 * @param {davinci/ve/_Widget} [args.parent]  target parent widget for initial creation
		 * @param {Object} [args.size]  User-generated size (by dragging out size of widget).
		 *             In form of { w:, h: } (dimensions).
		 * @param {Object} [args.position]  If present, this widget is being added using
		 *             absolute positioning.
		 *
		 * @return {Object}  Dimensions for widget's initial size, in form { w:, h: }
		 */
		initialSize: function(args) {},

		/**
		 * Override the default action of ChooseParent.js#isAllowed() for deciding whether 
		 * this particular widget type can be a child of a particular parent type.
		 *
		 * XXX The name 'isAllowed' is very generic.  Rename to 'isAllowedChild'?
		 * 
		 * @param {Object} args  object with following properties:
		 * @param {String} args.childType
		 *             child widget type identifier (i.e. "dijit.form.Button")
		 * @param {String[]} args.childClassList
		 *             list of valid children for parent, eg ["ANY"] or ["dojox.mobile.ListItem"]
		 * @param {String} args.parentType
		 *             parent widget type identifier (i.e. "html.body")
		 * @param {String[]} args.parentClassList
		 *             list of valid parent for child, eg ["ANY"] or ["dojox.mobile.RoundRectList","dojox.mobile.EdgeToEdgeList"]
		 * @param {boolean} args.absolute
		 *             'true' if current child widget will be added with position:absolute
		 * @param {boolean} args.isAllowedChild
		 *             'true' if Maqetta's default processing would allow this child for this parent
		 * @param {boolean} args.isAllowedParent
		 *             'true' if Maqetta's default processing would allow this parent for this child
		 * 
		 * @returns {boolean}  'true' if the given child is allowed to be child of given parent
		 */
		isAllowed: function(args) {},

		/**
		 * Returns error message to display if CreateTool cannot find valid parent targets.
		 *
		 * XXX Poorly named.  Need something better.
		 * 
		 * @param {Object} args  object with following properties
		 * @param {String} args.errorMsg
		 *             default error message from application
		 * @param {String} args.type
		 *             widget type identifier (i.e. "dijit.form.Button")
		 * @param {String[]} args.allowedParent
		 *             list of valid parent for child, eg ["ANY"] or ["dojox.mobile.RoundRectList","dojox.mobile.EdgeToEdgeList"]
		 * @param {boolean} args.absolute
		 *             'true' if current child widget will be added with position:absolute
		 * 
		 * @returns {String}	Error message to show
		 */
		isAllowedError: function(args) {},

		/**
		 * Invoked when a widget is created and sized.  Implement this function if you need to
		 * add to the Command stack.
		 * 
		 * @param  {davinci/commands/CompoundCommand} command
		 *             command onto which any additional commands can be added
		 * @param  {davinci/ve/_Widget} widget
		 * @param  {Number} width   initial width for 'widget'
		 * @param  {Number} height  initial height for 'widget'
		 */
		onCreateResize: function(command, widget, width, height) {},

		/**
		 * Invoked when 'widget' is deselected in the Visual Editor.
		 *
		 * XXX Only used by TooltipHelper.js.  Necessary?
		 * 
		 * @param  {davinci/ve/_Widget} widget
		 */
		onDeselect: function(widget) {},

		/**
		 * Called by Focus.js right after Maqetta hides selection chrome on a widget.
		 * Helper is necessary for certain widgets that add their own selection chrome
		 * to Maqetta's standard selection chrome.
		 * @param {object} obj  Data passed into this routine is found on this object
		 *    obj.widget: A davinci.ve._Widget which has just been selected
		 *    obj.customDiv: DIV into which widget can inject its own selection chrome
		 * @return {boolean}  Return false if no problems.
		 * FIXME: Better if helper had a class inheritance setup
		 */
		onHideSelection: function(obj){},

		/**
		 * Called at end of document loading, after all widgets initialized.
		 * @param {davinci.ve._Widget} widget 
		 * @param {boolean} already  False if this first call for this document. True for subsequent widgets.
		 */
		onLoad: function(widget,already) {},

		/**
		 * Called by RemoveCommand before removal actions take place.
		 * Allows helper logic to get invoked after a widget has been removed.
		 * @param {davinci.ve._Widget} widget  
		 * @return {function}  Optional function to call after removal actions take place
		 */
		onRemove: function(widget) {},

		/**
		 * Called by Context.js when a widget becomes selected.
		 * @param  {davinci/ve/_Widget} widget
		 */
		onSelect: function(widget) {},

		/*
		 * Called by Focus.js right after Maqetta shows selection chrome around a widget.
		 * Helper is necessary for certain widgets that add their own selection chrome
		 * to Maqetta's standard selection chrome.
		 * @param {object} obj  Data passed into this routine is found on this object
		 *    obj.widget: A davinci.ve._Widget which has just been selected
		 *    obj.customDiv: DIV into which widget can inject its own selection chrome
		 * @return {boolean}  Return false if no problems.
		 */
		onShowSelection: function(obj){},

		/**
		 * Invoked whenever user attempts to toggle visibility of a widget
		 * (e.g., by clicking on eyeball icon in Outline palette).
		 * Return false will prevent toggle processing from proceeding.
		 * @param  {davinci.ve._Widget} widget  Widget whose visibility is being toggled
		 * @param  {boolean} on  Whether given widget is currently visible
		 * @return {boolean}  whether standard toggle processing should proceed
		 */
		onToggleVisibility: function(widget, on) {},
		/**
		 * Invoked to determine widget visibility
		 * (e.g.,  by Outline palette for eyeball icon).
		 * Return true if widget is visible.
		 * @param  {davinci.ve._Widget} widget  Widget whose visibility is being determined
		 * @return {boolean}  true = visible, false = hidden 
		 */
		isToggleOn: function(widget){},

		/**
		 * Helper function called whenever a widget-specific property is changed
		 * @param {object} args  - object with these properties
		 * .    widget  the dvWidget whose property(ies) has changed
		 *      compoundCommand  the CompoundCommand object that contains the ModifyCommand
		 *      modifyCommand  the ModifyCommand object that will soon be executed to change properties
		 */
		onWidgetPropertyChange: function(args){},

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
		 */
		reparent: function(widget) { 

//		Example:
//			try{
//				/*
//				 * Find the widget that is associated with widget be reparented.
//				 */
//				var storeId = "";
//				if (widget.dijitWidget && widget.dijitWidget.store) {
//					var store = widget.dijitWidget.store;
//					storeId = store.id ? store.id : store._edit_object_id;
//				}
//				if(storeId){
//					// we may have the store as an object
//					dojo.withDoc(widget.getContext().getDocument(), function(){
//						var assocatedWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
//						if (assocatedWidget && widget.dijitWidget && widget.dijitWidget.store){
//							/*
//							 * Now that we have the associated widget lets find where to move it to
//							 */
//							var parent = widget.getParent();
//							var assocatedParent = assocatedWidget.getParent();
//							var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
//							var i = parent.indexOf(widget);
//							var x = assocatedParent.indexOf(assocatedWidget);
//							if ((parent === assocatedParent) && (i < x )){ // same parent
//								newIndex = parent.indexOf(widget);
//							} else if (parent != assocatedParent) {
//								newIndex = i;
//							}
//							/*
//							 * This code is already be executed from the command stack so no need to add this command to the 
//							 * undo/redo stack. Just use the ReparentCommand for code reuse, no need to recode the wheel.
//							 */
//							var command = new ReparentCommand(assocatedWidget, parent, newIndex);
//							command.execute();
//						}
//					}.bind(this));
//				}
//				
//				} 
//				catch (e) {
//					console.error('Helper.Reparent error processing tree.');
//				}
		},

		/**
		 * NOTE: Only applies to widgets of class "dijit".
		 * @param  {davinci/ve/DijitWidget} widget [description]
		 */
		resize: function(widget) {},

		/**
		 * Sets parameters on the allowWhich object to indicate
		 * which sides should be resizable in the Maqetta page editor
		 * @param  {Object} allowWhich
		 *    Properties include:
		 *        four booleans that indicate which resize operations are allowed: 
		 *            resizeLeft, resizeRight, resizeTop, resizeBottom
		 * For example:
		 *   allowWhich.resizeLeft = allowWhich.resizeRight = true;
		 *   allowWhich.resizeTop = allowWhich.resizeBottom = false;
		 */
		resizeAllowWhich: function(widget, allowWhich) {},
		
		/**
		 * [tearDown description]
		 * @param  {davinci/ve/_Widget} widget [description]
		 */
		tearDown: function(widget) {},
		/**
		 * Some widget may have childern that are gerenated when the widget is constructed,
		 * in rare cases where what is in the Childern array does not match the source, use this 
		 * helper method to return the correct child index.
		 * @param  {davinci/ve/_Widget} widget [description]
		 * @param  {davinci/ve/_Widget} child find the index of
		 * @return {int} the index of the child
		 */
		indexOf: function(widget, child) {}
	};

	return Helper;

});