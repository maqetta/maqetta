define([
    	"dojo/_base/declare",
    	"dojo/i18n!davinci/ve/nls/ve",
    	"dojo/i18n!dijit/nls/common",
    	"dijit/layout/TabContainer",
    	"dijit/layout/ContentPane",
    	"davinci/Runtime",
    	"davinci/workbench/WidgetLite",
    	"davinci/ve/widgets/HTMLStringUtil",
    	"davinci/ve/widgets/WidgetToolBar",
    	"davinci/ve/widgets/Cascade",
    	"davinci/ve/widgets/CommonProperties",
    	"davinci/ve/widgets/WidgetProperties",
    	"davinci/ve/widgets/EventSelection"
], function(declare, veNls, commonNls, TabContainer, ContentPane, Runtime, WidgetLite, HTMLStringUtil,
		   	WidgetToolBar,  Cascade, CommonProperties, WidgetProperties, EventSelection
		    ){
return declare("davinci.ve.views.SwitchingStyleView", [WidgetLite], {


	/* FIXME: These won't expand into pageTemplate. Not sure if that's a JS issue or dojo.declare issue.
	 * Temporary copied into each property below but would be better if could get reusable values working somehow.
	_paddingMenu:['', '0px', '1em'],
	_radiusMenu:['', '0px', '6px'],
	 */
	
	_editor : null,	// selected editor
	_widget : null,	// selected widget
	_subWidget : null,	// selected sub widget

	constructor: function(params, srcNodeRef){
    	dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
		dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
		dojo.subscribe("/davinci/states/state/changed", dojo.hitch(this, this._stateChanged));
		dojo.subscribe("/maqetta/appstates/state/changed", dojo.hitch(this, this._stateChanged));
	},

	pageTemplate : [
	                
	          //Note: the keys here must match the propsect_* values in the supports() functions
	          //in the various editors, such as PageEditor.js and ThemeEditor.js
	          
	          {key: "common",
	        	  className:'page_editor_only',
	        	  pageTemplate:{html: "<div dojoType='davinci.ve.widgets.CommonProperties'></div>"}},
	          {key: "widgetSpecific",
	        	  className:'page_editor_only',
	        	  html: "<div dojoType='davinci.ve.widgets.WidgetProperties'></div>"},  
	          {key: "events",
	        	  className:'page_editor_only',
		          pageTemplate:{html: "<div dojoType='davinci.ve.widgets.EventSelection'></div>"}},
	          {key: "layout",
		       	  /* startsNewGroup:true, // This flag causes a few extra pixels between this and previous button */
	           	  pageTemplate:[{display:"width", type:"multi", target:["width"], values:['', 'auto','100%','200px','10em']},
	            	                
    	                {display:"height", type:"multi", target:["height"], values:['','auto','100%','200px','10em']},
    	                {html:"&nbsp;"},
    	                {key: "showMinMax", display:"&nbsp;&nbsp;&nbsp;", type:"toggleSection",
    	                	pageTemplate:[{display:"min-height", type:"multi", target:["min-height"], rowClass:"propertiesSectionHidden"},
                                {display:"max-height", type:"multi", target:["max-height"], rowClass:"propertiesSectionHidden"},
                                {display:"min-width", type:"multi", target:["min-width"], rowClass:"propertiesSectionHidden"},
            	                {display:"max-width", type:"multi", target:["max-width"], rowClass:"propertiesSectionHidden"},
            	                {html:"&nbsp;", rowClass:"propertiesSectionHidden"}]},
    	                {display:"position", type:"combo", target:["position"], values:['', 'absolute','fixed','relative','static']},
    	                {display:"left", type:"multi", target:["left"], values:['', '0px', '1em']},
    	                {display:"top", type:"multi", target:["top"], values:['', '0px', '1em']},
    	                {display:"display", type:"combo", target:["display"], values:['','none','block','inline','inline-block']},
    	                {display:"opacity", type:"multi", target:["opacity"], values:['0','0.5','1.0']},
    	                {display:"box-shadow", type:"text", target:["box-shadow"], value:['','none','1px 1px rgba(0,0,0,.5)']},
    	                {display:"float", type:"combo", target:["float"], values:['','none','left','right']},
    	                {display:"clear", type:"combo", target:["clear"], values:['','none','left','right','both']},
    	                {display:"overflow", type:"combo", target:["overflow"], values:['','visible','hidden','scroll','auto']},
    	                {display:"z-index", type:"multi", target:["z-index"], values:['','auto','0','1','100','-1','-100']},
    	                {display:"box-sizing", type:"combo", target:['box-sizing','-webkit-box-sizing','-ms-box-sizing','-moz-box-sizing'], values:['','content-box','border-box']}
	            	   ]},
	           {key: "padding", 
  	           	  pageTemplate:[
      	                {display:"<b>(padding)</b>", type:"multi", target:["padding"], values:['', '0px', '1em']},
  		                 {key: "showtrbl", display:"&nbsp;&nbsp;&nbsp;", type:"toggleSection",
      	                	pageTemplate:[
      		 			       {display:"padding-top", type:"multi", target:["padding-top"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
      		 			       {display:"padding-right", type:"multi", target:["padding-right"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
      		 			       {display:"padding-bottom", type:"multi", target:["padding-bottom"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
      		 			       {display:"padding-left", type:"multi", target:["padding-left"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"}
      	                	]}
      	                ]},	
	           {key: "margins", 	
	           	  pageTemplate:[
    	                {display:"<b>(margin)</b>", type:"multi", target:["margin"], values:['', '0px', '1em']},
		                 {key: "showtrbl", display:"&nbsp;&nbsp;&nbsp;", type:"toggleSection",
    	                	pageTemplate:[
    		 			       {display:"margin-top", type:"multi", target:["margin-top"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-right", type:"multi", target:["margin-right"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-bottom", type:"multi", target:["margin-bottom"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-left", type:"multi", target:["margin-left"], values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"}
    	                	]}
    	                ]},
	           {key: "background", 
	       		  pageTemplate : [
	      	       		{display:"background-color", type:"background", target:['background-color'], colorswatch:true},
	    	       		{display:"background-image", type:"background", target:['background-image'], values:['', 'none']},
    		       	    {display:"background-repeat", type:"background", values:['', 'repeat', 'repeat-x','repeat-y','no-repeat'],  target:['background-repeat'] },
    		       	    {display:"background-position", type:"background", target:['background-position'], values:['','0px 0px','0% 0%','left top','center center','right bottom']},
    		       	    {display:"background-size", type:"background", target:['background-size'], values:['','auto','contain','cover','100%']},
    		       	    {display:"background-origin", type:"background", target:['background-origin'], values:['','border-box','padding-box','content-box']},
    		       	    {display:"background-clip", type:"background", target:['background-clip'], values:['','border-box','padding-box','content-box']}
    		       	   ]},
	           {key:"border", 
		       		pageTemplate : [
   		                {display:"<b>(border)</b>", type:"multi", target:['border'], values:['','none','1px solid black']}, 
   		                {display:"show", type:"combo", values:['none','sides','props','all'],
		       				onchange:function(propIndex){
   		                		if(typeof propIndex != "number"){
   		                			return;
   		                		}
		       					var showRange=function(sectionData,first,last,begin,end){
		       						for(var k=first;k<=last;k++){
		       							var thisProp = sectionData[k];
		       							var thisRow = dojo.byId(thisProp.rowId);
		       							if(k>=begin && k<=end){
		       								dojo.removeClass(thisRow,"propertiesSectionHidden");
		       							}else{
		       								dojo.addClass(thisRow,"propertiesSectionHidden");
		       							}
		       						}
		       					};
		       					if(this.pageTemplate){
		       						var propObj = this.pageTemplate[propIndex];
		       						var value;
		       						if(propObj && propObj.id){
		       							value = dojo.byId(propObj.id).value;
		       						}
		       						// In some circumstances, value is undefined, which causes exception.
		       						// Make sure it is a string.
		       						if(dojo.isString(value)){
			       						if(value==='none'){
			       							showRange(this.pageTemplate,2,20,-1,-1);
			       						}else if(value==='sides'){
			       							showRange(this.pageTemplate,2,20,2,5);
			       						}else if(value==='props'){
			       							showRange(this.pageTemplate,2,20,6,8);
			       						}else if(value==='all'){
			       							showRange(this.pageTemplate,2,20,9,20);
			       						}
		       						}
		       					}
		       				}
   		                },
   		                {display:"border-top", type:"multi", target:['border-top'], values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right", type:"multi", target:['border-right'], values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom", type:"multi", target:['border-bottom'], values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left", type:"multi", target:['border-left'], values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                
   		              
   		                {display:"border-width", type:"multi", target:['border-width'], values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-style", type:"multi", target:['border-style'], values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-color", type:"color", target:['border-color'],rowClass:'propertiesSectionHidden'},
   		            	       	    
   		                {display:"border-top-width", type:"multi", target:['border-top-width'], values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-top-style", type:"multi", target:['border-top-style'], values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-top-color", type:"color", target:['border-top-color'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-width", type:"multi", target:['border-right-width'], values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-style", type:"multi", target:['border-right-style'],values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-color", type:"color", target:['border-right-color'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-width", type:"multi", target:['border-bottom-width'], values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-style", type:"multi", target:['border-bottom-style'], values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-color", type:"color", target:['border-bottom-color'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-width", type:"multi", target:['border-left-width'], values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-style", type:"multi", target:['border-left-style'], values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-color", type:"color", target:['border-left-color'],rowClass:'propertiesSectionHidden'},
      		         {display:"border-collapse", type:"combo", target:['border-collapse'],  values:['', 'separate', 'collapse']},
   		             {display:"<b>(border-radius)</b>", type:"multi", target:['border-radius','-moz-border-radius'],  values:['', '0px', '6px']},
	                 {key: "showDetails", display:"", type:"toggleSection",
 	                	pageTemplate:[
		                     {display:"border-top-left-radius", type:"multi", target:["border-top-left-radius",'-moz-border-radius-topleft'], values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-top-right-radius", type:"multi", target:['border-top-right-radius','-moz-border-radius-topright'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-bottom-right-radius", type:"multi", target:['border-bottom-right-radius','-moz-border-radius-bottomright'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-bottom-left-radius", type:"multi", target:['border-bottom-left-radius','-moz-border-radius-bottomleft'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"}
	    	                ]}
		            	  ]},
	           {key: "fontsAndText",
	                  pageTemplate:[{display:"font", type:"text", target:["font"]},
                        {display:"font-family", type:"font", target:["font-family"]},
    	                {display:"size", type:"multi", target:["font-size"], values:['','100%','1em','10px','10pt']},
    	                {display:"color", type:"color", target:["color"]},
    	                {display:"font-weight", type:"combo", target:["font-weight"], values:['','normal', 'bold']},
    	                {display:"font-style", type:"combo", target:["font-style"], values:['','normal', 'italic']},
    	                {display:"text-decoration", type:"combo", target:["text-decoration"], values:['','none', 'underline', 'line-through']},
    	                {display:"text-align", type:"combo", target:["text-align"], values:['','left', 'center','right', 'justify']},
    	                {display:"vertical-align", type:"combo", target:["vertical-align"], values:['','baseline', 'top', 'middle','bottom']},
    	                {display:"white-space", type:"combo", target:['white-space'], values:['','normal','nowrap','pre','pre-line','pre-wrap']},
    	                {display:"text-indent", type:"multi", target:["text-indent"], values:['','0','1em','10px']},
    	                {display:"line-height", type:"multi", target:["line-height"], values:['','normal','1.2','120%']}
    	                ]},
 	           {key: "shapesSVG",
	                  pageTemplate:[{display:"stroke", type:"color", target:["stroke"]},
    	                {display:"stroke-width", type:"multi", target:["stroke-width"], values:['','1', '2', '3', '4', '5', '10']},
    	                {display:"fill", type:"color", target:["fill"]}
    	                ]}
		      /*,
             {title:"Animations",
	                pageTemplate:[{html:"in progress..."}]}, 
	         {title:"Transistions",
	                pageTemplate:[{html:"in progress..."}]}, 
	         {title:"Transforms",
	                pageTemplate:[{html:"in progress..."}]},*/ 
	                                                          
	],
	
	
	
	buildRendering: function(){
		this.domNode = dojo.doc.createElement("div");
		dojo.addClass(this.domNode,'propertiesContent');
		var template="";
		template+="<div id='propertiesToolBar' dojoType='davinci.ve.widgets.WidgetToolBar'></div>";
		template+="<div id='davinci_style_prop_top' class='propScrollableArea'>";
		template+="<table class='propRootDetailsContainer'>";
		template+="<tr>";
		template+="<td class='propPaletteRoot'>";
		//run through pageTemplate to insert localized strings
		var langObj = veNls; 
		for(var i=0;i<this.pageTemplate.length;i++){
			this.pageTemplate[i].title = langObj[this.pageTemplate[i].key] ? langObj[this.pageTemplate[i].key] : "Key not found";
			if(this.pageTemplate[i].pageTemplate){
				for(var j=0; j<this.pageTemplate[i].pageTemplate.length; j++){
					if(this.pageTemplate[i].pageTemplate[j].key){
						this.pageTemplate[i].pageTemplate[j].display += langObj[this.pageTemplate[i].pageTemplate[j].key] ? langObj[this.pageTemplate[i].pageTemplate[j].key] : "Key not found";
					}
				}
			}
		}
/*
		for(var i=0;i<this.pageTemplate.length;i++){
			var title=this.pageTemplate[i].title;
			// Use same styling as Dijit TitlePane
			template+='<div role="group" class="propSectionButton dijitTitlePane';
			if(this.pageTemplate[i].startsNewGroup){
				template+=' propSectionButtonStartGroup';
			}
			template+='">';
			template+='<div class="dijitTitlePaneTitle">';
			template+='<div class="dijitTitlePaneTitleFocus" role="button">';
			template+='<span class="dijitArrowNode" wairole="presentation" role="presentation">&gt;</span>';
			template+='<span class="dijitTitlePaneTextNode" style="-webkit-user-select: none; ">'+title+'</span>';
			template+='</div>';
			template+='</div>';
			template+='</div>';
		}		
		template+="</td>";
		template+="<td class='propPaletteDetails dijitHidden'>";
*/
		// Use same styling as Dijit TitlePane for breadcrumb row
		template+='<div class="dijitTitlePane cssBreadcrumbContainer">';
		template+='<div class="dijitTitlePaneTitle">';
		template+='<div class="dijitTitlePaneTitleFocus" role="button">';
		template+='<span class="dijitArrowNode" wairole="presentation" role="presentation"></span>';
		template+='<span class="dijitTitlePaneTextNode cssBreadcrumbSection" style="-webkit-user-select: none; "></span>';
		template+='</div>';
		template+='</div>';
		template+='</div>';		
/*
		for(var i=0;i<this.pageTemplate.length;i++){
			template+= HTMLStringUtil.generateTemplate(this.pageTemplate[i] );
		}
*/
template+='<div class="propPaletteTabContainer"></div>';
		template+="</td></tr></table>";
		template+="</div>";
		this.domNode.innerHTML = template;
var propPaletteTabContainerNode = this.domNode.querySelector('.propPaletteTabContainer');
if(propPaletteTabContainerNode){
	this._tabContainer = new TabContainer({'class':'propPaletteTabContainer',style:'height:265px;', tabPosition:'left-h'}, propPaletteTabContainerNode);
	var firstTab = null;
	for(var i=0;i<this.pageTemplate.length;i++){
		var title = this.pageTemplate[i].title;
		var className = this.pageTemplate[i].className;
		if(!className){
			className = '';
		}
		var content = HTMLStringUtil.generateTemplate(this.pageTemplate[i] );
		var cp = new ContentPane({title:title, content:content, 'class':className });
		this._tabContainer.addChild(cp);
		cp._maqPropGroup = this.pageTemplate[i].key;
		if(!firstTab){
			firstTab = cp;
		}
	}
	dojo.connect(this._tabContainer, 'selectChild', this, function(tab){
		this._currentPropSection = tab._maqPropGroup;
		var context = (this._editor && this._editor.getContext) ? this._editor.getContext() : null;
		var selection = (context && context.getSelection) ? context.getSelection() : [];
		this._updatePaletteValues(selection);
		HTMLStringUtil._initSection(this._currentPropSection);

	});
}
// Need a setTimeout - without it, browser sometimes hasn't layed out
// the container widgets into which the TabContainer should go.
setTimeout(function(){
	this._tabContainer.layout();	
	this._tabContainer.startup();
	this._tabContainer.selectChild(firstTab);
	HTMLStringUtil._initSection(this._currentPropSection);
}.bind(this),50);

/*
		// Put click, mouseover, mouseout handlers on the section buttons in root view
		var sectionButtons=dojo.query(".propSectionButton",this.domNode);
		for(var i=0;i<sectionButtons.length;i++){
			var sectionButton = sectionButtons[i];
			var titleNode = dojo.query(".dijitTitlePaneTitle",sectionButton);
			if(titleNode.length>0){
				dojo.removeClass(titleNode[0],"dijitTitlePaneTitleHover");
			}
			dojo.connect(sectionButton,"onclick",
				// Second parameter is callback to execute after
				// slide-in animation has completed. If we call
				// the cascade immediately after starting the animation,
				// the animation will be jerky as both the animation
				// and CSS model calls are happening at same time.
				// dojo.hitch to make sure there are different function
				// instances for each button with correct title/index values
				dojo.hitch(this, 
					function(key, title, index){
						HTMLStringUtil.transitionRootToSection(key,title,
							// dojo.hitch necessary to provide "this" object
							dojo.hitch(this,function(){
								var visibleCascade = this._getVisibleCascade(index);
								for(var j =0;j<visibleCascade.length;j++){
									visibleCascade[j]._editorSelected({'editor':this._editor});
								}
							})
						);
					},
					this.pageTemplate[i].key,this.pageTemplate[i].title,i)
			);
			dojo.connect(sectionButton,"onmouseover",
					function(event){
						var titleNode = dojo.query(".dijitTitlePaneTitle",event.currentTarget);
						if(titleNode.length>0){
							dojo.addClass(titleNode[0],"dijitTitlePaneTitleHover");
						}
					}
			);
			dojo.connect(sectionButton,"onmouseout",
					function(event){
						var titleNode = dojo.query(".dijitTitlePaneTitle",event.currentTarget);
						if(titleNode.length>0){
							dojo.removeClass(titleNode[0],"dijitTitlePaneTitleHover");
						}
					}
			);
		}
*/
		this.inherited(arguments);
		dojo.connect(this, 'resize', this, function(a, b, c){
			if(this._tabContainer && this._tabContainer.domNode && this._tabContainer.resize){
				this._tabContainer.resize();
			}
		});
			
	},
	
	_widgetValuesChanged : function(event){
/*FIXME: DELETE THIS
		var currentPropSection = HTMLStringUtil.getCurrentPropSection();
*/
var currentPropSection = this._currentPropSection;
		if(currentPropSection){
			var found=false;
			for(var propSectionIndex = 0;propSectionIndex<this.pageTemplate.length;propSectionIndex++){
				if(this.pageTemplate[propSectionIndex].key == currentPropSection){
					found=true;
					break;
				}
			}
			if(found){
				var visibleCascade = this._getVisibleCascade(propSectionIndex);
				for(var i =0;i<visibleCascade.length;i++)
					visibleCascade[i]._widgetValuesChanged(event);
			}
		}
	},
	
	_getVisibleCascade : function(targetIndex){
		if(targetIndex)
			return this.pageTemplate[targetIndex]['cascade'];
		var visibleCascade = [];
/*FIXME: DELETE THIS
		var currentPropSection = HTMLStringUtil.getCurrentPropSection();
*/
var currentPropSection = this._currentPropSection;
		if(currentPropSection){
			for(var i = 0;i<this.pageTemplate.length;i++){
				if(this.pageTemplate[i].key == currentPropSection){
					visibleCascade = visibleCascade.concat( this.pageTemplate[i]['cascade']);
					break;
				}	
			}
		}
		return visibleCascade;
	},
	
	_updatePaletteValues: function(widgets){
		//debugger;
		if(	!this._editor )
			return;
		//debugger;
		var widget=widgets[0];
		/* What about state changes and undo/redo? wdr
		 * if(this._widget == widget && this._subwidget==widget.subwidget)
			return false;
			*/
		this._widget = widget;
		this._subwidget = widget && widget.subwidget;
	
		this.setReadOnly(!(this._widget || this._subwidget));
		var visibleCascade = this._getVisibleCascade();
		for(var i =0;i<visibleCascade.length;i++)
			visibleCascade[i]._widgetSelectionChanged(widgets);
		
	},
	
	_widgetSelectionChanged: function(changeEvent){
		this._updatePaletteValues(changeEvent);
	},
	
	_stateChanged: function(){
		var widgets = this._widget ? [this._widget] : [];
		this._updatePaletteValues(widgets);
	},
	
	_widgetPropertiesChanged: function(widgets){
		/* Check to see that this is for the same widget
		 * Some widget like Tree update the DataStore but not the widget it's self from smar input
		 * Cant check the id, it may change.
		 */
		if ((!this._widget) || (this._widget.type === widgets[0].type)){
			this._updatePaletteValues(widgets);
		}
	},
	
	_titlePaneOpen : function(index){
		
		var visibleCascade = this._getVisibleCascade(index);
		for(var i =0;i<visibleCascade.length;i++){
			visibleCascade[i]._editorSelected({'editor':this._editor});
			//visibleCascade[i]._widgetSelectionChanged([this._widget]);
			
		}
		
	},
	
	startup : function(){
	
		this.domNode.style.height="100%";
		this._editor = Runtime.currentEditor;
	
		this.inherited(arguments);
		
		var propertiesToolBar = dijit.byId('propertiesToolBar');
		if(propertiesToolBar){
			propertiesToolBar.initialize();
		}

		// Install any onchange handlers for specific input elements
		for(var i=0;i<this.pageTemplate.length;i++){
			var section=this.pageTemplate[i];
			if(section.pageTemplate){
				for(var j=0;j<section.pageTemplate.length;j++){
					var propData=section.pageTemplate[j];
					if(propData.onchange && propData.id){
						// onchange function gets invoked with "this" pointing to pageTemplate[i]
						// and receives parameter j
						dojo.connect(dojo.byId(propData.id), "onchange", dojo.hitch(section,propData.onchange,j));
					}
				}
			}
		}

		for(var v=0;v<this.pageTemplate.length;v++){
			this.pageTemplate[v]['cascade'] = [];
			var page = this.pageTemplate[v]['pageTemplate'];
			if(!page)
				continue;
			for(var i = 0;i<page.length;i++){
				var  id = page[i]['id'];
				var widget = dijit.byId(id);
				if(widget){
					page[i]['widget'] = widget;	
				}else{
					widget = dojo.byId(id);
					if(widget)
						page[i]['domNode'] = widget;
				}
				/* find all cascade subsections */
				
			}
			/* find all cascade elements belong to each section and store them in an array */
			var sectionId = this.pageTemplate[v].id;
			var nodeList = dojo.query("#" + sectionId + " .CascadeTop");
			
			nodeList.forEach(function(target){ return function(p){
				var cascade = dijit.byId(p.id);
				target['cascade'].push(cascade);
			};}(this.pageTemplate[v]));
			
		}
		this.setReadOnly(true);
		this.onEditorSelected();
/*FIXME: DELETE THIS
		var context = (this._editor.getContext) ? this._editor.getContext() : null;
		var selection = (context && context.getSelection) ? context.getSelection() : [];
		this._updatePaletteValues(selection);
*/
		dojo.subscribe("/davinci/ui/widgetValuesChanged", dojo.hitch(this, this._widgetValuesChanged));
		dojo.subscribe("/davinci/ui/widgetPropertiesChanged", dojo.hitch(this, this._widgetPropertiesChanged));
		//Don't need to subscribe here. ViewLite already does it for us.
		//dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
	},
	
	
	setReadOnly : function(isReadOnly){
		for(var v=0;v<this.pageTemplate.length;v++){
			var page = this.pageTemplate[v]['pageTemplate'];
			if(!page)
				continue;
			for(var i = 0;i<page.length;i++){
				var widget = page[i]['widget'];
				if(widget)
					widget.set("readOnly", isReadOnly);
				else{
					var node = page[i].domNode;
					if(node)
						dojo.attr(node, "disabled", isReadOnly);
				}
			}
		}
	},
	
	_modelEntryById : function(id){
		for(var v=0;v<this.pageTemplate.length;v++){
			var page = this.pageTemplate[v]['pageTemplate'];
			if(!page)
				continue;
			for(var i = 0;i<page.length;i++){
				var  sectionId = page[i]['id'];
			    if(id==sectionId){
			    	return page[i];
			    }
			}
		}
	},

	_editorSelected : function(editorChange){
		
		this._editor = editorChange.editor;
		this.onEditorSelected(this._editor);
	 },	

	
	onEditorSelected : function(){
		//we should clear selected widget from the old editor
		this._widget = null;
		this._subWidget = null;

		if (this._editor && this._editor.supports("style")) {
			dojo.removeClass('davinci_style_prop_top', "dijitHidden");
		}else{
			dojo.addClass('davinci_style_prop_top','dijitHidden');	
		}
		
		var selectedChild = this._tabContainer.selectedChildWidget;
		var pageEditorOnlySections = dojo.query('.page_editor_only', this.domNode);
		var updatedSelectedChild = false;
		if(this._editor){
			if (this._editor.declaredClass == 'davinci.ve.PageEditor') {
				pageEditorOnlySections.forEach(function(section){
					var contentPane = dijit.byNode(section);
					if(contentPane && contentPane.controlButton && contentPane.controlButton.domNode){
						contentPane.controlButton.domNode.style.display = '';
					}
				});
			}else{
				pageEditorOnlySections.forEach(function(section){
					var contentPane = dijit.byNode(section);
					if(contentPane && contentPane.controlButton && contentPane.controlButton.domNode){
						contentPane.controlButton.domNode.style.display = 'none';
					}
					if(contentPane == selectedChild){
						updatedSelectedChild = true;
					}
				});
			}
		}
		if(updatedSelectedChild){
			var children = this._tabContainer.getChildren();
			for(var i=0; i<children.length; i++){
				var cp = children[i];
				if(cp.controlButton.domNode.style.display != 'none'){
					this._tabContainer.selectChild(cp);
					break;
				}
			}
		}
		
		/* add the editors ID to the top of the properties pallete so you can target CSS rules based on editor */
		if(this._oldClassName)
			dojo.removeClass(this.domNode,this._oldClassName);

//FIXME: TEMPORARY
if(!this._editor){
	return;
}
		if( this._editor){
			this._oldClassName = this._editor.editorID.replace(/\./g, "_");
			dojo.addClass(this.domNode,this._oldClassName);
		}
		// Hide or show the various section buttons on the root pane
/*FIXME: DELETE THIS
		var currentPropSection = HTMLStringUtil.getCurrentPropSection();
*/
var currentPropSection = this._currentPropSection;
		var sectionButtons=dojo.query(".propSectionButton",this.domNode);
		for(var i=0;i<sectionButtons.length;i++){
			var sectionButton = sectionButtons[i];
			if(this._editor && this._editor.supports && this._editor.supports('propsect_'+this.pageTemplate[i].key)){
				dojo.removeClass(sectionButton, 'dijitHidden');
			}else{
				dojo.addClass(sectionButton, 'dijitHidden');
				if(currentPropSection == this.pageTemplate[i].key){
					// If a hidden section is currently showing, then
					// jump to Property palette's root view.
					HTMLStringUtil.showRoot();
				}
			}
		}
		var visibleCascade = [];
		for(var i = 0;i<this.pageTemplate.length;i++){
			var cascade = this.pageTemplate[i]['cascade'];
			if(cascade){
				visibleCascade = visibleCascade.concat( cascade );
			}else{
				console.log("no cascade found");
			}
		}
		for(var i =0;i<visibleCascade.length;i++){
			var cascade = visibleCascade[i];
			if(cascade._editorSelected){
				cascade._editorSelected({'editor':this._editor});
			}
		}
	 },	
	 
	_destroyContent: function(){
		var containerNode = (this.containerNode || this.domNode);
		dojo.forEach(dojo.query("[widgetId]", containerNode).map(dijit.byNode), function(w){
			w.destroy();
		});
		while(containerNode.firstChild){
			dojo._destroyElement(containerNode.firstChild);
		}
		dojo.forEach(this._tooltips, function(t){
			t.destroy();
		});
		this._tooltips = undefined;
	},
	
	sectionTitleFromKey: function(key){
		for(var i=0;i<this.pageTemplate.length;i++){
			if(this.pageTemplate[i].key == key){
				return this.pageTemplate[i].title;
			}
		}
	}

});
});