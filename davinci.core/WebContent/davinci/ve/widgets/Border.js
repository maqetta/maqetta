dojo.provide("davinci.ve.widgets.Border");

dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.widget.ColorPicker");
dojo.require("davinci.ve.utils.URLRewrite");
dojo.require('davinci.workbench.WidgetLite');
dojo.require('davinci.ve.utils.CssShortHand');
dojo.require("davinci.ve.widgets.BorderRadius");


dojo.declare("davinci.ve.widgets.Border", [davinci.workbench.WidgetLite], {
	
	pageTemplate : [{display:"<b>(border)</b>", type:"multi", target:'border', values:['','none','1px solid black']}, 
	                {display:"show", type:"combo", values:['none','sides','props','all']},
	                
	                
	              
	                {display:"border-top", type:"multi", target:'border-top', values:['', '1px', '1em']},
	                {display:"border-right", type:"multi", target:'border-right', values:['', '1px', '1em']},
	                {display:"border-bottom", type:"multi", target:'border-bottom', values:['', '1px', '1em']},
	                {display:"border-left", type:"multi", target:'border-left', values:['', '1px', '1em']},
	                
	              
	                {display:"border-width", type:"multi", target:'border-width', values:['', '1px', '1em']},
	                {display:"border-style", type:"multi", target:'border-style', values:['', 'none', 'solid', 'dotted', 'dashed']},
	                {display:"border-color", type:"color", target:'border-color'},
	            	       	    
	                {display:"border-top-width", type:"multi", target:'border-top-width', values:['', '1px', '1em']},
	                {display:"border-top-style", type:"multi", target:'border-top-style', values:['', 'none', 'solid', 'dotted', 'dashed']},
	                {display:"border-top-color", type:"color", target:'border-top-color'},       	 
	                {display:"border-right-width", type:"multi", target:'border-right-width', values:['', '1px', '1em']},
	                {display:"border-right-style", type:"multi", target:'border-right-style',values:['', 'none', 'solid', 'dotted', 'dashed']},
	                {display:"border-right-color", type:"color", target:'border-right-color'},
	                {display:"border-bottom-width", type:"multi", target:'border-bottom-width', values:['', '1px', '1em']},
	                {display:"border-bottom-style", type:"multi", target:'border-bottom-style', values:['', 'none', 'solid', 'dotted', 'dashed']},
	                {display:"border-bottom-color", type:"color", target:'border-bottom-color'},
	                {display:"border-left-width", type:"multi", target:'border-left-width', values:['', '1px', '1em']},
	                {display:"border-left-style", type:"multi", target:'border-left-style', values:['', 'none', 'solid', 'dotted', 'dashed']},
	                {display:"border-left-color", type:"color", target:'border-left-color'},
	                {widgetHtml:"<div dojoType='davinci.ve.widgets.BorderRadius' values=\"['0px','4px','6px','8px','10px','1em']\"></div>"}
		       	  ],
		
	                
		buildRendering: function(){
			this.domNode =   dojo.doc.createElement("div");
			
			this.domNode.innerHTML =  davinci.ve.widgets.HTMLStringUtil.generateTable(this.pageTemplate);
			var propMap = {
					 'border' : ['border-width', 'border-style','border-color'],
					 'border-width'  : ['border-top-width','border-right-width','border-bottom-width','border-left-width'],
					 'border-style'  : ['border-top-style','border-right-style','border-bottom-style','border-left-style'],
					 'border-color'  : ['border-top-color','border-right-color','border-bottom-color','border-left-color'],
					 'border-bottom' : ['border-bottom-width', 'border-bottom-style','border-bottom-color'],
					 'border-top' 	 : ['border-top-width', 'border-top-style','border-top-color'],
					 'border-left'   : ['border-left-width', 'border-left-style','border-left-color'],
					 'border-right'  : ['border-right-width', 'border-right-style','border-right-color']
					};
		//	this._shorthand = new davinci.ve.utils.CssShortHand(propMap);
			
			
			this.inherited(arguments);
		},
		
		startup : function(){
		
			function makeOnChange(target){
				return function(){
					return this._onChange({target:target});
				};
			}
			var box = dojo.byId(this.pageTemplate[1]['id']);
			this.pageTemplate[1]['domNode'] = box;
			
			dojo.connect(box, "onchange", this, makeOnChange(1));
		
		
			for(var i = 0;i<this.pageTemplate.length;i++){
				var  id = this.pageTemplate[i]['id'];
				var widget = dijit.byId(id);
					
				if(widget){
					this.pageTemplate[i]['widget'] = widget;	
				}else{
					widget = dojo.byId(id);
					if(widget)
						this.pageTemplate[i]['domNode'] = widget;
				}
			}
			
			
			
			this.inherited(arguments);
			this.setReadOnly(true);
			this._target = "none";
			this._toggleSection(2,20, false);
			dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
			
		},
		
		_widgetSelectionChanged : function (changeEvent){
			var widget=changeEvent[0];
			/* What about state changes and undo/redo? wdr
			 * if(this._widget == widget && this._subwidget==widget.subwidget)
				return false;
				*/
			this._widget = widget;
			this._subwidget = widget && widget.subwidget;
		
			this.setReadOnly(!(this._widget || this._subwidget));
		},
		setReadOnly : function(isReadOnly){
				for(var i = 0;i<this.pageTemplate.length;i++){
					var widget = this.pageTemplate[i]['widget'];
					if(widget)
						widget.attr("readOnly", isReadOnly);
					else{
						var node = this.pageTemplate[i].domNode;
						if(node)
							dojo.attr(node, "disabled", isReadOnly);
					}
				}
		},
		
		getFieldValue : function(index){
			
			var box = this.pageTemplate[index]['widget'];
			var value = null;
			if(box){
				value = box.attr('value');
			}else{
				box = this.pageTemplate[index]['domNode'];
				value = dojo.attr(box,'value');	
			}
			return value;
		},
		
		setFieldValue : function(index,value){
			
			if(this.pageTemplate[index]['value']==value)
				return;
			
			var box = this.pageTemplate[index]['widget'];
			
			if(box){
				box.attr('value',value,true);
			}else{
				box = this.pageTemplate[index]['domNode'];
				dojo.attr(box,'value',value);	
			}
			this.pageTemplate[index]['value']=value;
		},
		
		
		
		_onChange : function(event){
			var index = event.target;
			this._target =  this.getFieldValue(index);
			this._toggleSection(2,20, this._target =='all');
			this._toggleSection(2,5,this._target =='sides');
			this._toggleSection(6,8,this._target =='props');
		},
		
		_toggleSection : function(start, stop, shouldShow){
		
			for(var i = start;i<=stop;i++ ){
				var box = dojo.byId(this.pageTemplate[i]['id']);
				box = box.parentNode.parentNode;
				if(shouldShow)
					dojo.removeClass(box,'dijitHidden');
				else
					dojo.addClass(box,'dijitHidden');
			}
		}
		
});