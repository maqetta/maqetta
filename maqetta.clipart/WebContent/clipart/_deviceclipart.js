define([
	"dojo/_base/declare",
	"./_clipart"
], function(declare, _clipart){

	return declare("clipart._deviceclipart", [_clipart], {
		
		orientation:'portrait',

		postCreate: function(){
			var oldVisibility = this.domNode.style.visibility;
			this.domNode.style.visibility = 'hidden';
			var index = this.declaredClass.lastIndexOf('.');
			if(index < 0){
				index = 0;
			}
			this._url = this.declaredClass.substr(index+1) + '_' + this.orientation + '.svg';
			var dj = this.domNode.ownerDocument.defaultView.dojo;
			this.url = dj.moduleUrl("clipart", this._url);
			this.domNode.setAttribute('src', this.url);
			this.domNode.style.visibility = oldVisibility;
		}
	});
});
