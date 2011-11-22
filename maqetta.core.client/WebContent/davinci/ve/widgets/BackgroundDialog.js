dojo.provide("davinci.ve.widgets.BackgroundDialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");
dojo.require("davinci.theme.ThemeUtils");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.require("davinci.library");
dojo.require("davinci.ve.RebaseDownload");
dojo.require("dojox.widget.Standby");
dojo.declare("davinci.ve.widgets.BackgroundDialog",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ve.widgets", "templates/BackgroundDialog.html"),
	widgetsInTemplate: true,
	
	postMixInProperties : function() {
		this.inherited(arguments);
	},
	/* templated attach points, custom input section */
	
	/* check box for rewrite dojo */
	backgroundTable : null,


	buildRendering : function(){
		
		this.inherited(arguments);
	
	},
	
	/* current background value.  could be array or single item */
	_setValueAttr : function(value){
		
	},
	okButton : function(){
		this.cancel = false;
		
		this.onClose();
	},
	
	cancelButton : function(){
		this.cancel = true;
		this.onClose();
	}
	

});