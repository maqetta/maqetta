dojo.provide("davinci.ve.widgets.Background");

dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.widget.ColorPicker");
dojo.require("davinci.ve.utils.URLRewrite");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.utils.CssShortHand");

dojo.declare("davinci.ve.widgets.Background", [davinci.workbench.WidgetLite], {
	
	pageTemplate : [{display:"color", type:"color", target:'background-color'},
	                {display:"image/gradient", type:"combo", values:['image', 'gradient']},
	               
	                {display:"background-image url", type:"file", target:'background-image'},
		       	    {display:"repeat", type:"combo", values:['', 'repeat', 'repeat-x','repeat-y','no-repeat'],  target:'background-repeat' },
		       	    {display:"background-position", type:"multi", target:'background-position', values:['','0px','left top','center center','right bottom']},
		       	    {display:"background-size", type:"multi", target:'size', target:'background-size', values:['','auto','contain','cover','100%']},
		       	    {display:"background-origin", type:"combo", target:'background-origin', values:['','padding-box','border-box','content-box']},
		       	    {display:"background-clip", type:"combo", target:'background-clip', values:['','padding-box','border-box','content-box']},
		       	    
		       	    {display:"dpi", type:"combo", target:'background-dpi', values:['']},  
			        
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
				box.attr('value',value);
			}else{
				box = this.pageTemplate[index]['domNode'];
				dojo.attr(box,'value',value);	
			}
			this.pageTemplate[index]['value']=value;
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
			
			
			this._target = "image";
			
			for(var i = 0;i<this.pageTemplate.length;i++){
				var  id = this.pageTemplate[i]['id'];
				var widget = dijit.byId(id);
					
				if(widget){
					this.pageTemplate[i]['widget'] = widget;	
				}else{
					widget = dojo.byId(id);
					if(widget)
						this.pageTemplate[i]['domNode'] = widget;
					else{
					
						widget = dojo.byId(this.pageTemplate[i]['rowId']);
						if(widget)
							this.pageTemplate[i]['domNode'] = widget;
						
					}
				}
			}
			this.setReadOnly(true);
			this.inherited(arguments);
			this._imageSection(true);
			this._gradientSection(false);
			dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
		},
		
		_onChange : function(event){
			var index = event.target;
			
			if(index==1){
					/* image/gradient switch */
				this._target = this.getFieldValue(index);
				this._imageSection(this._target=="image");
				this._gradientSection(this._target=='gradient');
				return;
			}

		},
		
		_getUrl : function(){
			return "url('" + this.getFieldValue(2) + "')";
			
		},
		_getBackgroundPosition : function(){
			var ypos = this.getFieldValue(5);
			
			if(ypos)
				return "" + this.getFieldValue(4) + " " + ypos;
			return this.getFieldValue(4);
		},
		_setPosition : function(value){
			
			var xval = null;
			var yval = null;
			if(value!=null){
				var split = value.split(' ');
				if(split.length==0){
					xval = null;
					yval = null;
				}else if(split.length==2){
					xval = split[0];
					yval = split[1];
					
				}else if(split.length==1){
					xval = split[0];
					yval = null;
				}
			}
			/* x */
			
			this.setFieldValue(4, xval);
			this.setFieldValue(5, yval);
		},
		
		_setUrl : function(url){
			
			var  rewrite = davinci.ve.utils.URLRewrite.getUrl(url);
			this.setFieldValue(2,rewrite);
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
		_imageSection : function(shouldShow){
			
			for(var i = 2;i<=7;i++ ){
				var box = this.pageTemplate[i]['domNode'] || this.pageTemplate[i]['widget'].domNode;
				box = box.parentNode.parentNode;
				if(shouldShow)
					dojo.removeClass(box,'dijitHidden');
				else
					dojo.addClass(box,'dijitHidden');
			}
			
			
		},
		
		_gradientSection : function(shouldShow){
		
			for(var i = 8;i<=18;i++ ){
				var box = this.pageTemplate[i]['domNode'] || this.pageTemplate[i]['widget'].domNode;
				/* handle the two html elements differently */
				
				if(i!=11 && i!=15)
					box = box.parentNode.parentNode;
				
				
				if(shouldShow)
					dojo.removeClass(box,'dijitHidden');
				else
					dojo.addClass(box,'dijitHidden');
			}
			
			
		}
});