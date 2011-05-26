define(["dojo/_base/html", "dijit/form/_ComboBoxMenuMixin", "dijit/_WidgetBase", "dojox/mobile/_ListTouchMixin", "./scrollable"], function(dhtml, ComboBoxMenuMixin,WidgetBase,ListTouchMixin,Scrollable) {

	return dojo.declare("dojox.mobile._ComboBoxMenu", [dijit._WidgetBase,dojox.mobile._ListTouchMixin,dijit.form._ComboBoxMenuMixin], {
		// summary:
		//		Focus-less menu for internal use in `dijit.form.ComboBox`
		//		Abstract methods that must be defined externally:
		//			onChange: item was explicitly chosen (mousedown somewhere on the menu and mouseup somewhere on the menu)
		//			onPage: next(1) or previous(-1) button pressed
		// tags:
		//		private

		baseClass: "mblComboBoxMenu",
		bgIframe: true, // so it's not created for IE and FF

		buildRendering: function(){
			this.domNode = this.focusNode = dojo.create("div", { "class":"mblReset" });
			this.containerNode = dojo.create("div", { style: { position:"absolute", top:0, left:0 } }, this.domNode); // needed for scrollable
			this.previousButton = dojo.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuPreviousButton", role:"option" }, this.containerNode);
			this.nextButton = dojo.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuNextButton", role:"option" }, this.containerNode);
			this.inherited(arguments);
		},

		_createMenuItem: function(){
			return dojo.create("div", {
				"class": "mblReset mblComboBoxMenuItem" +(this.isLeftToRight() ? "" : " mblComboBoxMenuItemRtl"),
				role: "option"
			});
		},

		onSelect: function(/*DomNode*/ node){
			// summary:
			//		Add selected CSS
			dojo.addClass(node, "mblComboBoxMenuItemSelected");
		},

		onDeselect: function(/*DomNode*/ node){
			// summary:
			//		Remove selected CSS
			dojo.removeClass(node, "mblComboBoxMenuItemSelected");
		},

		onOpen: function(){
			this.scrollable.init({
				domNode: this.domNode,
				containerNode: this.containerNode
			});
			this.scrollable.scrollTo({x:0, y:0});
		},

		onClose: function(){
			this.scrollable.cleanup();
		},

		destroyRendering: function(){
			this.bgIframe = false; // no iframe to destroy
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);
			this.scrollable = new dojox.mobile.scrollable();
			this.scrollable.resize = function(){}; // resize changes the height rudely
		}
	});
});
