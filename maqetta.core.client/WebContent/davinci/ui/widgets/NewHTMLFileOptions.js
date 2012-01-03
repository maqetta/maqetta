dojo.provide("davinci.ui.widgets.NewHTMLFileOptions");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");  
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Button");
dojo.require("dijit.Tooltip");
dojo.requireLocalization("davinci.ui", "ui");

dojo.declare("davinci.ui.widgets.NewHTMLFileOptions",   [dijit._Widget,dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("davinci.ui.widgets", "templates/NewHTMLFileOptions.html"),
	compositionType: null,
	themeSet: null,
<<<<<<< HEAD
	lastExplicitDevice: null,
	standardCompTypes:{
	    desktop: { layout:'flow', theme:'claro' },
	    mobile: { layout:'flow', theme:'deviceSpecific' },
	    sketch: { layout:'absolute', theme:'claro' },
	    wireframe: { layout:'absolute', theme:'Sketch' }
	},
=======
	standardCompTypes:[
		           	{value:'desktop_hifi_flow', device:'desktop', layout:'flow', theme:'claro' },
	           	    {value:'desktop_hifi_absolute', device:'desktop', layout:'absolute', theme:'claro' },
	           	    {type:'separator'},
	           	    {value:'desktop_lofi_flow', device:'desktop', layout:'flow', theme:'Sketch' },
	           	    {value:'desktop_lofi_absolute', device:'desktop', layout:'absolute', theme:'Sketch' },
	           	    {type:'separator'},
	           	    //FIXME: device list should be dynamic
	           	    {type:'mobile', value:'android_340x480', device:'android_340x480', layout:'flow' },
	           	    {type:'mobile', value:'android_480x800', device:'android_480x800', layout:'flow' },
	           	    {type:'mobile', value:'androidtablet', device:'androidtablet', layout:'flow' },
	           	    {type:'mobile', value:'blackberry', device:'blackberry', layout:'flow' },
	           	    {type:'mobile', value:'ipad', device:'ipad', layout:'flow' },
	           	    {type:'mobile', value:'iphone', device:'iphone', layout:'flow' }
	           	],
>>>>>>> master
		
	postCreate : function(){
		this.inherited(arguments);
		var langObj = this.langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		this.compositionTypeLabel.innerHTML = langObj.nhfoCompositionType;
		
		var lastDialogValues = davinci.Workbench.workbenchStateCustomPropGet('nhfo');
		this._selectedThemeSet = lastDialogValues ? lastDialogValues.themeSet : undefined;
		if (this._selectedThemeSet && this._selectedThemeSet.name != davinci.theme.none_themeset_name) {
		   // refresh the stored themeset in case it was changed
		    var themeSetName = this._selectedThemeSet.name;
		    this._selectedThemeSet = dojo.clone(davinci.theme.none_themeset); // this will act as the default if the last used themeset has been deleted
		    var dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
		    if (dojoThemeSets) {
		        for (var s = 0; s < dojoThemeSets.themeSets.length; s++){
		            if (dojoThemeSets.themeSets[s].name === themeSetName) {
		                // replace to make sure it is fresh
		                this._selectedThemeSet = dojo.clone(dojoThemeSets.themeSets[s]);
		                break;
		            }
		        }
		    }
		    
		}
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

		var optsCT = [];
		for(var i=0; i<this.standardCompTypes.length; i++){
			var o = this.standardCompTypes[i];
			if(o.type == 'separator'){
				optsCT.push({type:o.type});
			}else if(o.type == 'mobile'){
				var value = o.value;
				var label = o.value;
				optsCT.push({value:value, label:label});
			}else{
				var value = o.value;
				var label = langObj['nhfoCTMenu_'+value];
				optsCT.push({value:value, label:label});
			}
		}
		this.compositionTypeSelect.addOption(optsCT);
		var _this = this;
		function closeTooltip(){
			// Dojo annoying reposts tooltip if user hovers over the dijit.form.Select
			// (to bring up tooltip) and then brings up menu, and then closes menu.
			// Logic below forces the tooltip to go away.
			if(_this.ctTooltip && _this.ctTooltip.close){
				_this.ctTooltip.close();
			}
		}
		this.connect(this.compositionTypeSelect, 'onFocus', dojo.hitch(this, function(){
			closeTooltip();
		}));
<<<<<<< HEAD
		this.connect(hideDiv, 'onclick', dojo.hitch(this,function(e){
			dojo.stopEvent(e);
			this._update_collapse_expand(true);
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
		
		var optsTH = [
		  	{value: "deviceSpecific", label: langObj.nhfoTHMenu_devicespecific},
			{value: "claro", label: 'claro'},
		    {value: "Sketch", label: 'sketch'}
		];
		this.themeSelect.addOption(optsTH);
		this.editThemeNode = dojo.query('.nhfo_edit_theme',this.domNode)[0];
		this.connect(this.editThemeNode, 'onclick', dojo.hitch(this,function(e){
			this._themeSelectionDialog = new davinci.ui.widgets.ThemeSetSelection({newFile: true});
			this._themeSelectionDialog.buildRendering();
			this.connect(this._themeSelectionDialog, 'onOk', dojo.hitch(this, function(e){
			    this._selectedThemeSet = this._themeSelectionDialog._selectedThemeSet;
			    this._updateThemesAndThemeSets();
			}));
=======
		this.connect(this.compositionTypeSelect.dropDown, 'onOpen', dojo.hitch(this, function(){
			closeTooltip();
>>>>>>> master
		}));
		this.connect(this.compositionTypeSelect.dropDown, 'onClose', dojo.hitch(this, function(){
			closeTooltip();
		}));	

		if(lastDialogValues){
			_updateWithLastDialogValue(this.compositionTypeSelect, optsCT, lastDialogValues.compositionType);
		}
		//this._updateThemesAndThemeSets();
		this.connect(this.compositionTypeSelect, 'onChange', dojo.hitch(this,function(){
			this._update_comp_type();
		}));
<<<<<<< HEAD
		this.connect(this.deviceSelect, 'onChange', dojo.hitch(this,function(){
			var compType = this.compositionTypeSelect.attr('value');
			if(compType == 'mobile' || compType == 'custom'){
				this.lastExplicitDevice = this.deviceSelect.attr('value');
			}
			if (compType == 'custom' && this._selectedThemeSet) {
			    this._updateThemesAndThemeSets();
			}
			this._switch_to_custom();
		}));
		this.connect(this.layoutSelect, 'onChange', dojo.hitch(this,function(){
			this._switch_to_custom();
		}));
		this.connect(this.themeSelect, 'onChange', dojo.hitch(this,function(){
			this._switch_to_custom();
		}));

=======
>>>>>>> master
		this._update_comp_type();
		
		//FIXME: Add logic for 'for' attributes point to correct id
		
		this.themeButton = new dijit.form.Button({label:this.langObj.nhfoThemeButtonLabel, title:this.langObj.nhfoThemeButtonTitle}, this.dialogSpecificButtonsSpan);
		this.connect(this.themeButton, 'onClick', dojo.hitch(this,function(e){
			this._themeSelectionDialog = new davinci.ui.widgets.ThemeSetSelection({newFile: true});
			this._themeSelectionDialog.buildRendering();
			this.connect(this._themeSelectionDialog, 'onOk', dojo.hitch(this, function(e){
			    this._selectedThemeSet = this._themeSelectionDialog._selectedThemeSet;
			    this._updateThemesAndThemeSets();
			}));
		}));
	},
	
	startup: function(){
		var label = this.compositionTypeLabel;
		var select = this.compositionTypeSelect;
		var idNum = 0, labelId;
		do{
			idNum++;
			labelId = 'compType'+idNum;
		}while(dojo.byId(labelId));
		label.id = labelId;
		this.ctTooltip = new dijit.Tooltip({connectId:[labelId, select.id], 
				position:['below', 'below'], 
				label:this.langObj.nhfoCompositionTypeTooltip});
	},

	/**
	 * Update this.collapsed to the given value and add/remove classes in DOM tree
	 * @param {boolean} collapsed  New value for this.collapsed
	 */
	_update_comp_type: function(){
<<<<<<< HEAD
		var compType = this.compositionTypeSelect.attr('value');
		if (compType != 'custom') {
		    delete this._selectedThemeSet;
		} else if (!this._selectedThemeSet){
		    this._selectedThemeSet = dojo.clone(davinci.theme.none_themeset);
		}
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
		if(compType === 'mobile' || compType === 'custom'){
			// If mobile or custom, open up details options (and set this.collapsed to false)
			this._update_collapse_expand(false);
		}
		if(compType === 'mobile'){
			// If mobile, disable the flow-vs-absolute option
			// FIXME: May want to relax this constraint in future
			dojo.addClass(this.nhfo_layoutRow, 'dijitHidden');
		}else{
			dojo.removeClass(this.nhfo_layoutRow, 'dijitHidden');
		}
		var standardCompType = this.standardCompTypes[compType];
		if(standardCompType){
			this.layoutSelect.attr('value', standardCompType.layout);
			this.themeSelect.attr('value', standardCompType.theme);
		}

=======
		var o = this._currentCompTypeObject('_update_comp_type');
		if(o.device == 'desktop'){
			// Whenever user chooses one of the desktop composition type options,
			// wipe out any theme choices done earlier in dialog because
			// the desktop composition type include a theming choice.
			delete this._selectedTheme;
			delete this._selectedThemeSet;
		}
	},
	
	getOptions: function(){
		var o = this._currentCompTypeObject('getOptions');
		return{
			compositionType: o.value,
			device: o.device,
			layout: o.layout,
			theme: this._selectedTheme ? this._selectedTheme : o.theme,
			themeSet: this._selectedThemeSet
		};
	},
	
	_updateThemesAndThemeSets: function(e){
		var themeName = this._selectedThemeSet.name;
		if (themeName == davinci.theme.none_themeset_name){
			var o = this._currentCompTypeObject('_updateThemesAndThemeSets');
		    var deviceSelect = o.device;
		    if (deviceSelect == 'desktop') {
		        themeName = this._selectedThemeSet.desktopTheme;
		    } else {
		        for (var x = 0; x < this._selectedThemeSet.mobileTheme.length; x  ++){
		            if (deviceSelect.toLowerCase().indexOf(this._selectedThemeSet.mobileTheme[x].device.toLowerCase()) > -1){ 
		                themeName = this._selectedThemeSet.mobileTheme[x].theme;
		                break;
		            }
		        }
		    }
		}
		this._selectedTheme = themeName;
>>>>>>> master
	},
	
	_currentCompTypeObject: function(callingFunc){
		var compType = this.compositionTypeSelect.attr('value');
		var found = false;
		for(var i=0; i<this.standardCompTypes.length; i++){
			var o = this.standardCompTypes[i];
			if(o.value == compType){
				found = true;
				break;
			}
		}
		if(!found){
			console.error('NewHTMLFileOptions. '+callingFunc+': invalid compType='+compType);
			o = this.standardCompTypes[0];
		}
<<<<<<< HEAD
		var containerDiv = dojo.query('.nhfo_outer1',this.domNode)[0];
		var showDiv = dojo.query('.nhfo_show_details',this.domNode)[0];
		var hideDiv = dojo.query('.nhfo_hide_details',this.domNode)[0];
		if(containerDiv && showDiv && hideDiv){
			if(this.collapsed){
				dojo.addClass(containerDiv, 'nhfo_collapsed');
				dojo.removeClass(containerDiv, 'nhfo_expanded');
				dojo.removeClass(showDiv, 'dijitHidden');
				dojo.addClass(hideDiv, 'dijitHidden');
			}else{
				dojo.addClass(containerDiv, 'nhfo_expanded');
				dojo.removeClass(containerDiv, 'nhfo_collapsed');
				dojo.addClass(showDiv, 'dijitHidden');
				dojo.removeClass(hideDiv, 'dijitHidden');
			}
		}
	},
	
	getOptions: function(){
		return{
			compositionType: this.compositionTypeSelect.attr('value'),
			device: this.deviceSelect.attr('value'),
			layout: this.layoutSelect.attr('value'),
			theme: this.themeSelect.attr('value'),
			lastExplicitDevice: this.lastExplicitDevice,
			themeSet: this._selectedThemeSet
		};
	},
	
	_updateThemesAndThemeSets: function(e){
	    
	    var themeName = this._selectedThemeSet.name;
	    if (themeName == davinci.theme.none_themeset_name){
	        var deviceSelect = this.deviceSelect.attr('value');
	        if (deviceSelect == 'desktop') {
	            themeName = this._selectedThemeSet.desktopTheme;
	        } else {
    	        for (var x = 0; x < this._selectedThemeSet.mobileTheme.length; x  ++){
    	            if (deviceSelect.toLowerCase().indexOf(this._selectedThemeSet.mobileTheme[x].device.toLowerCase()) > -1){ 
    	                themeName = this._selectedThemeSet.mobileTheme[x].theme;
    	                break;
    	            }
    	        }
	        }
	        
	    }
	    var found = false;
	    for (var i=0; i<this.themeSelect.options.length; i++){
            if(this.themeSelect.options[i].value == themeName){
                found = true;
                break;
            }
        }
	    if (!found){
	        this.themeSelect.addOption({value: themeName, label: themeName});
	    } 
	    this.themeSelect.attr('value', themeName);
	    

=======
		return o;
>>>>>>> master
	}

});