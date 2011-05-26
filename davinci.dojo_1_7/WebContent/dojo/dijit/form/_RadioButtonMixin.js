define(["dojo", ".."], function(dojo, dijit){

	// module:
	//		dijit/form/_RadioButtonMixin
	// summary:
	// 		Mixin to provide widget functionality for an HTML radio button

	dojo.declare("dijit.form._RadioButtonMixin", null, {
		// summary:
		// 		Mixin to provide widget functionality for an HTML radio button

		// type: [private] String
		//		type attribute on <input> node.
		//		Users should not change this value.
		type: "radio",

		_getRelatedWidgets: function(){
			// Private function needed to help iterate over all radio buttons in a group.
			var ary = [];
			dojo.query("input[type=radio]", this.focusNode.form || dojo.doc).forEach( // can't use name= since dojo.query doesn't support [] in the name
				dojo.hitch(this, function(inputNode){
					if(inputNode.name == this.name && inputNode.form == this.focusNode.form){
						var widget = dijit.getEnclosingWidget(inputNode);
						if(widget){
							ary.push(widget);
						}
					}
				})
			);
			return ary;
		},

		_setCheckedAttr: function(/*Boolean*/ value){
			// If I am being checked then have to deselect currently checked radio button
			this.inherited(arguments);
			if(!this._created){ return; }
			if(value){
				dojo.forEach(this._getRelatedWidgets(), dojo.hitch(this, function(widget){
					if(widget != this && widget.checked){
						widget.set('checked', false);
					}
				}));
			}
		},

		_onClick: function(/*Event*/ e){
			if(this.checked || this.disabled){ // nothing to do
				dojo.stopEvent(e);
				return false;
			}
			if(this.readOnly){ // ignored by some browsers so we have to resync the DOM elements with widget values
				dojo.stopEvent(e);
				dojo.forEach(this._getRelatedWidgets(), dojo.hitch(this, function(widget){
					dojo.attr(this.focusNode || this.domNode, 'checked', widget.checked);
				}));
				return false;
			}
			return this.inherited(arguments);
		}
	});

	return dijit.form._RadioButtonMixin;
});
