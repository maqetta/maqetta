define([
	"dojo/_base/kernel",
	"..",
	"./_ComboBoxMenuMixin",
	"../_WidgetBase",
	"../_TemplatedMixin",
	"./_ListMouseMixin",
	"dojo/_base/connect", // dojo.keys.DOWN_ARROW dojo.keys.PAGE_DOWN dojo.keys.PAGE_UP dojo.keys.UP_ARROW
	"dojo/_base/declare", // dojo.declare
	"dojo/_base/html" // dojo.addClass dojo.create dojo.removeClass dojo.style
], function(dojo, dijit){

	// module:
	//		dijit/form/_ComboBoxMenu
	// summary:
	//		Focus-less menu for internal use in `dijit.form.ComboBox`


	dojo.declare(
		"dijit.form._ComboBoxMenu",
		[dijit._WidgetBase, dijit._TemplatedMixin, dijit.form._ListMouseMixin, dijit.form._ComboBoxMenuMixin], {
		// summary:
		//		Focus-less menu for internal use in `dijit.form.ComboBox`
		//              Abstract methods that must be defined externally:
		//                      onChange: item was explicitly chosen (mousedown somewhere on the menu and mouseup somewhere on the menu)
		//                      onPage: next(1) or previous(-1) button pressed
		// tags:
		//		private

		templateString: "<div class='dijitReset dijitMenu' dojoAttachPoint='containerNode' style='overflow: auto; overflow-x: hidden;'>"
				+"<div class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></div>"
				+"<div class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></div>"
				+"</div>",

		baseClass: "dijitComboBoxMenu",

		_createMenuItem: function(){
			return dojo.create("div", {
				"class": "dijitReset dijitMenuItem" +(this.isLeftToRight() ? "" : " dijitMenuItemRtl"),
				role: "option"
			});
		},

		onHover: function(/*DomNode*/ node){
			// summary:
			//		Add hover CSS
			dojo.addClass(node, "dijitMenuItemHover");
		},

		onUnhover: function(/*DomNode*/ node){
			// summary:
			//		Remove hover CSS
			dojo.removeClass(node, "dijitMenuItemHover");
		},

		onSelect: function(/*DomNode*/ node){
			// summary:
			//		Add selected CSS
			dojo.addClass(node, "dijitMenuItemSelected");
		},

		onDeselect: function(/*DomNode*/ node){
			// summary:
			//		Remove selected CSS
			dojo.removeClass(node, "dijitMenuItemSelected");
		},

		_page: function(/*Boolean*/ up){
			// summary:
			//		Handles page-up and page-down keypresses

			var scrollamount = 0;
			var oldscroll = this.domNode.scrollTop;
			var height = dojo.style(this.domNode, "height");
			// if no item is highlighted, highlight the first option
			if(!this.getHighlightedOption()){
				this.selectNextNode();
			}
			while(scrollamount<height){
				if(up){
					// stop at option 1
					if(!this.getHighlightedOption().previousSibling ||
						this._highlighted_option.previousSibling.style.display == "none"){
						break;
					}
					this.selectPreviousNode();
				}else{
					// stop at last option
					if(!this.getHighlightedOption().nextSibling ||
						this._highlighted_option.nextSibling.style.display == "none"){
						break;
					}
					this.selectNextNode();
				}
				// going backwards
				var newscroll=this.domNode.scrollTop;
				scrollamount+=(newscroll-oldscroll)*(up ? -1:1);
				oldscroll=newscroll;
			}
		},

		handleKey: function(evt){
			// summary:
			//		Handle keystroke event forwarded from ComboBox, returning false if it's
			//		a keystroke I recognize and process, true otherwise.
			switch(evt.charOrCode){
				case dojo.keys.DOWN_ARROW:
					this.selectNextNode();
					return false;
				case dojo.keys.PAGE_DOWN:
					this._page(false);
					return false;
				case dojo.keys.UP_ARROW:
					this.selectPreviousNode();
					return false;
				case dojo.keys.PAGE_UP:
					this._page(true);
					return false;
				default:
					return true;
			}
		}
	});

	return dijit.form._ComboBoxMenu;
});
