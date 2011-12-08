dojo.provide("davinci.ve.widgets.BackgroundDialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.parser");
dojo.require("davinci.ve.widgets.MutableStore");
dojo.require("davinci.ve.utils.CssUtils");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ve", "ve");
dojo.require("davinci.ve.widgets.ColorPickerFlat");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Textarea");

dojo.declare("davinci.ve.widgets.BackgroundDialog",   [dijit._Widget, dijit._Templated], {
	
	templateString: dojo.cache("davinci.ve.widgets", "templates/BackgroundDialog.html"),
	widgetsInTemplate: true,
	_filePicker : null,
	
	stopRowTemplate:"<tr class='bgdGradOptRow bgdStopRow' style='display:none;'>"+
				"<td class='bgdCol1'></td>"+
				"<td class='bgdOptsLabel bdgStopLabel'>Template:</td>"+
				"<td class='bgdStopColorTD'>"+
				"<select class='bgdColor' dojoType='dijit.form.ComboBox'>"+
				"</select>"+
				"</td>"+
				"<td>"+
				"<select class='bgdPosition' dojoType='dijit.form.ComboBox'>"+
				"</select>"+
				"</td>"+
				"<td class='bgdPlusMinusButtons'><span class='bgdPlusButton' dojoType='dijit.form.Button'>+</span><span class='bgdMinusButton' dojoType='dijit.form.Button'>-</span></td>"+
				"</tr>",

	postCreate: function(){
		this.inherited(arguments);
		var langObj = this.langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
		var CssUtils = davinci.ve.utils.CssUtils;
		
		this.stoppos_store = new davinci.ve.widgets.MutableStore({values:['0%','100%','10%','20%','30%','40%','50%','60%','70%','80%','90%']});

		// bpProps will hold some useful info about the backgrounds rows in the Properties palette
		var bgProps = davinci.ve.widgets.Background.BackgroundWidgets;

		//FIXME: Following code is mostly a copy/paste from ColorPicker.js
		//Should be refactored into a shared utility
		var langObjVE = dojo.i18n.getLocalization("davinci.ve", "ve");
		this._statics = ['', davinci.ve.widgets.ColorPicker.divider, langObjVE.colorPicker, langObjVE.removeValue];
		var colormenu_data=[{value:this._statics[0]}];
		colormenu_data.push({value:this._statics[2],action:'_colorpicker'});
		colormenu_data.push({value:this._statics[3],action:'_removevalue'});
		colormenu_data.push({value:this._statics[1],action:'_donothing'});   
		colormenu_data.push({value:'transparent'});
		colormenu_data.push({value:'black'});
		colormenu_data.push({value:'white'});
		colormenu_data.push({value:'red'});
		colormenu_data.push({value:'green'});
		colormenu_data.push({value:'blue'});
		var bgcolor_displayValues = [];
		this._bgcolor_action = {};
		var stops_displayValues = [];
		this._stops_action = {};
		for(var i = 0;i<colormenu_data.length;i++){
			bgcolor_displayValues.push(colormenu_data[i].value);
			if(colormenu_data[i].action){
				this._bgcolor_action[colormenu_data[i].value] = colormenu_data[i].action;
			}
			// For color stops, don't allow values to be removed
			if(colormenu_data[i].value != '' && colormenu_data[i].action != '_removevalue'){
				stops_displayValues.push(colormenu_data[i].value);
				if(colormenu_data[i].action){
					this._stops_action[colormenu_data[i].value] = colormenu_data[i].action;
				}
			}
		}
		this._bgcolor_store = new davinci.ve.widgets.ColorStore({values:bgcolor_displayValues, noncolors:this._statics});
		this._stops_store = new davinci.ve.widgets.ColorStore({values:stops_displayValues, noncolors:this._statics});

		// Inject initial values for all of the dialog's various fields
		// Abbreviations: bgd == BackgroundDialog, pp = Properties palette, CB == ComboBox
		var ppValue;
		
		// First off, need to parse background-image property		
		var ppImageCB = bgProps['background-image'].comboBox;
		ppValue = ppImageCB.attr('value');
		var bgddata, type;
		if(typeof ppValue == 'string' && ppValue.length>0){
			bgddata = davinci.ve.utils.CssUtils.parseBackgroundImage(ppValue);
			type = bgddata.type;
		}else{
			bgddata = {};
		}
		this.bgddata = bgddata;
		
		// Stuff value into "other" textarea
		this.bgdOtherTA.attr('value', ppValue);

		// Initialize dialog, getting some of initial values from properties palette fields
		// and other initial values from bgddata object
		var optsType = [];
		['emptystring','url','linear','radial','none','other'].forEach(function(val){
			optsType.push({value:val, label: langObj['bgdType_'+val]});
		});
   		this.bgdTypeSelect.addOption(optsType);
		this._updateBackgroundImageType(type);
		this.connect(this.bgdTypeSelect, 'onChange', dojo.hitch(this,function(){
			var val = this.bgdTypeSelect.attr('value');
			this._updateBackgroundImageType(val);
			this._onFieldChanged();
		}));
		
		var ppColorCB = bgProps['background-color'].comboBox;
		ppValue = ppColorCB.attr('value');
		var bgdColorCB = this.bgdColorCB;
		bgdColorCB.attr('store', this._bgcolor_store);
//FIXME: Add regexp for color
//bgdColorCB.attr('regExp', 'repeat|repeat-x|repeat-y|no-repeat');
		bgdColorCB.attr('value', ppValue);
		bgddata.backgroundColor = ppValue;
		this.connect(this.bgdColorCB, "onChange", dojo.hitch(this, function(event){
			this._onChangeColor(event, this.bgdColorCB, this._bgcolor_action);
		}));
		bgProps['background-color'].bgdWidget = this.bgdColorCB;

	

		var ppRepeatCB = bgProps['background-repeat'].comboBox;
		ppValue = ppRepeatCB.attr('value');
		var bgdRepeatCB = this.bgdRepeatCB;
		bgdRepeatCB.attr('store', ppRepeatCB.store);
		bgdRepeatCB.attr('regExp', 'repeat|repeat-x|repeat-y|no-repeat');
		bgdRepeatCB.attr('value', ppValue);
		bgddata.backgroundRepeat = ppValue;
		this.connect(this.bgdRepeatCB, 'onChange', dojo.hitch(this,function(){
			bgddata.backgroundRepeat = this.bgdRepeatCB.attr('value');
			this._onFieldChanged();
		}));
		bgProps['background-repeat'].bgdWidget = this.bgdRepeatCB;

		var ppPositionCB = bgProps['background-position'].comboBox;
		ppValue = ppPositionCB.attr('value');
		var bgdPositionCB = this.bgdPositionCB;
		bgdPositionCB.attr('store', ppPositionCB.store);
//FIXME: regexp is wrong
		bgdPositionCB.attr('regExp', 'auto|contain|cover|'+CssUtils.regstr_posn);
		bgdPositionCB.attr('value', ppValue);
		bgddata.backgroundPosition = ppValue;
		this.connect(this.bgdPositionCB, 'onChange', dojo.hitch(this,function(){
			bgddata.backgroundPosition = this.bgdPositionCB.attr('value');
			this._onFieldChanged();
		}));
		bgProps['background-position'].bgdWidget = this.bgdPositionCB;

		var ppSizeCB = bgProps['background-size'].comboBox;
		ppValue = ppSizeCB.attr('value');
		var bgdSizeCB = this.bgdSizeCB;
		bgdSizeCB.attr('store', ppSizeCB.store);
		bgdSizeCB.attr('regExp', 'border-box|padding-box|content-box');
		bgdSizeCB.attr('value', ppValue);
		bgddata.backgroundSize = ppValue;
		this.connect(this.bgdSizeCB, 'onChange', dojo.hitch(this,function(){
			bgddata.backgroundSize = this.bgdSizeCB.attr('value');
			this._onFieldChanged();
		}));
		bgProps['background-size'].bgdWidget = this.bgdSizeCB;

		var ppOriginCB = bgProps['background-origin'].comboBox;
		ppValue = ppOriginCB.attr('value');
		var bgdOriginCB = this.bgdOriginCB;
		bgdOriginCB.attr('store', ppOriginCB.store);
		bgdOriginCB.attr('value', ppValue);
		bgddata.backgroundOrigin = ppValue;
		this.connect(this.bgdOriginCB, 'onChange', dojo.hitch(this,function(){
			bgddata.backgroundOrigin = this.bgdOriginCB.attr('value');
			this._onFieldChanged();
		}));
		bgProps['background-origin'].bgdWidget = this.bgdOriginCB;

		var ppClipCB = bgProps['background-clip'].comboBox;
		ppValue = ppClipCB.attr('value');
		var bgdClipCB = this.bgdClipCB;
		bgdClipCB.attr('store', ppClipCB.store);
		bgdClipCB.attr('value', ppValue);
		bgddata.backgroundClip = ppValue;
		this.connect(this.bgdClipCB, 'onChange', dojo.hitch(this,function(){
			bgddata.backgroundClip = this.bgdClipCB.attr('value');
			this._onFieldChanged();
		}));
		bgProps['background-clip'].bgdWidget = this.bgdClipCB;

		var store = new davinci.ve.widgets.MutableStore({values:['to bottom','to top','to right','to left','45deg','-45deg']});
   		this.bgdLinearAngleCB.attr('store', store);
   		this.bgdLinearAngleCB.attr('regExp', CssUtils.regstr_angle);
   		this.bgdLinearAngleCB.attr('value', (bgddata && bgddata.angle) ? bgddata.angle : 'to bottom');
		this.connect(this.bgdLinearAngleCB, 'onChange', dojo.hitch(this,function(){
			bgddata.angle = this.bgdLinearAngleCB.attr('value');
			this._onFieldChanged();
		}));

		var store = new davinci.ve.widgets.MutableStore({values:['center','left top','center center','right bottom','0% 0%','0px 0px']});
   		this.bgdRadialPosCB.attr('store', store);
   		this.bgdRadialPosCB.attr('regExp', CssUtils.regstr_posn);
   		this.bgdRadialPosCB.attr('value', (bgddata && bgddata.posn) ? bgddata.posn : 'center');
		this.connect(this.bgdRadialPosCB, 'onChange', dojo.hitch(this,function(){
			bgddata.posn = this.bgdRadialPosCB.attr('value');
			this._onFieldChanged();
		}));

		var store = new davinci.ve.widgets.MutableStore({values:['circle','ellipse']});
   		this.bgdRadialShapeCB.attr('store', store);
   		this.bgdRadialShapeCB.attr('regExp', CssUtils.regstr_shape);
   		this.bgdRadialShapeCB.attr('value', (bgddata && bgddata.shape) ? bgddata.shape : 'circle');
		this.connect(this.bgdRadialShapeCB, 'onChange', dojo.hitch(this,function(){
			bgddata.shape = this.bgdRadialShapeCB.attr('value');
			this._onFieldChanged();
		}));

		var store = new davinci.ve.widgets.MutableStore({values:['farthest-corner','farthest-side','closest-corner','closest-side']});
   		this.bgdRadialExtentCB.attr('store', store);
   		this.bgdRadialExtentCB.attr('regExp', CssUtils.regstr_extent);
   		this.bgdRadialExtentCB.attr('value', (bgddata && bgddata.extent) ? bgddata.extent : 'farthest-corner');
		this.connect(this.bgdRadialExtentCB, 'onChange', dojo.hitch(this,function(){
			bgddata.extent = this.bgdRadialExtentCB.attr('value');
			this._onFieldChanged();
		}));
		
		var stops;
		if(bgddata && bgddata.stops && bgddata.stops.length>=2){
			stops = bgddata.stops; // {color:, pos:}
		}else{
			stops = [{color:'white',pos:'0%'},{color:'black',pos:'100%'}];
		}
		this._initializeStops(stops);
	},
	startup: function(){
		this.inherited(arguments);
		/* back ground image box */
		
		this._filePicker.attr('value', (this.bgddata && this.bgddata.url) ? this.bgddata.url : '');
		this.connect(this._filePicker, 'onChange', dojo.hitch(this,function(){
			this.bgddata.url = this._filePicker.attr('value');
			this._onFieldChanged();
		}));
		
	},
	/*
	 * This is the base location for the file in question.  Used to caluclate relativity for url(...)
	 */
	_setBaseLocationAttr : function(baseLocation){
		dojo.attr(this._filePicker, "baseLocation", baseLocation);
	},

	_updateBackgroundImageType : function(type){
		var domNode = this.domNode;
		if(!(type && (type=='none' || type=='url' || type=='linear' || type=='radial' || type=='other'))){
			type = 'emptystring';
		}
		this.bgddata.type = type;
		this.bgdTypeSelect.attr('value', type);
		var bgdOptionsLabelRows = dojo.query('.bgdOptionsLabelRow', domNode);
		var bgdImageOptRows = dojo.query('.bgdImageOptRow', domNode);
		var bgdGradOptRows = dojo.query('.bgdGradOptRow', domNode);
		var bgdLinearOptRows = dojo.query('.bgdLinearOptRow', domNode);
		var bgdRadialOptRows = dojo.query('.bgdRadialOptRow', domNode);
		var bgdOtherRows = dojo.query('.bgdOtherRow', domNode);
		if(type == 'url'){
			bgdImageOptRows.concat(bgdOptionsLabelRows).forEach(function(row){
				dojo.removeClass(row, 'dijitHidden');
			});
			bgdGradOptRows.concat(bgdOtherRows).forEach(function(row){
				dojo.addClass(row, 'dijitHidden');
			});
		}else if(type == 'linear'){
			bgdGradOptRows.concat(bgdOptionsLabelRows).forEach(function(row){
				dojo.removeClass(row, 'dijitHidden');
			});
			bgdImageOptRows.concat(bgdRadialOptRows).concat(bgdOtherRows).forEach(function(row){
				dojo.addClass(row, 'dijitHidden');
			});
		}else if(type == 'radial'){
			bgdGradOptRows.concat(bgdOptionsLabelRows).forEach(function(row){
				dojo.removeClass(row, 'dijitHidden');
			});
			bgdImageOptRows.concat(bgdLinearOptRows).concat(bgdOtherRows).forEach(function(row){
				dojo.addClass(row, 'dijitHidden');
			});
		}else if(type == 'other'){
			bgdOtherRows.forEach(function(row){
				dojo.removeClass(row, 'dijitHidden');
			});
			bgdImageOptRows.concat(bgdGradOptRows).concat(bgdOptionsLabelRows).forEach(function(row){
				dojo.addClass(row, 'dijitHidden');
			});
		}else{	// 'none'
			bgdImageOptRows.concat(bgdGradOptRows).concat(bgdOptionsLabelRows).concat(bgdOtherRows).forEach(function(row){
				dojo.addClass(row, 'dijitHidden');
			});
		}
	},
	
	_initializeStops: function(stops){
		CssUtils = davinci.ve.utils.CssUtils;
		if(!stops){
			stops = this.bgddata.stops;
		}

		var bgdType = this.bgdTypeSelect.attr('value');
		var stopRows = dojo.query('.bgdStopRow', this.domNode);
		// Destroy all existing stop rows except for the heading row (#0)
		for(var i=stopRows.length-1; i>0; i--){
			var rowNode = stopRows[i];
			var colorSelectNodes = dojo.query('.bgdColor', rowNode);
			var colorSelect = dijit.byNode(colorSelectNodes[0]);
			colorSelect.destroyRecursive();
			var posSelectNodes = dojo.query('.bgdPosition', rowNode);
			var posSelect = dijit.byNode(posSelectNodes[0]);
			posSelect.destroyRecursive();
			dojo.destroy(rowNode);
		}
		// Create a TR for each stop in stops array and insert after gradient heading row
		var gradHeaderNode = stopRows[0];
		var gradHeaderParentNode = gradHeaderNode.parentNode;
		var gradHeaderNextSibling = gradHeaderNode.nextSibling;
		for(var i=0; i<stops.length; i++){
			var stop = stops[i];
			var newStopRow = dojo.create('tr',{'className':'bgdGradOptRow bgdStopRow'});
			newStopRow.innerHTML = this.stopRowTemplate;
			if(bgdType != 'linear' && bgdType != 'radial'){
				dojo.addClass(newStopRow, 'dijitHidden');
			}
			gradHeaderParentNode.insertBefore(newStopRow, gradHeaderNextSibling);
			dojo.parser.parse(newStopRow);
			var labelNodes = dojo.query('.bdgStopLabel', newStopRow);
			labelNodes[0].innerHTML = this.langObj.bgdStop + ' #' + (i+1) + ':';
			var colorSelectNodes = dojo.query('.bgdColor', newStopRow);
			var colorSelect = dijit.byNode(colorSelectNodes[0]);
			colorSelect.attr('store', this._stops_store);
			colorSelect.attr('regExp', CssUtils.regstr_stop_color);
			colorSelect.attr('value', stop.color);
			this.connect(colorSelect, "onChange", dojo.hitch(this, function(colorSelect, event){
				this._onChangeColor(event, colorSelect, this._stops_action);
			}, colorSelect));
			var posSelectNodes = dojo.query('.bgdPosition', newStopRow);
			var posSelect = dijit.byNode(posSelectNodes[0]);
			posSelect.attr('store', this.stoppos_store);
			var pos = (typeof stop.pos == 'string' && stop.pos.length > 0) ? stop.pos : (i==0) ? '0%' : '100%';
			posSelect.attr('regExp', CssUtils.regstr_stop_pos);
			posSelect.attr('value', pos);
			this.connect(posSelect, 'onChange', dojo.hitch(this,function(){
				this._updateDataStructureStops();
				this._onFieldChanged();
			}));
			var plusNode = dojo.query('.bgdPlusButton', newStopRow)[0];
			var plusButton = dijit.byNode(plusNode);
			this.connect(plusButton, 'onClick', dojo.hitch(this, function(rownum){
				var stop = this.bgddata.stops[rownum];
				// Duplicate row <rownum>
				this.bgddata.stops.splice(rownum+1, 0, {color:stop.color, pos:stop.pos});
				this._initializeStops();
			}, i));
			var minusNode = dojo.query('.bgdMinusButton', newStopRow)[0];
			var minusButton = dijit.byNode(minusNode);
			this.connect(minusButton, 'onClick', dojo.hitch(this, function(rownum){
				var stop = this.bgddata.stops[rownum];
				// Remove row <rownum>
				this.bgddata.stops.splice(rownum, 1);
				this._initializeStops();
			}, i));
			var minusNodes = dojo.query('.bgdMinusButton', this.domNode);
			// If only 2 stops, disable the minus buttons
			for(var j=0; j<minusNodes.length; j++){
				var minusNode = minusNodes[j];
				var minusButton = dijit.byNode(minusNode);
				if(stops.length <= 2){
					minusButton.attr('disabled', true);
				}else{
					minusButton.attr('disabled', false);
				}
			}
		}
		this._updateDataStructureStops();
	},
	
	_onFieldChanged: function(){
		this._updateDialogValidity();
		this._updateBackgroundPreview();
	},
	
	_updateDialogValidity: function() {
		var bgddata = this.bgddata;
		if(!bgddata || !bgddata.type){
			return;
		}
		var domNode = this.domNode;
		var type = bgddata.type;
		var validityCheckRows=[];
		var valid = true;
		
		if(type == 'url'){
			validityCheckRows = dojo.query('.bgdImageOptRow', domNode);
		}else if(type == 'linear'){
			validityCheckRows = dojo.query('.bgdStopRow', domNode).concat(dojo.query('.bgdLinearOptRow', domNode));
		}else if(type == 'radial'){
			validityCheckRows = dojo.query('.bgdStopRow', domNode).concat(dojo.query('.bgdRadialOptRow', domNode));
		}
		validityCheckRows.forEach(function(row){
			var widgets = dojo.query("[widgetid]", row);
			widgets.forEach(function(w){
				if(typeof w.isValid == 'function' && !w.isValid()){
					valid = false;
				}
			});
		});
		this.bdgValid = valid;
		this._okButton.attr('disabled', !valid);
	},

	_updateBackgroundPreview: function(){
//FIXME: Only supports gradients so far
	
		var CssUtils = davinci.ve.utils.CssUtils;
		var previewSpan = dojo.query('.bgdPreview', this.domNode)[0];
		var a = CssUtils.buildBackgroundImage(this.bgddata);
		previewSpan.style.backgroundColor = '';
		previewSpan.style.backgroundImage = '';
		var styleText = previewSpan.style.cssText;
		backgroundColor = this.bgddata.backgroundColor;
		if(typeof backgroundColor == 'string' && backgroundColor.length>0){
			styleText += ';background-color:' + backgroundColor;
		}
		for (var i=0; i<a.length; i++){
			styleText += ';background-image:' + a[i];
		}
		previewSpan.setAttribute('style', styleText);
		
		//FIXME: Refactor code so that we don't have to rely on updating background preview
		// to update this field
		// Stuff latest into "other" textarea
		this.bgdOtherTA.attr('value', a[a.length-1]);

	},

	_updateDataStructureStops: function(){
		// Update bdgdata.stops from latest values in dialog fields (note: "bgd"=background dialog)
		// NOTE: During dialog initialization, this routine gets called N times, where N=(#stoprows*2)+1
		// because Dojo appears to stuff values into form fields asynchronously, causing onChange events
		// on color stop form fields even though the code above sets the value before
		// establishing the onChange event handler
		var bgddata = this.bgddata;
		bgddata.stops = [];
		var stopRows = dojo.query('.bgdStopRow', this.domNode);
		// Ignore the heading row (#0)
		for(var i=1; i<stopRows.length; i++){
			var rowNode = stopRows[i];
			var colorSelectNodes = dojo.query('.bgdColor', rowNode);
			var colorSelect = dijit.byNode(colorSelectNodes[0]);
			var posSelectNodes = dojo.query('.bgdPosition', rowNode);
			var posSelect = dijit.byNode(posSelectNodes[0]);
			bgddata.stops.push({ color:colorSelect.attr('value'), pos:posSelect.attr('value') });
		}
	},

	/**
	 * The setter function for this dialog is only used to field values returned
	 * by the color picker.
	 * @param value  new color value
	 */
	_setValueAttr : function(value){
		if(value){
			// This will trigger _onChangeColor
			this._colorPickerTargetWidget.attr('value', value);
		}
	},

	_onChangeColor: function(event, targetComboBox, actions){
		var action = actions[event];
		if(action){
			if(action == '_removevalue'){
				targetComboBox.attr('value', '');
			}else{
				// restore old value
				targetComboBox.attr('value', targetComboBox._currentcolorvalue);
			}
			if(action == '_colorpicker'){
				var colorPickerFlat = new davinci.ve.widgets.ColorPickerFlat({});
				var initialValue = targetComboBox.get("value");
				var isLeftToRight = this.isLeftToRight();
				this._colorPickerTargetWidget = targetComboBox;
				davinci.ve.widgets.ColorPickerFlat.show(colorPickerFlat, initialValue, this, isLeftToRight);
			}
		}
		targetComboBox._currentcolorvalue = targetComboBox.attr('value');
		
		// Update bgddata for all color fields even though only one of them has changed
		this.bgddata.backgroundColor = this.bgdColorCB.attr('value');
		this._updateDataStructureStops();
		this._onFieldChanged();	
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