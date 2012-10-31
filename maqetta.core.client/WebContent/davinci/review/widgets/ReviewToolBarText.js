define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dojo/i18n!davinci/review/widgets/nls/widgets"
       
],function(declare, _WidgetBase, widgetsNLS){

	return declare("davinci.review.widgets.ReviewToolBarText", [_WidgetBase], {

		postCreate: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "ReviewToolBarTextContainer");
			var div = dojo.create('div',{className:'ReviewToolBarText'}, this.domNode);
			var span = dojo.create('span',{}, div);
			span.textContent = widgetsNLS.ReviewToolBarText;
		}

	});
});