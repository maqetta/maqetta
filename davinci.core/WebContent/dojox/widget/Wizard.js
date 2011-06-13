dojo.provide("dojox.widget.Wizard");

dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");

dojo.require("dojo.i18n");
dojo.requireLocalization("dijit", "common");
dojo.requireLocalization("dojox.widget", "Wizard");

dojo.declare("dojox.widget.Wizard", [dijit.layout.StackContainer, dijit._Templated], {
	// summary:
	//		A set of panels that display sequentially, typically notating a step-by-step
	//		procedure like an install
	//
	
	widgetsInTemplate: true,
	templateString: dojo.cache("dojox.widget", "Wizard/Wizard.html"),
	
	// nextButtonLabel: String
	//		Label override for the "Next" button.
	nextButtonLabel: "",

	// previousButtonLabel: String
	//		Label override for the "Previous" button.
	previousButtonLabel: "",

	// cancelButtonLabel: String
	//		Label override for the "Cancel" button.
	cancelButtonLabel: "",

	// doneButtonLabel: String
	//		Label override for the "Done" button.
	doneButtonLabel: "",

	// cancelFunction: Function|String
	//		Name of function to call if user presses cancel button.
	//		Cancel button is not displayed if function is not specified.
	cancelFunction: null,

	// hideDisabled: Boolean
	//		If true, disabled buttons are hidden; otherwise, they are assigned the
	//		"WizardButtonDisabled" CSS class
	hideDisabled: false,

	postMixInProperties: function(){
		this.inherited(arguments);
		var labels = dojo.mixin({cancel: dojo.i18n.getLocalization("dijit", "common", this.lang).buttonCancel},
			dojo.i18n.getLocalization("dojox.widget", "Wizard", this.lang));
		var prop;
		for(prop in labels){
			if(!this[prop + "ButtonLabel"]){
				this[prop + "ButtonLabel"] = labels[prop];
			}
		}
	},

	startup: function(){
		if(this._started){
			//console.log('started');
			return;
		}
		this.inherited(arguments);
		
		this.connect(this.nextButton, "onClick", "_forward");
		this.connect(this.previousButton, "onClick", "back");

		if(this.cancelFunction){
			if(dojo.isString(this.cancelFunction)){
				this.cancelFunction = dojo.getObject(this.cancelFunction);
			}
			this.connect(this.cancelButton, "onClick", this.cancelFunction);
		}else{
			this.cancelButton.domNode.style.display = "none";
		}
		this.connect(this.doneButton, "onClick", "done");

		this._subscription = dojo.subscribe(this.id + "-selectChild", dojo.hitch(this,"_checkButtons"));
		this._started = true;
		
	},
	
	resize: function(){
		this.inherited(arguments);
		this._checkButtons();
	},

	_checkButtons: function(){
		
		var sw = this.selectedChildWidget;
		
		var lastStep = sw.isLastChild;
		this.nextButton.set("disabled", lastStep);
		this._setButtonClass(this.nextButton);
		if(sw.doneFunction){
			//console.log(sw.doneFunction);
			this.doneButton.domNode.style.display = "";
			if(lastStep){
				this.nextButton.domNode.style.display = "none";
			}
		}else{
			// #1438 issue here.
			this.doneButton.domNode.style.display = "none";
		}
		this.previousButton.set("disabled", !this.selectedChildWidget.canGoBack);
		this._setButtonClass(this.previousButton);
	},

	_setButtonClass: function(button){
		button.domNode.style.display = (this.hideDisabled && button.disabled) ? "none" : "";
	},

	_forward: function(){
		// summary: callback when next button is clicked
		if(this.selectedChildWidget._checkPass()){
			this.forward();
		}
	},
	
	done: function(){
		// summary: Finish the wizard's operation
		this.selectedChildWidget.done();
	},
	
	destroy: function(){
		dojo.unsubscribe(this._subscription);
		this.inherited(arguments);
	}
	
});

dojo.declare("dojox.widget.WizardPane", dijit.layout.ContentPane, {
	// summary: A panel in a `dojox.widget.Wizard`
	//
	// description:
	//	An extended ContentPane with additional hooks for passing named
	//	functions to prevent the pane from going either forward or
	//	backwards.
	//
	// canGoBack: Boolean
	//		If true, then can move back to a previous panel (by clicking the "Previous" button)
	canGoBack: true,

	// passFunction: String
	//		Name of function that checks if it's OK to advance to the next panel.
	//		If it's not OK (for example, mandatory field hasn't been entered), then
	//		returns an error message (String) explaining the reason. Can return null (pass)
	//		or a Boolean (true == pass)
	passFunction: null,
	
	// doneFunction: String
	//		Name of function that is run if you press the "Done" button from this panel
	doneFunction: null,

	startup: function(){
		this.inherited(arguments);
		if(this.isFirstChild){ this.canGoBack = false; }
		if(dojo.isString(this.passFunction)){
			this.passFunction = dojo.getObject(this.passFunction);
		}
		if(dojo.isString(this.doneFunction) && this.doneFunction){
			this.doneFunction = dojo.getObject(this.doneFunction);
		}
	},

	_onShow: function(){
		if(this.isFirstChild){ this.canGoBack = false; }
		this.inherited(arguments);
	},

	_checkPass: function(){
		// summary:
		//		Called when the user presses the "next" button.
		//		Calls passFunction to see if it's OK to advance to next panel, and
		//		if it isn't, then display error.
		//		Returns true to advance, false to not advance. If passFunction
		//		returns a string, it is assumed to be a custom error message, and
		//		is alert()'ed
		var r = true;
		if(this.passFunction && dojo.isFunction(this.passFunction)){
			var failMessage = this.passFunction();
			switch(typeof failMessage){
				case "boolean":
					r = failMessage;
					break;
				case "string":
					alert(failMessage);
					r = false;
					break;
			}
		}
		return r; // Boolean
	},

	done: function(){
		if(this.doneFunction && dojo.isFunction(this.doneFunction)){ this.doneFunction(); }
	}

});
