define([
	"dojo/_base/declare",
	"dijit/_WidgetBase"
], function(declare, _WidgetBase){
			
	return declare("clipart._clipart", [_WidgetBase], {
		
		_url:null,	// URL for SVG image relative to this JavaScript file
		// If not provided, then code defaults to 'art/FOO.svg' where
		// FOO is the last token of widget class name

		buildRendering: function(){
			this.inherited(arguments);
			if(!this._url){
				var index = this.declaredClass.lastIndexOf('.');
				if(index < 0){
					index = 0;
				}
				this._url = this.declaredClass.substr(index+1)+'.svg';
			}
			var dj = this.domNode.ownerDocument.defaultView.dojo;
			this.url = dj.moduleUrl("clipart", this._url);
			this.domNode.setAttribute('src', this.url);
		}
	});
});
