define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/form/_SearchMixin",
	"dojox/mobile/TextBox",
	"dojo/dom-class",
	"dojo/keys",
	"./sniff"
], function(declare, lang, SearchMixin, TextBox, domClass, keys, has){

	return declare("dojox.mobile.SearchBox", [TextBox, SearchMixin], {
		// summary:
		//		A non-templated base class for INPUT type="search"

		baseClass: "mblTextBox mblSearchBox",

		type: "search",

		placeHolder: "",

		// incremental: Boolean
		//		Set true to search on every key or false to only search after pressing ENTER or cancel
		incremental: true,

		_setIncrementalAttr: function(val){
			// custom setter so the INPUT doesn't get the incremental attribute set
			this.incremental = val;
		},

		_onInput: function(e){
			if(e.charOrCode == keys.ENTER){
				e.charOrCode = 229;
			}else if(!this.incremental){
				e.charOrCode = 0; // call _onInput to make sure a pending query is aborted
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);
			this.textbox.removeAttribute('incremental'); // only want onsearch to fire for ENTER and cancel
			if(!this.textbox.hasAttribute('results')){
				this.textbox.setAttribute('results', '0'); // enables webkit search decoration
			}
			if(has('iphone') < 5){
				domClass.add(this.domNode, 'iphone4'); // cannot click cancel button after focus so just remove it
				this.connect(this.textbox, "onfocus", // if value changes between start of onfocus to end, then it was a cancel
					function(){
						if(this.textbox.value !== ''){
							setTimeout(lang.hitch(this,
								function(){
									if(this.textbox.value === ''){
										this._onInput({ charOrCode: keys.ENTER }); // emulate onsearch
									}
								}), 
								0
							);
						}
					}
				);
			}
			this.connect(this.textbox, "onsearch",
				function(){
					this._onInput({ charOrCode: keys.ENTER });
				}
			);
		}
	});
});
