define(["dijit/form/_ListBase"], function(ListBase) {

	return dojo.declare( "dojox.mobile._ListTouchMixin", dijit.form._ListBase, {
		// summary:
		//		Focus-less menu to handle touch events consistently
		//		Abstract methods that must be defined externally:
		//			onClick: item was chosen (mousedown somewhere on the menu and mouseup somewhere on the menu)
		// tags:
		//		private
	
		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.domNode, "onclick", "_onClick");
		},
	
		_onClick: function(/*Event*/ evt){
			dojo.stopEvent(evt);
			var target = this._getTarget(evt);
			if(target){
				this._setSelectedAttr(target);
				this.onClick(target);
			}
		}
	});
});
