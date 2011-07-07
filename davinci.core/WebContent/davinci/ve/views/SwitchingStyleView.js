dojo.provide("davinci.ve.views.SwitchingStyleView");
dojo.require("davinci.workbench.Preferences");
dojo.require("davinci.workbench.ViewLite");
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("davinci.ve.widgets.CommonProperties");
dojo.require("davinci.ve.widgets.EventSelection");
dojo.require("davinci.ve.widgets.WidgetProperties");
dojo.require("davinci.ve.widgets.WidgetToolBar");
dojo.require("davinci.ve.widgets.Background");
dojo.require('davinci.ve.widgets.Border');
dojo.require("davinci.ve.widgets.Cascade");

dojo.declare("davinci.ve.views.SwitchingStyleView", davinci.workbench.ViewLite, {

	/* FIXME: These won't expand into pageTemplate. Not sure if that's a JS issue or dojo.declare issue.
	 * Temporary copied into each property below but would be better if could get reusable values working somehow.
	_paddingMenu:['', '0px', '1em'],
	_radiusMenu:['', '0px', '6px'],
	 */

	pageTemplate : [
	         
	          {title:"Common", 
	        	  pageTemplate:{html: "<div dojoType='davinci.ve.widgets.CommonProperties'></div>"}},
	          {title:"Widget-specific",
	        	  html: "<div dojoType='davinci.ve.widgets.WidgetProperties'></div>"},  
	          {title:"Events", 
		          pageTemplate:{html: "<div dojoType='davinci.ve.widgets.EventSelection'></div>"}},
	          {title:"Layout",
		       	  /* startsNewGroup:true, // This flag causes a few extra pixels between this and previous button */
	           	  pageTemplate:[{display:"width", type:"multi", target:"width", values:['', 'auto','100%','200px','10em']},
	            	                
    	                {display:"height", type:"multi", target:"height", values:['','auto','100%','200px','10em']},
    	                {html:"&nbsp;"},
    	                {display:"&nbsp;&nbsp;&nbsp;show min/max", type:"toggleSection",
    	                	pageTemplate:[{display:"min-height", type:"multi", target:"min-height", rowClass:"propertiesSectionHidden"},
                                {display:"max-height", type:"multi", target:"max-height", rowClass:"propertiesSectionHidden"},
                                {display:"min-width", type:"multi", target:"min-width", rowClass:"propertiesSectionHidden"},
            	                {display:"max-width", type:"multi", target:"max-width", rowClass:"propertiesSectionHidden"},
            	                {html:"&nbsp;", rowClass:"propertiesSectionHidden"}]},
    	                {display:"position", type:"combo", target:"position", values:['', 'absolute','fixed','relative','static']},
    	                {display:"left", type:"multi", target:"left", values:['', '0px', '1em']},
    	                {display:"top", type:"multi", target:"top", values:['', '0px', '1em']},
    	                {display:"display", type:"combo", target:"display", values:['','none','block','inline','inline-block']},
    	                {display:"opacity", type:"multi", target:"opacity", values:['0','0.5','1.0']},
    	                {display:"box-shadow", type:"text", target:"box-shadow", value:['','none','1px 1px rgba(0,0,0,.5)']},
    	                {display:"float", type:"combo", target:"float", values:['','none','left','right']},
    	                {display:"clear", type:"combo", target:"clear", values:['','none','left','right','both']},
    	                {display:"overflow", type:"combo", target:"overflow", values:['','visible','hidden','scroll','auto']},
    	                {display:"z-index", type:"multi", target:"z-index", values:['','auto','0','1','100','-1','-100']},
    	                {display:"box-sizing", type:"combo", target:['box-sizing','-webkit-box-sizing','-ms-box-sizing','-moz-box-sizing'], values:['','content-box','border-box']}
	            	                
	            	                
	            	                ]},
	           {title:"Padding/Margins", 
	           	  pageTemplate:[
    	                {display:"<b>(padding)</b>", type:"multi", target:"padding", values:['', '0px', '1em']},
		                 {display:"&nbsp;&nbsp;&nbsp;show t/r/b/l", type:"toggleSection",
    	                	pageTemplate:[
    		 			       {display:"padding-top", type:"multi", target:"padding-top", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"padding-right", type:"multi", target:"padding-right", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"padding-bottom", type:"multi", target:"padding-bottom", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"padding-left", type:"multi", target:"padding-left", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"}
    	                	]},
    	                {display:"<b>(margin)</b>", type:"multi", target:"margin", values:['', '0px', '1em']},
		                 {display:"&nbsp;&nbsp;&nbsp;show t/r/b/l", type:"toggleSection",
    	                	pageTemplate:[
    		 			       {display:"margin-top", type:"multi", target:"margin-top", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-right", type:"multi", target:"margin-right", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-bottom", type:"multi", target:"margin-bottom", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"},
    		 			       {display:"margin-left", type:"multi", target:"margin-left", values:['', '0px', '1em'], rowClass:"propertiesSectionHidden"}
    	                	]}
    	                ]},
	           {title:"Background", 
	       		  pageTemplate : [{display:"background-color", type:"color", target:'background-color'},
/* FIXME: Gradients not working yet. Comment out switch for now 
    	                {display:"image/gradient", type:"combo", values:['image', 'gradient']},
*/  
    	                {display:"background-image url", type:"file", target:'background-image'},
    		       	    {display:"background-repeat", type:"combo", values:['', 'repeat', 'repeat-x','repeat-y','no-repeat'],  target:'background-repeat' },
    		       	    {display:"background-position", type:"multi", target:'background-position', values:['','0px','left top','center center','right bottom']},
    		       	    {display:"background-size", type:"multi", target:'size', target:'background-size', values:['','auto','contain','cover','100%']},
    		       	    {display:"background-origin", type:"combo", target:'background-origin', values:['','padding-box','border-box','content-box']},
    		       	    {display:"background-clip", type:"combo", target:'background-clip', values:['','padding-box','border-box','content-box']}
/* FIXME: Gradients not working yet. Comment out for now 
,    		       	    {display:"dpi", type:"combo", target:'background-dpi', values:['']},  
    			        
    		       	    {display:"type", type:"combo", target:"none", values:['']},
    			 	    {display:"origin", type:"combo",target:"none",values:[''] },
    			 	    {html:"stop 1"},
    			 	    {display:"color",target:"none", type:'color'},
    			 	    {display:"pos", type:'combo', target:"none", values:['']},
    			 	    {display:"size", target:"none", type:"multi"},
    			 	    {html:"stop 2"},
    			 	    {display:"color", target:"none", type:'color'},
    			 	    {display:"pos", target:"none", type:'combo', values:['']},
    			 	    {display:"size", target:"none", type:"multi"}
*/                			 	    
    		       	   ]},
	           {title:"Border", 
		       		pageTemplate : [
   		                {display:"<b>(border)</b>", type:"multi", target:'border', values:['','none','1px solid black']}, 
   		                {display:"show", type:"combo", values:['none','sides','props','all'],
		       				onchange:function(propIndex){
   		                		if(typeof propIndex != "number"){
   		                			return;
   		                		}
		       					var showRange=function(sectionData,first,last,begin,end){
		       						for(var k=first;k<last;k++){
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
   		                {display:"border-top", type:"multi", target:'border-top', values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right", type:"multi", target:'border-right', values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom", type:"multi", target:'border-bottom', values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left", type:"multi", target:'border-left', values:['','none','1px solid black'],rowClass:'propertiesSectionHidden'},
   		                
   		              
   		                {display:"border-width", type:"multi", target:'border-width', values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-style", type:"multi", target:'border-style', values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-color", type:"color", target:'border-color',rowClass:'propertiesSectionHidden'},
   		            	       	    
   		                {display:"border-top-width", type:"multi", target:'border-top-width', values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-top-style", type:"multi", target:'border-top-style', values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-top-color", type:"color", target:'border-top-color',rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-width", type:"multi", target:'border-right-width', values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-style", type:"multi", target:'border-right-style',values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-right-color", type:"color", target:'border-right-color',rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-width", type:"multi", target:'border-bottom-width', values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-style", type:"multi", target:'border-bottom-style', values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-bottom-color", type:"color", target:'border-bottom-color',rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-width", type:"multi", target:'border-left-width', values:['', '1px', '1em'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-style", type:"multi", target:'border-left-style', values:['', 'none', 'solid', 'dotted', 'dashed'],rowClass:'propertiesSectionHidden'},
   		                {display:"border-left-color", type:"color", target:'border-left-color',rowClass:'propertiesSectionHidden'},
      		         {display:"border-collapse", type:"combo", target:'border-collapse',  values:['', 'separate', 'collapse']},
   		             {display:"<b>(border-radius)</b>", type:"multi", target:['border-radius','-moz-border-radius'],  values:['', '0px', '6px']},
	                 {display:"show details", type:"toggleSection",
 	                	pageTemplate:[
		                     {display:"border-top-left-radius", type:"multi", target:["border-top-left-radius",'-moz-border-radius-topleft'], values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-top-right-radius", type:"multi", target:['border-top-right-radius','-moz-border-radius-topright'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-bottom-right-radius", type:"multi", target:['border-bottom-right-radius','-moz-border-radius-bottomright'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"},
		                     {display:"border-bottom-left-radius", type:"multi", target:['border-bottom-left-radius','-moz-border-radius-bottomleft'] , values:['', '0px', '6px'], rowClass:"propertiesSectionHidden"}
	    	                ]}
		            	  ]},
	           {title:"Fonts and Text",
	                  pageTemplate:[{display:"font", type:"text", target:"font"},
                        {display:"font-family", type:"font", target:"font-family"},
    	                {display:"size", type:"multi", target:"font-size", values:['','100%','1em','10px','10pt']},
    	                {display:"color", type:"color", target:"color"},
    	                {display:"font-weight", type:"combo", target:"font-weight", values:['','normal', 'bold']},
    	                {display:"font-style", type:"combo", target:"font-style", values:['','normal', 'italic']},
    	                {display:"text-decoration", type:"combo", target:"text-decoration", values:['','none', 'underline', 'line-through']},
    	                {display:"text-align", type:"combo", target:"text-align", values:['','left', 'center','right', 'justify']},
    	                {display:"vertical-align", type:"combo", target:"vertical-align", values:['','baseline', 'top', 'middle','bottom']},
    	                {display:"white-space", type:"combo", target:'white-space', values:['','normal','nowrap','pre','pre-line','pre-wrap']},
    	                {display:"text-indent", type:"multi", target:"text-indent", values:['','0','1em','10px']},
    	                {display:"line-height", type:"multi", target:"line-height", values:['','normal','1.2','120%']}
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
		dojo.addClass(this.domNode,'propertiesSection');	
		var template="";
		template+="<div style='height:2em;' dojoType='davinci.ve.widgets.WidgetToolBar'></div>";
		template+="<div id='davinci_style_prop_top' class='propScrollableArea'>";
		template+="<table class='propRootDetailsContainer'>";
		template+="<tr>";
		template+="<td class='propPaletteRoot'>";
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
		// Use same styling as Dijit TitlePane for breadcrumb row
		template+='<div class="dijitTitlePane cssBreadcrumbContainer">';
		template+='<div class="dijitTitlePaneTitle">';
		template+='<div class="dijitTitlePaneTitleFocus" role="button">';
		template+='<span class="dijitArrowNode" wairole="presentation" role="presentation"></span>';
		template+='<span class="dijitTitlePaneTextNode cssBreadcrumbSection" style="-webkit-user-select: none; "></span>';
		template+='</div>';
		template+='</div>';
		template+='</div>';		
		for(var i=0;i<this.pageTemplate.length;i++){
			template+= davinci.ve.widgets.HTMLStringUtil.generateTemplate(this.pageTemplate[i] );
		}
		template+="</td></tr></table>";
		template+="</div>";
		this.domNode.innerHTML = template;

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
					function(title,index){
						davinci.ve.widgets.HTMLStringUtil.transitionRootToSection(title,
							// dojo.hitch necessary to provide "this" object
							dojo.hitch(this,function(){
								var visibleCascade = this._getVisibleCascade(index);
								for(var j =0;j<visibleCascade.length;j++){
									visibleCascade[j]._editorSelected({'editor':this._editor});
								}
							})
						);
					},
					this.pageTemplate[i].title,i)
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
		this.inherited(arguments);
			
	},


	
	_widgetValuesChanged : function(event){
		var currentPropSection = davinci.ve.widgets.HTMLStringUtil.getCurrentPropSection();
		if(currentPropSection){
			var found=false;
			for(var propSectionIndex = 0;propSectionIndex<this.pageTemplate.length;propSectionIndex++){
				if(this.pageTemplate[propSectionIndex].title == currentPropSection){
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
		var currentPropSection = davinci.ve.widgets.HTMLStringUtil.getCurrentPropSection();
		if(currentPropSection){
			for(var i = 0;i<this.pageTemplate.length;i++){
				if(this.pageTemplate[i].title == currentPropSection){
					visibleCascade = visibleCascade.concat( this.pageTemplate[i]['cascade']);
					break;
				}	
			}
		}
		return visibleCascade;
	},
	
	_widgetSelectionChanged : function (changeEvent){
		//debugger;
		if(	!this._editor )
			return;
		//debugger;
		var widget=changeEvent[0];
		/* What about state changes and undo/redo? wdr
		 * if(this._widget == widget && this._subwidget==widget.subwidget)
			return false;
			*/
		this._widget = widget;
		this._subwidget = widget && widget.subwidget;
	
		this.setReadOnly(!(this._widget || this._subwidget));
		var visibleCascade = this._getVisibleCascade();
		for(var i =0;i<visibleCascade.length;i++)
			visibleCascade[i]._widgetSelectionChanged(changeEvent);
		
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
	
		this.inherited(arguments);
		
		
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
			if(sectionId){
				this.pageTemplate[v].widget = dijit.byId(sectionId);
				dojo.connect(this.pageTemplate[v].widget, "_onShow", this, function(targetIndex){return function(){this._titlePaneOpen(targetIndex);};}(v) );
			}
			var nodeList = dojo.query("#" + sectionId + " .CascadeTop");
			
			nodeList.forEach(function(target){ return function(p){
				var cascade = dijit.byId(p.id);
				target['cascade'].push(cascade);
			};}(this.pageTemplate[v]));
			
		}
		this.setReadOnly(true);
		this.onEditorSelected();
		dojo.subscribe("/davinci/ui/widgetValuesChanged", dojo.hitch(this, this._widgetValuesChanged));
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
					widget.attr("readOnly", isReadOnly);
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
	
	
	onEditorSelected : function(){
		
		if (this._editor && this._editor.supports("style")) {
			dojo.removeClass('davinci_style_prop_top', "dijitHidden");
		}else{
			dojo.addClass('davinci_style_prop_top','dijitHidden');	
		}
		
		/* add the editors ID to the top of the properties pallete so you can target CSS rules based on editor */
		//debugger;
		if(this._oldClassName)
			dojo.removeClass(this.domNode,this._oldClassName);
		
		if( this._editor){
			this._oldClassName = this._editor.editorID.replace(/\./g, "_");
			dojo.addClass(this.domNode,this._oldClassName);
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
	}

});