dojo.provide("dijit.TitlePane");

dojo.require("dojo.fx");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._CssStateMixin");

dojo.declare(
	"dijit.TitlePane",
	[dijit.layout.ContentPane, dijit._Templated, dijit._CssStateMixin],
{
	// summary:
	//		A pane with a title on top, that can be expanded or collapsed.
	//
	// description:
	//		An accessible container with a title Heading, and a content
	//		section that slides open and closed. TitlePane is an extension to
	//		`dijit.layout.ContentPane`, providing all the useful content-control aspects from it.
	//
	// example:
	// | 	// load a TitlePane from remote file:
	// |	var foo = new dijit.TitlePane({ href: "foobar.html", title:"Title" });
	// |	foo.startup();
	//
	// example:
	// |	<!-- markup href example: -->
	// |	<div dojoType="dijit.TitlePane" href="foobar.html" title="Title"></div>
	//
	// example:
	// |	<!-- markup with inline data -->
	// | 	<div dojoType="dijit.TitlePane" title="Title">
	// |		<p>I am content</p>
	// |	</div>

	// title: String
	//		Title of the pane
	title: "",

	// open: Boolean
	//		Whether pane is opened or closed.
	open: true,

	// toggleable: Boolean
	//		Whether pane can be opened or closed by clicking the title bar.
	toggleable: true,

	// tabIndex: String
	//		Tabindex setting for the title (so users can tab to the title then
	//		use space/enter to open/close the title pane)
	tabIndex: "0",

	// duration: Integer
	//		Time in milliseconds to fade in/fade out
	duration: dijit.defaultDuration,

	// baseClass: [protected] String
	//		The root className to be placed on this widget's domNode.
	baseClass: "dijitTitlePane",

	templateString: dojo.cache("dijit", "templates/TitlePane.html"),

	attributeMap: dojo.delegate(dijit.layout.ContentPane.prototype.attributeMap, {
		title: { node: "titleNode", type: "innerHTML" },
		tooltip: {node: "focusNode", type: "attribute", attribute: "title"},	// focusNode spans the entire width, titleNode doesn't
		id:""
	}),

	postCreate: function(){
		if(!this.open){
			this.hideNode.style.display = this.wipeNode.style.display = "none";
		}
		
		// Hover and focus effect on title bar, except for non-toggleable TitlePanes
		// This should really be controlled from _setToggleableAttr() but _CssStateMixin
		// doesn't provide a way to disconnect a previous _trackMouseState() call
		if(this.toggleable){
			this._trackMouseState(this.titleBarNode, "dijitTitlePaneTitle");
		}
		this._setCss();
		dojo.setSelectable(this.titleNode, false);

		// setup open/close animations
		var hideNode = this.hideNode, wipeNode = this.wipeNode;
		this._wipeIn = dojo.fx.wipeIn({
			node: this.wipeNode,
			duration: this.duration,
			beforeBegin: function(){
				hideNode.style.display="";
			}
		});
		this._wipeOut = dojo.fx.wipeOut({
			node: this.wipeNode,
			duration: this.duration,
			onEnd: function(){
				hideNode.style.display="none";
			}
		});
		this.inherited(arguments);
	},

	_setOpenAttr: function(/* Boolean */ open){
		// summary:
		//		Hook to make attr("open", boolean) control the open/closed state of the pane.
		// open: Boolean
		//		True if you want to open the pane, false if you want to close it.
		if(this.open !== open){ this.toggle(); }
		dijit.setWaiState(this.containerNode,"hidden", this.open ? "false" : "true");
		dijit.setWaiState(this.focusNode, "pressed", this.open ? "true" : "false");
	},

	_setToggleableAttr: function(/* Boolean */ canToggle){
		// summary:
		//		Hook to make attr("canToggle", boolean) work.
		// canToggle: Boolean
		//		True to allow user to open/close pane by clicking title bar.
		this.toggleable = canToggle;
		dijit.setWaiRole(this.focusNode, canToggle ? "button" : "heading");
		if(canToggle){
			// TODO: if canToggle is switched from true false shouldn't we remove this setting?
			dijit.setWaiState(this.focusNode, "controls", this.id+"_pane");
			dojo.attr(this.focusNode, "tabIndex", this.tabIndex);
		}
		else{
			dojo.removeAttr(this.focusNode, "tabIndex");
		}
		this._setCss();
	},

	_setContentAttr: function(content){
		// summary:
		//		Hook to make attr("content", ...) work.
		// 		Typically called when an href is loaded.  Our job is to make the animation smooth.

		if(!this.open || !this._wipeOut || this._wipeOut.status() == "playing"){
			// we are currently *closing* the pane (or the pane is closed), so just let that continue
			this.inherited(arguments);
		}else{
			if(this._wipeIn && this._wipeIn.status() == "playing"){
				this._wipeIn.stop();
			}

			// freeze container at current height so that adding new content doesn't make it jump
			dojo.marginBox(this.wipeNode, { h: dojo.marginBox(this.wipeNode).h });

			// add the new content (erasing the old content, if any)
			this.inherited(arguments);

			// call _wipeIn.play() to animate from current height to new height
			if(this._wipeIn){
				this._wipeIn.play();
			}else{
				this.hideNode.style.display = "";
			}
		}
	},

	toggle: function(){
		// summary:
		//		Switches between opened and closed state
		// tags:
		//		private

		dojo.forEach([this._wipeIn, this._wipeOut], function(animation){
			if(animation && animation.status() == "playing"){
				animation.stop();
			}
		});

		var anim = this[this.open ? "_wipeOut" : "_wipeIn"]
		if(anim){
			anim.play();
		}else{
			this.hideNode.style.display = this.open ? "" : "none";
		}
		this.open =! this.open;

		// load content (if this is the first time we are opening the TitlePane
		// and content is specified as an href, or href was set when hidden)
		if(this.open){
			this._onShow();
		}else{
			this.onHide();
		}

		this._setCss();
	},

	_setCss: function(){
		// summary:
		//		Set the open/close css state for the TitlePane
		// tags:
		//		private

		var node = this.titleBarNode || this.focusNode;

		if(this._titleBarClass){
			dojo.removeClass(node, this._titleBarClass);
		}
		this._titleBarClass = "dijit" + (this.toggleable ? "" : "Fixed") + (this.open ? "Open" : "Closed");
		dojo.addClass(node, this._titleBarClass);
		this.arrowNodeInner.innerHTML = this.open ? "-" : "+";
	},

	_onTitleKey: function(/*Event*/ e){
		// summary:
		//		Handler for when user hits a key
		// tags:
		//		private

		if(e.charOrCode == dojo.keys.ENTER || e.charOrCode == ' '){
			if(this.toggleable){
				this.toggle();
			}
			dojo.stopEvent(e);
		}else if(e.charOrCode == dojo.keys.DOWN_ARROW && this.open){
			this.containerNode.focus();
			e.preventDefault();
	 	}
	},

	_onTitleClick: function(){
		// summary:
		//		Handler when user clicks the title bar
		// tags:
		//		private
		if(this.toggleable){
			this.toggle();
		}
	},

	setTitle: function(/*String*/ title){
		// summary:
		//		Deprecated.  Use set('title', ...) instead.
		// tags:
		//		deprecated
		dojo.deprecated("dijit.TitlePane.setTitle() is deprecated.  Use set('title', ...) instead.", "", "2.0");
		this.set("title", title);
	}
});
