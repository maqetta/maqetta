/**
 * THIS FILE IS FOR REFERENCE/DOCUMENTATION ONLY.  Do not use directly, but feel
 * free to copy for use, update and strip out the unnecessary functions.
 */

define(function() {

	return {


		/**
		 * Additional theme editor preprocessing that is specific to this type of theme. 
		 *   For example adding document.css to dojo desktop themes.
		 * @param  {davinci/ve/Context} context - the current document context
		 */
		preThemeConfig: function(context) {},

		
		/**
		 * Called whenever the content of the document is change, to add theme specific processing
		 * that is not part of the standard theme editor. Example is changing the background 
		 * color of mobile themes.
		 * 
		 * @param  {davinci/ve/Context} context - the current document context
		 * @param  {davinci/Theme} theme - the current theme object
		 */
		onContentChange: function(context, theme) {},
		
		/**
		 * Called when widgets is added or deleted to HTML document in page editor.
		 * Looks at current document and decide if we need to update the document
		 * to include or exclude CSS files for example: document.css
		 * 
		 * @param  {davinci/ve/Context} context - the current document context
		 * @param  {boolean} resetEverything - if true resets document to default style
		 */
		widgetAddedOrDeleted: function(context, resetEverything){}	

	};

});