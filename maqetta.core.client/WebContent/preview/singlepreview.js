define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        './silhouetteiframe',
        'dijit/form/Button',
        'dijit/form/HorizontalSlider',
        'dijit/form/HorizontalRuleLabels',
        'dijit/form/Select',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dojo/query',
        'dojo/dom-class',
        'dojo/_base/connect', // deprecated
        'dojo/i18n!preview/nls/preview'],
	function(declare, _WidgetBase, Silhouette, Button, HorizontalSlider, HorizontalRuleLabels, Select, lang, construct, query, domClass, connect, langObj){

return declare([_WidgetBase], {

	currentDevice:0,
	currentZoom:1,
	orientation:'portrait',
	scalefactor:1,
	showZoom:true,
	margin:0,
	pathToPreviewerFolder:'preview/',

	// make sure browsers don't used cache iframe contents from last time
	// should this be shared on the prototype across instances?
	_randomUrlParam:'&'+Math.random()+'=1', 
	
	buildRendering: function() {
		this._connects=[];
		if(this.devicelist && this.devicelist.length && this.iframefilename){
			this.addStyleDeclarations();
			this.domNode = this.srcNodeRef;
			this.domNode.innerHTML = lang.replace('<table border="0" cellspacing="0" cellpadding="0">'+
				//FIXME: pushed to text-align:left to avoid layout jumping upon zooming
				//but maybe can restore to text-align:center if clever tricks prevent
				//layout jumping even if centered
					'<tr><td style="text-align:left;">'+
					'<div class="controlbar">'+
					'<span class="controlbar_label">{device}</span>'+
					'<span class="controlbar_container controlbar_container_device"><span class="controlbar_device"></span></span>'+
					'<span class="controlbar_label controlbar_label_zoom">{zoom}</span>'+
					'<span class="controlbar_container controlbar_container_zoom"><span class="controlbar_zoom_labels"></span><span class="controlbar_zoom"></span></span>'+
					'<span class="controlbar_label">{angle}</span>'+
					'<span class="controlbar_container controlbar_container_angle"><span class="controlbar_angle"></span></span>'+
					'</div>'+
					'</td></tr>'+
				//FIXME: pushed to text-align:left to avoid layout jumping upon zooming
				//but maybe can restore to text-align:center if clever tricks prevent
				//layout jumping even if centered
					'<tr><td style="text-align:left;">'+
				//FIXME: replace inline style with something in a stylesheet
					'<div class="silhouette_container" style="display:inline-block"></div>'+
					'</td></tr></table>', langObj);
			if(!this.showZoom){
				query('.controlbar_label_zoom',this.domNode)[0].style.display='none';
				query('.controlbar_container_zoom',this.domNode)[0].style.display='none';
			}
			this.initControls();
		}else{
			console.log('preview.singlepreview.buildRendering(): Missing required parameters devicelist and iframefilename');
		};
	},

	addStyleDeclarations: function(){
		// Only add style declarations if not already there
		var style_elems = query('style.singlepreview_styles');
		if(!style_elems.length){
			var head_elem = document.querySelectorAll('head')[0];
			if(!head_elem){
				console.error('silhouetteiframe.js addStyleDeclarations(): no HEAD element');
				return;
			}
			construct.create('style',{
				type:'text/css',
				'class':'singlepreview_styles',
				innerHTML: 
					'.controlbar { line-height:1.25em; }\n'+
					'.controlbar_label { display:inline-block; vertical-align:middle; margin-top:14px; margin-left:.75em; }\n'+
					'.controlbar_container { display:inline-block; vertical-align:top; }\n'+
					'.controlbar_container_device { margin:9px 7px 0 1px; }\n'+
					'.controlbar_container_zoom { margin-right:6px; }\n'+
					'.controlbar_container_angle { margin:9px 9px 0 1px; }\n'+
					'.control_angle { width:16px; height:16px; }\n'+
					'.control_angle_cw { background-image:url('+this.pathToPreviewerFolder+'images/rotate_cw.png); }\n'+
					'.control_angle_ccw { background-image:url('+this.pathToPreviewerFolder+'images/rotate_ccw.png); }\n'+
					'.controlbar .controlbar_container.controlbar_container_angle .dijitButtonNode { padding: 0px; }'
			},head_elem);
		}
	},

	initControls: function(){
		var select_device_node = query('.controlbar_device',this.domNode)[0];
		var device_select = this.device_select = new Select({},select_device_node);
		device_select.addOption(this.devicelist);
		// Timeout to prevent initial widget loading from trigger onChange handler
		setTimeout(lang.hitch(this, function(){
			this.connect(device_select, 'onChange', function(newvalue){
				if(newvalue != this.currentDevice){
					this.currentDevice = newvalue;
					var theme = Silhouette.getMobileTheme(this.devicelist[this.currentDevice].file);
					var iframefilename_with_params = this.iframefilename+'?theme='+theme+this._randomUrlParam;
					if (this.iframeSearch) {
						iframefilename_with_params += "&" + this.iframeSearch;
					}
					this.update_silhouette_container(iframefilename_with_params);
				}
			});
		}), 1);

		if(this.showZoom){
			var zoom_node = query('.controlbar_zoom',this.domNode)[0],
				zoom_labels_node = query('.controlbar_zoom_labels',this.domNode)[0],
				sliderLabels = this.sliderLabels = new HorizontalRuleLabels({
					container: "topDecoration",
					count: 14,
					labels: ['',0,'','',1,'','',2,'','',3,''],
					style: "height:1.5em;font-size:100%;color:gray; width:74px"
				}, zoom_labels_node),
				zoom_select = this.zoom_select = new HorizontalSlider({
					value: this.currentZoom,
					minimum: .2,
					maximum: 3,
					intermediateChanges: true,
					showButtons: false,
					style: "width:75px;"
				},
				zoom_node);
			this.connect(zoom_select, 'onChange', lang.hitch(this, function(){
				if(zoom_select.value != this.currentZoom){
					this.currentZoom = zoom_select.value;
					this.silhouetteiframe.setScaleFactor(this.currentZoom);
				}
			}));
		}

		var angle_node = query('.controlbar_angle',this.domNode)[0];
		var cw_ccw_class = (this.orientation == 'landscape') ? 'control_angle_ccw' : 'control_angle_cw';
		var angle_select = this.angle_select = new Button({ 
				iconClass:"control_angle "+cw_ccw_class,
				showLabel:false
//				style:"width:16px; height:16px;"
			}, angle_node);
		this.connect(angle_select, 'onClick', lang.hitch(this, function(){
			var iconnode = query('.control_angle',this.domNode)[0];
			if(this.orientation == 'landscape'){
				this.orientation = 'portrait';
				domClass.remove(iconnode, 'control_angle_ccw');
				domClass.add(iconnode, 'control_angle_cw');
			}else{
				this.orientation = 'landscape';
				domClass.remove(iconnode, 'control_angle_cw');
				domClass.add(iconnode, 'control_angle_ccw');
			}
			this.silhouetteiframe.setOrientation(this.orientation);	
		}));
		var theme = Silhouette.getMobileTheme(this.devicelist[this.currentDevice].file);
		var iframefilename_with_params = this.iframefilename+'?theme='+theme+this._randomUrlParam;
		if (this.iframeSearch) {
			iframefilename_with_params += "&" + this.iframeSearch;
		}
		this.update_silhouette_container(iframefilename_with_params);
	},

	update_silhouette_container: function(iframefilename_with_params){
		if(this.silhouetteiframe_connect_onload){
			connect.disconnect(this.silhouetteiframe_connect_onload);
			delete this.silhouetteiframe_connect_onload;
		}
		var silhouette_container = query(".silhouette_container",this.domNode)[0];
		silhouette_container.innerHTML = '<div class="silhouette_div_container">'+
			'<span class="silhouetteiframe_object_container"></span>'+
			'<iframe src="'+iframefilename_with_params+'" class="silhouetteiframe_iframe"></iframe>'+
			'</div>';
		var silhouette_div_container=query('.silhouette_div_container',silhouette_container)[0];
		
		// Don't start rendering silhouette until iframe is loaded
		var silhouetteiframe_iframe=query('.silhouetteiframe_iframe',silhouette_container)[0];
		this.silhouetteiframe_connect_onload = connect.connect(silhouetteiframe_iframe, 'onload', lang.hitch(this, function(){
			this.silhouetteiframe = new Silhouette({
				rootNode:silhouette_div_container,
				svgfilename:this.devicelist[this.currentDevice].file,
				orientation:this.orientation,
				scalefactor:this.scalefactor,
				margin:this.margin
			});
		}));	
	},
	
	destroy: function(preserveDom){
		if(this.silhouetteiframe_connect_onload){
			connect.disconnect(this.silhouetteiframe_connect_onload);
			delete this.silhouetteiframe_connect_onload;
		}
		this.device_select.destroy();
		this.sliderLabels.destroy();
		this.zoom_select.destroy();
		this.angle_select.destroy();
		this.inherited("destroy",arguments);
	}

});

});
