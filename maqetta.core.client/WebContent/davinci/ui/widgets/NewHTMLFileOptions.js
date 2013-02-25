define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "davinci/Workbench",
        "dijit/Menu",
        "dijit/MenuItem",
        "davinci/model/Path",
        "dijit/Tooltip",
        "dijit/form/DropDownButton",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/NewHTMLFileOptions.html",
        "dijit/form/Button",
        "davinci/ui/widgets/ThemeSetSelection",
        "davinci/Theme",
        "dijit/form/TextBox",
        "dijit/form/RadioButton"

],function(declare, _Templated, _Widget,  Library, Resource,  Preferences, Runtime,  Workbench, 
			Menu, MenuItem, Path, ToolTip, DropDownButton, uiNLS, commonNLS, templateString,
			Button, ThemeSelection, Theme
			){
	return declare("davinci.ui.widgets.NewHTMLFileOptions",   [_Widget,_Templated], {
		widgetsInTemplate: true,
		templateString: templateString,
		device: null,
		themeSet: null,
		dialogSpecificClassOptions: null,
		standardDevices:[
		           	    //FIXME: device list should be dynamic
		           	    {type:'mobile', value:'android_340x480', device:'android_340x480', layout:'flow' },
		           	    {type:'mobile', value:'android_480x800', device:'android_480x800', layout:'flow' },
		           	    {type:'mobile', value:'androidtablet', device:'androidtablet', layout:'flow' },
		           	    {type:'mobile', value:'blackberry', device:'blackberry', layout:'flow' },
		           	    {type:'mobile', value:'ipad', device:'ipad', layout:'flow' },
		           	    {type:'mobile', value:'iphone', device:'iphone', layout:'flow' }
		           	],
			
		postCreate : function(){
			this.inherited(arguments);
			var dialogSpecificClassOptions = this.dialogSpecificClassOptions;
			var showDevices = dialogSpecificClassOptions ? dialogSpecificClassOptions.showDevices : false;
			var showThemeSetsButton = dialogSpecificClassOptions ? dialogSpecificClassOptions.showThemeSetsButton : false;
			var langObj = this.langObj = uiNLS;
			this.deviceLabel.innerHTML = langObj.nhfoDevice;
			
			if(!showDevices){
				this.nhfo_outer2.style.display = 'none';
			}
			var lastDialogValues;
			var allOptions = Workbench.workbenchStateCustomPropGet('nhfo');
			if(allOptions){
				var projectName = Workbench.getActiveProject();
				lastDialogValues = allOptions[projectName];
			}
			//var defaultThemeSet = this.getDefaultThemeSet();
			var defaultThemeSet = Runtime.getDefaultThemeSet();
			this._selectedThemeSet = lastDialogValues ? lastDialogValues.themeSet : defaultThemeSet /*undefined*/;
			if (this._selectedThemeSet && this._selectedThemeSet.name != Theme.none_themeset_name) {
			   // refresh the stored themeset in case it was changed
			    var themeSetName = this._selectedThemeSet.name;
			    this._selectedThemeSet = dojo.clone(Theme.none_themeset); // this will act as the default if the last used themeset has been deleted
			    var dojoThemeSets = Theme.getThemeSets( Workbench.getProject());
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
			_updateWithLastDialogValue = function(widget, opts, lastDialogValue, defaultValue){
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
				widget.attr('value', defaultValue);
				return false;
			};
	
			var optsCT = [];
			for(var i=0; i<this.standardDevices.length; i++){
				var o = this.standardDevices[i];
				if(o.type == 'separator'){
					optsCT.push({type:o.type});
				}else if(o.type == 'mobile'){
					var value = o.value;
					var label = o.value;
					optsCT.push({value:value, label:label});
				}else{
					var value = o.value;
					var label = langObj['nhfoDVMenu_'+value];
					optsCT.push({value:value, label:label});
				}
			}
			this.deviceSelect.addOption(optsCT);
			var _this = this;
			function closeTooltip(){
				// Dijit doesn't support 'title' attribute or tooltip natively on options,
				// so do some monkeybusiness to attach tooltips to the TR elements used in menu
				// Have to do setTimeout because table isn't constructed until after onFocus event.
				if(_this.ctTooltip && _this.ctTooltip.close){
					_this.ctTooltip.close();
				}
			}
			this.connect(this.deviceSelect, 'onFocus', dojo.hitch(this, function(){
				closeTooltip();
			}));
			this.connect(this.deviceSelect.dropDown, 'onOpen', dojo.hitch(this, function(){
				closeTooltip();
			}));
			this.connect(this.deviceSelect.dropDown, 'onClose', dojo.hitch(this, function(){
				closeTooltip();
			}));	
	
			var lastDevice = lastDialogValues ? lastDialogValues.device : undefined;
			_updateWithLastDialogValue(this.deviceSelect, optsCT, lastDevice, 'iphone');

			this.connect(this.deviceSelect, 'onChange', dojo.hitch(this,function(){
				this._update_comp_type();
			}));
			this._update_comp_type();
	
			//FIXME: Add logic for 'for' attributes point to correct id
			if(showThemeSetsButton){
				var input = document.createElement("input");
				this.dialogSpecificButtonsSpan.appendChild(input);
				this.themeButton = new Button({label:this.langObj.nhfoThemeButtonLabel, title:this.langObj.nhfoThemeButtonTitle}, input);
				this.connect(this.themeButton, 'onClick', dojo.hitch(this,function(e){
					this._themeSelectionDialog = new ThemeSelection({newFile: true});
					this._themeSelectionDialog.buildRendering();
					this.connect(this._themeSelectionDialog, 'onOk', dojo.hitch(this, function(e){
					    this._selectedThemeSet = this._themeSelectionDialog._selectedThemeSet;
					    this._updateThemesAndThemeSets();
					}));
				}));
			}
		},
	
		startup: function(){
			var label = this.deviceLabel;
			var select = this.deviceSelect;
			var idNum = 0, labelId;
			do{
				idNum++;
				labelId = 'device'+idNum;
			}while(dojo.byId(labelId));
			label.id = labelId;
			this.ctTooltip = new ToolTip({connectId:[labelId, select.id], 
					position:['below', 'below'], 
					label:this.langObj.nhfoDeviceTooltip});
		},
	
		/**
		 * Update this.collapsed to the given value and add/remove classes in DOM tree
		 * @param {boolean} collapsed  New value for this.collapsed
		 */
		_update_comp_type: function(){
			var o = this._currentDeviceObject('_update_comp_type');
			if(o.device == 'desktop'){
				// Whenever user chooses one of the desktop composition type options,
				// wipe out any theme choices done earlier in dialog because
				// the desktop composition type include a theming choice.
				delete this._selectedTheme;
				delete this._selectedThemeSet;
			}
		},
	
		getOptions: function(){
			var o = this._currentDeviceObject('getOptions');
			return{
				device: o.value,
				device: o.device,
				layout: o.layout,
				theme: this._selectedTheme ? this._selectedTheme : o.theme,
				themeSet: this._selectedThemeSet
			};
		},
	
		_updateThemesAndThemeSets: function(e){
			var themeName = this._selectedThemeSet.name;
			if (themeName == Theme.none_themeset_name){
				var o = this._currentDeviceObject('_updateThemesAndThemeSets');
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
		},
	
		_currentDeviceObject: function(callingFunc){
			var device = this.deviceSelect.attr('value');
			var found = false;
			for(var i=0; i<this.standardDevices.length; i++){
				var o = this.standardDevices[i];
				if(o.value == device){
					found = true;
					break;
				}
			}
			if(!found){
				console.error('NewHTMLFileOptions. '+callingFunc+': invalid device='+device);
				o = this.standardDevices[0];
			}
			return o;
		},
		
	});
});