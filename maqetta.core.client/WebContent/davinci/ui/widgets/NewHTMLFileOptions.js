dojo.provide("davinci.ui.widgets.NewHTMLFileOptions");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");  
dojo.require("dijit.form.Select");
dojo.requireLocalization("davinci.ui", "ui");

dojo.declare("davinci.ui.widgets.NewHTMLFileOptions",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewHTMLFileOptions.html"),
	collapsed:true,
	compositionType: null,
	device:null,
	canvasSize: null,
	layoutMode: null,
	themeSet: null,
	lastExplicitDevice: null,
	standardCompTypes:{
	    desktop: { layout:'flow', theme:'claro' },
	    mobile: { layout:'flow', theme:'deviceSpecific' },
	    sketch: { layout:'absolute', theme:'claro' },
	    wireframe: { layout:'absolute', theme:'sketch' }
	},
		
	postCreate : function(){
		this.inherited(arguments);
		var langObj = this.langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		this.compositionTypeLabel.innerHTML = langObj.nhfoCompositionType;
		this.deviceLabel.innerHTML = langObj.nhfoDevice;
		this.layoutLabel.innerHTML = langObj.nhfoLayout;
		this.themeLabel.innerHTML = langObj.nhfoTheme;
		
		var lastDialogValues = davinci.Workbench.workbenchStateCustomPropGet('nhfo');
		_updateWithLastDialogValue = function(widget, opts, lastDialogValue){
			// If there was a persisted value from last time dialog was shown
			// and persisted value is a valid choice, then update the given widget
			// to the supplied value.
			for (var i=0; i<opts.length; i++){
				var opt = opts[i];
				if(opt.value == lastDialogValue){
					widget.attr('value', lastDialogValue);
					return true;
				}
			}
			return false;
		};
		
		var optsCT = [
		    {value: "desktop", label: langObj.nhfoCTMenu_desktop},
		    {value: "mobile", label: langObj.nhfoCTMenu_mobile},
		    {value: "sketch", label: langObj.nhfoCTMenu_sketch},
		    {value: "wireframe", label: langObj.nhfoCTMenu_wireframe},
		    {value: "custom", label: langObj.nhfoCTMenu_custom}
		];
		this.compositionTypeSelect.addOption(optsCT);
		this.connect(this.compositionTypeSelect, 'onFocus', dojo.hitch(this, function(){
			// Dijit doesn't support 'title' attribute or tooltip natively on options,
			// so do some monkeybusiness to attach tooltips to the TR elements used in menu
			// Have to do setTimeout because table isn't constructed until after onFocus event.
			setTimeout(dojo.hitch(this,function(){
				var trElems = dojo.query('tr', this.compositionTypeSelect.dropDown.domNode);
				if(trElems.length>=5){
					trElems[0].title = langObj.nhfoCTTitle_desktop;
					trElems[1].title = langObj.nhfoCTTitle_mobile;
					trElems[2].title = langObj.nhfoCTTitle_sketch;
					trElems[3].title = langObj.nhfoCTTitle_wireframe;
					trElems[4].title = langObj.nhfoCTTitle_custom;
				}
			}),1);
		}));
		
		this.arrowNode = dojo.query('.nhfo_details_arrow',this.domNode)[0];
		this.connect(this.arrowNode, 'onclick', dojo.hitch(this,function(e){
			this._update_collapse_expand(!this.collapsed);
		}));

		//FIXME: Pull this from server
		var optsDV = [
		    {value: "desktop", label: langObj.nhfoDVMenu_desktop},
		    {value: "iphone", label: 'iPhone'},
		    {value: "ipad", label: 'iPad'},
		    {value: "android_340x480", label: 'Android 340x480'},
		    {value: "android_480x800", label: 'Android 480x800'},
		    {value: "androidtablet", label: 'Android Tablet'},
		    {value: "blackberry", label: 'Blackberry'}
		];
		this.deviceSelect.addOption(optsDV);

		var optsLA = [
		    {value: "flow", label: langObj.nhfoLAMenu_flow},
		    {value: "absolute", label: langObj.nhfoLAMenu_absolute}
		];
		this.layoutSelect.addOption(optsLA);

		//FIXME: Need to make a query call to collect available themes and theme sets
		var optsTH = [
		  	{value: "deviceSpecific", label: langObj.nhfoTHMenu_devicespecific},
			{value: "claro", label: 'claro'},
		    {value: "sketch", label: 'sketch'}
		];
		this.themeSelect.addOption(optsTH);
		this.editThemeNode = dojo.query('.nhfo_edit_theme',this.domNode)[0];
		this.connect(this.editThemeNode, 'onclick', dojo.hitch(this,function(e){
			//FIXME: Need to bring up theme select dialog
			alert('Edit theme button not yet implemented');
		}));

		if(lastDialogValues){
			this.lastExplicitDevice = lastDialogValues.lastExplicitDevice;
			_updateWithLastDialogValue(this.compositionTypeSelect, optsCT, lastDialogValues.compositionType);
			if(_updateWithLastDialogValue(this.deviceSelect, optsDV, lastDialogValues.device) && lastDialogValues.device != 'desktop'){
				this.lastExplicitDevice = this.deviceSelect.attr('value');
			}
			_updateWithLastDialogValue(this.layoutSelect, optsLA, lastDialogValues.layout);
			_updateWithLastDialogValue(this.themeSelect, optsTH, lastDialogValues.theme);
		}
		this.connect(this.compositionTypeSelect, 'onChange', dojo.hitch(this,function(){
			this._update_comp_type();
		}));
		this.connect(this.deviceSelect, 'onChange', dojo.hitch(this,function(){
			var compType = this.compositionTypeSelect.attr('value');
			if(compType == 'mobile' || compType == 'custom'){
				this.lastExplicitDevice = this.deviceSelect.attr('value');
			}
			this._switch_to_custom();
		}));
		this.connect(this.layoutSelect, 'onChange', dojo.hitch(this,function(){
			this._switch_to_custom();
		}));
		this.connect(this.themeSelect, 'onChange', dojo.hitch(this,function(){
			this._switch_to_custom();
		}));

		this._update_comp_type();
		this._update_collapse_expand();
		
		//FIXME: Add logic for 'for' attributes point to correct id
	},

	/**
	 * Update this.collapsed to the given value and add/remove classes in DOM tree
	 * @param {boolean} collapsed  New value for this.collapsed
	 */
	_update_comp_type: function(){
		var compType = this.compositionTypeSelect.attr('value');
		this.compositionTypeSelect.attr('title',this.langObj['nhfoCTTitle_'+compType]);	// tooltip
		if(compType === 'desktop' || compType === 'sketch' || compType === 'wireframe'){
			this.deviceSelect.attr('value','desktop');
		}else if(compType === 'mobile'){
			if(this.lastExplicitDevice && this.lastExplicitDevice != 'desktop'){
				this.deviceSelect.attr('value',this.lastExplicitDevice);
			}else{
				this.deviceSelect.attr('value','iphone');
			}
		}
		var standardCompType = this.standardCompTypes[compType];
		if(standardCompType){
			this.layoutSelect.attr('value', standardCompType.layout);
			//FIXME: Needs to replaced with something more complicated that deals with theme sets
			this.themeSelect.attr('value', standardCompType.theme);
		}
	},
	
	/**
	 * If user has changed one of the composition type detailed items (e.g., device or layout),
	 * auto-switch the composition type to 'custom' if the chosen options no longer match
	 * the settings for the current standard composition type.
	 */
	_switch_to_custom: function() {
		var compType = this.compositionTypeSelect.attr('value');
		var device = this.deviceSelect.attr('value');
		if(((compType == 'desktop' || compType == 'sketch' || compType == 'wireframe') && device != 'desktop') ||
				(compType == 'mobile' && device == 'desktop')){
			this.compositionTypeSelect.attr('value','custom');
		}
		var stdCompType = this.standardCompTypes[compType];
		if(stdCompType){
			var layout = this.layoutSelect.attr('value');
			var theme = this.themeSelect.attr('value');
			if(layout != stdCompType.layout || theme != stdCompType.theme){
				this.compositionTypeSelect.attr('value','custom');
			}
		}
	},

	/**
	 * Update this.collapsed to the given value and add/remove classes in DOM tree
	 * @param {boolean} collapsed  New value for this.collapsed
	 */
	_update_collapse_expand: function(collapsed){
		if(typeof collapsed != 'undefined'){
			this.collapsed = collapsed;
		}
		var containerDiv = dojo.query('.nhfo_outer1',this.domNode)[0];
		if(containerDiv){
			if(this.collapsed){
				dojo.addClass(containerDiv, 'nhfo_collapsed');
				dojo.removeClass(containerDiv, 'nhfo_expanded');
			}else{
				dojo.addClass(containerDiv, 'nhfo_expanded');
				dojo.removeClass(containerDiv, 'nhfo_collapsed');
			}
		}
		this.arrowNode.title = this.collapsed ? this.langObj.nhfoArrowTitleShowDetails : this.langObj.nhfoArrowTitleHideDetails;
	},
	
	getOptions: function(){
		return{
			compositionType: this.compositionTypeSelect.attr('value'),
			device: this.deviceSelect.attr('value'),
			layout: this.layoutSelect.attr('value'),
			theme: this.themeSelect.attr('value'),
			lastExplicitDevice: this.lastExplicitDevice
		};
	}

});