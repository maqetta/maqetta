define(function() {

	var Helper = function() {};
	Helper.prototype = {


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

			if (widget.properties && widget.properties.checked && widget.properties.checked === "false") {
				delete widget.properties.checked;
				delete widget.dijitWidget.checked;
				delete widget.dijitWidget.params.checked;
				widget.dijitWidget._setCheckedAttr(false);
			}


		},


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
			
			if (name == 'states' && widget.dijitWidget.params && widget.dijitWidget.params.states){
				return widget.dijitWidget.params.states;
			} else {
				return widget._getPropertyValue(name);
			}
		},



	};

	return Helper;

});