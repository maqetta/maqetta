dojo.provide("davinci.html.CSSModel");
dojo.require("davinci.model.Model");
dojo.require("davinci.html.CSSParser");
dojo.require("davinci.model.Path");
dojo.require("davinci.resource");
dojo.require("davinci.model.Factory");


var pushComment=null;

if (!davinci.html)
	davinci.html={};    

if(!davinci.html.css)
	davinci.html.css = {};

dojo.declare("davinci.html.dd", null, {xx:1});


/* shorthand properties */
if(!davinci.html.css.shorthand){
	/* priority ordering of shorthand properties.  0 at start of attribute ... n at bottom */
	
	davinci.html.css.shorthand = [['border', 'background', 'padding', 'margin','border-radius', '-moz-border-radius'],
	                              ['border-top', 'border-right', 'border-left', 'border-bottom','background-top', 'background-right', 'background-left', 'background-bottom'],
	                              ['border-color', 'border-width', 'border-height', 'border-style', 'background-color', 'background-width', 'background-height', 'background-style','border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius','-moz-border-radius-topleft','-moz-border-radius-topright','-moz-border-radius-bottomright','-moz-border-radius-bottomleft']];
}


var c=new davinci.html.dd();

/**  
 * @class davinci.html.CSSElement
   * @constructor 
   * @extends davinci.model.Model
 */
davinci.html.CSSElement= function(){
	this.inherits( davinci.model.Model);  
	if(typeof pushComment !='undefined' && pushComment!=null){	
		this.comment = pushComment;
		pushComment = null;
		
	}
	this.elementType="CSSElement";
}

davinci.Inherits(davinci.html.CSSElement,davinci.model.Model);
 
 davinci.html.CSSElement.prototype.getLabel = function(){
	 context= { indent: 0, noComments: true};
	 return this.getText(context);
}
davinci.html.CSSElement.prototype.onChange = function(arg){
	if (this.parent)
		if (arg)
			this.parent.onChange(arg);
		else 
			this.parent.onChange(this);
	 
}
 davinci.html.CSSElement.prototype.close = function(includeImports){
	 
	for(var i = 0;i<this.children;i++)
		this.children[i].close();
	 
 }
 
 davinci.html.CSSElement.prototype.getCSSFile = function(){
	 var rule=this.getCSSRule();
	 if (rule)
		 return rule.parent;
}

davinci.html.CSSElement.prototype.getCSSRule = function(){}

davinci.html.CSSElement.prototype._convertNode = function(domNode){
	 if (dojo.isArray(domNode))
		 return domNode;
	 var nodes=[];
   
 	 while (domNode && domNode.tagName!='HTML')
 	 {
 		 nodes.push({tagName:domNode.tagName, id: domNode.id, classes:(domNode.className && domNode.className.split(" "))});
 		 domNode=domNode.parentNode;
 	 }
	 return nodes;
 }
 

 
 davinci.html.CSSElement.prototype.getID = function(){
		return this.parent.getID()+":"+this.startOffset+":"+this.getLabel();
	}

 

 
 /**  
  * @class davinci.html.CSSFile
    * @constructor 
    * @extends davinci.html.CSSElement
  */
 davinci.html.CSSFile= function(args){
	
 	this.inherits(davinci.html.CSSElement);  
 	this.elementType="CSSFile";
 	dojo.mixin(this, args);
 	if(!this.options)
 		this.options =  {xmode:'style', css:true, expandShorthand:false};
 	var txt = null;
 	
 	if (this.url && this.loader){
 		txt=this.loader(this.url);
 	}else if(this.url){
 		 var file = this.getResource();
 		 if(file)
 			 txt = file.getContents();
 	}
 	if (txt)
		  this.setText(txt);
 	
 }
 davinci.Inherits(davinci.html.CSSFile,davinci.html.CSSElement);

 davinci.html.CSSFile.prototype.save = function (isWorkingCopy) {
	
	 var file = this.getResource();
	 if(file){
		var text = this.getText();
		file.setContents(text,isWorkingCopy);
	 }
 }
 
 davinci.html.CSSFile.prototype.close = function () {
	  this.visit({visit:function(node){
			if(node.elementType=="CSSImport"){
				node.close();
			}
			
	 }});
	 davinci.model.Factory.getInstance().closeModel(this);
 }
 
davinci.html.CSSFile.prototype.getResource = function (isWorkingCopy) {
	
	return davinci.resource.findResource(this.url);
}

davinci.html.CSSFile.prototype.addRule = function (ruleText) {
	
	var rule = new davinci.html.CSSRule();
	rule.setText(ruleText);
	this.addChild(rule);
	this.setDirty(true);
	return rule;
}

davinci.html.CSSFile.prototype.setText = function (text) {
	  var oldChildren=this.children;
	   this.children=[];
//	   /*
//	   if(this._initialSet)
//		   this.setDirty(true);
//	   else
//		   this._initialSet = true;
//	   */
//	   try{
//		   this.errors=davinci.js.JSElement.parse(text,this,this.options);
//	   }catch(e){
//		   this.errors = [];
//		   this.errors.push(e);
//		   
//	   }
	  var result=davinci.html.CSSParser.parse(text,this);
	  this.errors=result.errors;
	  
	   if (this.errors.length>0 && this.errors[this.errors.length-1].isException)
		   this.children=oldChildren;
	   if (this.includeImports) 
	   {
			 for (var i=0;i<this.children.length; i++)
				 if (this.children[i].elementType=='CSSImport')
					 this.children[i].load();
	   }
	   this.onChange();
};   
       
davinci.html.CSSFile.prototype.getText = function(context){
		 context=context || {};
		 context.indent=0;
		 var s="";
		 for (var i=0;i<this.children.length; i++)
			 s=s+this.children[i].getText(context);
		return s;
};
	
davinci.html.CSSFile.prototype.getCSSFile = function(){
	 return this;
}

davinci.html.CSSFile.prototype.getID = function(){
	return this.fileName;
}
	
davinci.html.CSSFile.prototype.getMatchingRules = function(domElement,rules,matchLevels){
		
		domElement=this._convertNode(domElement);
		rules = rules || [];
		matchLevels = matchLevels || [];
		 for (var i=0;i<this.children.length; i++)
		 {
			 var child=this.children[i];
			 if (child.elementType=='CSSRule')
			 {
				 var level=child.matches(domElement);
				 if (level) {
					 
					 for(var j=0;j<matchLevels.length;j++){
						if(level>=matchLevels[j]){
							rules.splice(j,0,child); 
							matchLevels.splice(j,0,level);
							break;
						}
						 
					 }
					 if(rules.length==0){
						 rules.push(child);
						 matchLevels.push(level);
					 }
				 }
			 }
			 else if (child.elementType=='CSSImport' && child.cssFile)
			 {
				 child.cssFile.getMatchingRules(domElement,rules,matchLevels);
			 }
		 }
		 return rules;
}

davinci.html.CSSFile.prototype.getRule = function(selector){
		 var matchingRule;
			if (!selector)
				return [];
		 var selectors=  davinci.html.CSSSelector.parseSelectors(selector);
		 for (var i=0;i<this.children.length; i++)
		 {
			 var child=this.children[i];
			 if (child.elementType=='CSSRule')
			 {
				 if (child.matchesSelectors(selectors))
				 { 
					   matchingRule=child;
					   break;
				 }
			 }
			 else if (child.elementType=='CSSImport' && child.cssFile)
			 {
				matchingRule = child.cssFile.getRule(selectors) || matchingRule;
				 
			 }
		 }
		 return matchingRule;
}

davinci.html.CSSFile.prototype.getRules = function(selector){
		 //var matchingRule;
		var selectors=  davinci.html.CSSSelector.parseSelectors(selector);
		 var matchingRules = new Array();
		 for (var i=0;i<this.children.length; i++)
		 {
			 var child=this.children[i];
			 if (child.elementType=='CSSRule')
			 {
				 if (child.matchesSelectors(selectors))
				 { 
					   matchingRules.push(child);
				 }
			 }
			 else if (child.elementType=='CSSImport' && child.cssFile)
			 {
				matchingRules = matchingRules.concat(child.cssFile.getRules(selectors));
				 
			 }
		 }
		 return matchingRules;
}

davinci.html.CSSFile.prototype.getStyleValue = function(propertyNames, domElement){
		var rules=[];
		var matchLevels=[];
		domElement=this._convertNode(domElement);

		this.getMatchingRules(domElement,rules,matchLevels);
		 

		 function getMatchingProperty(propertyName)
		 {
			 var level=0;
			 var property, prop;
			 for (var i=0;i<rules.length; i++)
			 {
				 if ((prop=rules[i].getProperty(propertyName) ))
				 {
					 if (matchLevels[i]>level)
					 {
						 property=prop;
						 level=matchLevels[i];
					 }
				 }
			 }
			 return property;
		 }
		 
		 if (dojo.isString(propertyNames))
			 return getMatchingProperty(propertyNames);
		 var result=[];
		 for (var i=0;i<propertyNames.length; i++)
		 {
			 result.push(getMatchingProperty(propertyNames[i]));
		 }
		 return result;
		 
}
	
/**  
 * @class davinci.html.CSSFile
   * @constructor 
   * @extends davinci.html.CSSElement
 */
davinci.html.CSSFragment= function(args){
	
	this.inherits(davinci.html.CSSElement);  
	this.elementType="CSSFile";
	dojo.mixin(this, args);
	if(!this.options)
		this.options =  {xmode:'style', css:true, expandShorthand:false};
	var txt = null;
	
	if (this.url && this.loader){
		txt=this.loader(this.url);
	}else if(this.url){
		 var file = this.getResource();
		 if(file)
			 txt = file.getContents();
	}
	if (txt)
		  this.setText(txt);
	
}
davinci.Inherits(davinci.html.CSSFragment, davinci.html.CSSFile);	
	
 /**  
  * @class davinci.html.CSSRule
    * @constructor 
    * @extends davinci.html.CSSElement
  */
 davinci.html.CSSRule= function(){
 	this.inherits(davinci.html.CSSElement);  
 	this.elementType="CSSRule";
 	this.selectors=[];
 	this.properties=[];
}

davinci.Inherits(davinci.html.CSSRule,davinci.html.CSSElement);
 
davinci.html.CSSRule.prototype.getText = function(context){
		 var s="";
		 context = context || [];
		 if(this.comment && !context.noComments){
			s+= "\n  " + this.comment.getText(context);
		 }
		 s+= this.getSelectorText(context);
		 s=s+" {";
		 for (var i=0;i<this.properties.length; i++)
			 s=s+"\n    "+this.properties[i].getText(context);
		 s=s+"\n}\n";
		return s;
};

davinci.html.CSSRule.prototype.setText = function (text) {
	  
	var options={xmode:'style',  css:true};

	  var result=davinci.html.CSSParser.parse(text,this);

	   
	   // first child is actually the parsed element, so replace this with child
	   dojo.mixin(this, this.children[0]);
	   var parentOffset= (this.parent)?this.parent.endOffset : 0;
	   this.startOffset = parentOffset+ 1;
	   this.setDirty(true);
	  // this.onChange();
	  
};

davinci.html.CSSRule.prototype.addProperty = function(name,value){
			 
			 var property;
			 property=this.getProperty(name);
			 if (property)
				 property.value=value;
			 else{
				 property=new davinci.html.CSSProperty(name,value,this);
				 this.properties.push(property);
			 }
			  this.setDirty(true);
			 this.onChange();
			 
};

davinci.html.CSSRule.prototype.insertProperty = function(name,value,atIndex){
	 /* insert a property at given index */
	
	 var property;
	 property=this.getProperty(name);
	 if (property)
		 this.removeProperty(name);
	 
	property=new davinci.html.CSSProperty(name,value,this);
	this.properties.splice(atIndex,0,property);
	  this.setDirty(true);
	 this.onChange();
};


 davinci.html.CSSRule.prototype.getSelectorText = function(context){
			 var s= "";
			 for (var i=0;i<this.selectors.length; i++)
			{
				 if (i>0)
					 s=s+", ";
				 s=s + this.selectors[i].getText(context);
			}
			return s;
};

			

davinci.html.CSSRule.prototype.matches = function(domNode){
			 domNode=this._convertNode(domNode);
			 var specific;
			 for (var i=0;i<this.selectors.length; i++)
			 {
				 if ((specific=this.selectors[i].matches(domNode))>=0)
					 return specific;
			 }
};

davinci.html.CSSRule.prototype.visit = function(visitor){
			  if (!visitor.visit(this)){
				  for (var i=0;i<this.children.length;i++)
					  this.children[i].visit(visitor);
				  for (var i=0;i<this.selectors.length;i++)
					  this.selectors[i].visit(visitor);
			  }
			  if(visitor.endVisit) visitor.endVisit(this); 		  
}

davinci.html.CSSRule.prototype.hasSelector = function(selectorText){
	  for (var i=0;i<this.selectors.length;i++)
		  if(this.selectors[i].getLabel()==selectorText)
			  return true;
	  
	 return false;
}

davinci.html.CSSRule.prototype.matchesSelectors = function(selectors){
	for (var j=0;j<selectors.length;j++)
	  for (var i=0;i<this.selectors.length;i++)
		  if(this.selectors[i].matchesSelector(selectors[j]))
			  return true;
	  
	 return false;
}
davinci.html.CSSRule.prototype.getCSSRule = function(){
		 return this;
}

davinci.html.CSSRule.prototype.getLabel = function(){
		 return this.getSelectorText({});
}
			 
davinci.html.CSSRule.prototype.getProperty = function(propertyName){
				 for (var i=0;i<this.properties.length; i++)
				 {
					 if (propertyName==this.properties[i].name)
						 return this.properties[i];
				 }
};
			
 davinci.html.CSSRule.prototype.setProperty = function(name, value){
				 var property=this.getProperty(name);
				 if(!value){
					 this.removeProperty(name);
			 	}else if (property)
					 property.value=value;
				 else{
					 property=new davinci.html.CSSProperty();
					 property.name=name;
					 property.value=value;
					 this.properties.push(property);
					 property.parent=this;
				 }
				  this.setDirty(true);
				 this.onChange();

}
			
davinci.html.CSSRule.prototype.removeProperty = function(propertyName){
				 for (var i=0;i<this.properties.length; i++)				 {
					 if(propertyName==this.properties[i].name) {
						 this.properties.splice(i,1);
						 return;
					 }
				 }
				  this.setDirty(true);
				 this.onChange();
}
			 
davinci.html.CSSRule.prototype.removeStyleValues = function(propertyNames){
				 var newProperties = [];
				 for (var i=0;i<this.properties.length; i++)
				 {
					 var found;
					 for (var j=0;j<propertyNames.length &&!found;j++)
						 found=propertyNames[j]==this.properties[i].name;
					 if (!found)
						 newProperties=this.properties[i];
				 }
				 this.properties=newProperties;
				  this.setDirty(true);
				 this.onChange();
}
			
		

 
 /**  
  * @class davinci.html.CSSSelector
    * @constructor 
    * @extends davinci.html.CSSElement
  */
 davinci.html.CSSSelector= function()
 {
 	this.inherits(davinci.html.CSSElement);  
 	this.elementType="CSSSelector";

 }
 davinci.Inherits(davinci.html.CSSSelector,davinci.html.CSSElement);
 
 davinci.html.CSSSelector.parseSelectors = function(selector)
 {
	 if (typeof selector == "string")
	 {
		 selector = selector+"{}";
		 var cssFile=new davinci.html.CSSFile();
		 cssFile.setText(selector);
		 return cssFile.children[0].selectors;
	 }
	 else
		 return selector;  // already parsed
 }
 
 davinci.html.CSSSelector.prototype.matchesSelector = function(selector)
 {
	 if (selector.elementType==this.elementType&& this.id==selector.id && this.cls==selector.cls&&this.element==selector.element && this.pseudoRule==selector.pseudoRule)
		 return true;
 }
 
 
 davinci.html.CSSSelector.prototype.getText = function(context){
	 var s= "";
	 if (this.element)
		 s=s+this.element;
	 if (this.id)
		 s=s+"#"+this.id;
	 if (this.cls)
		 s=s+"."+this.cls;
	 if (this.pseudoRule)
		 s=s+":"+this.pseudoRule;
	 if (this.pseudoElement)
		 s=s+"::"+this.pseudoElement;
	 if (this.attribute)
     {
		 s=s+"["+this.attribute.name
		 if (this.attribute.type)
			 s=s+this.attribute.type+'"'+this.attribute.value+'"';
		 s=s+']';
     }
	 return s;
	};

 
	 davinci.html.CSSSelector.prototype.matches = function(domNode, index){
		 //FIXME: Will produce incorrect results if more than 9 class matches
		 //Should use a very higher "base", not just base 10
		 var inx=index || 0;
		 var node=domNode[inx];
		 var specific=0;
		 var anymatches=false;
		 if (this.id)
		 {
			if (this.id!=node.id)
				return -1;
			specific+=100;
			anymatches=true;
		 }
		 if (this.element)
		 {
			if (this.element=='*'){
				anymatches=true;
			}
			else
			{
				if (this.element!=node.tagName)
	            {
					if (this.element.toUpperCase()!=node.tagName)
						return -1;
	            }  				
				specific+=1;
				anymatches=true;
			}
		 }
		 if (this.cls && node.classes)
		 {
			  var classes= node.classes;
			  if (this.cls.indexOf('.')>=0)
			 {
				  var matchClasses=this.cls.split('.');
				  for (var j=0; j<matchClasses.length;j++)
				  {
					  var found=false;
					  for (var i=0;i<classes.length;i++)
						  if (found=(classes[i]==matchClasses[j]))
							  break;
					  if (!found)
						  return -1;
					  
				  }
				  specific+=(matchClasses.length*10);
				  anymatches=true;
			 }
			  else
			{
				  var found=false;
				  for (var i=0;i<classes.length;i++)
					  if (found=(classes[i]==this.cls))
						  break;
				  if (!found)
					  return -1;	  
				  specific+=10;
				  anymatches=true;
			}
				  
 		 }
		 if(!anymatches){
			 return -1;
		 }else{
		 	return specific;
		 }
		 
	 }
	
	 davinci.html.CSSSelector.prototype.getCSSRule = function(){
		 if (this.parent.elementType=='CSSRule')
			 return this.parent;
		 return this.parent.parent;
	}

	
 /**  
  * @class davinci.html.CSSCombinedSelector
    * @constructor 
    * @extends davinci.html.CSSElement
  */
 davinci.html.CSSCombinedSelector= function()
 {
 	this.inherits(davinci.html.CSSElement);  
 	this.selectors=[];
 	this.combiners=[];
 	this.elementType="CSSCombinedSelector";

 }
  davinci.Inherits(davinci.html.CSSCombinedSelector,davinci.html.CSSElement);

  davinci.html.CSSCombinedSelector.prototype.matchesSelector = function(selector)
  {
 	 if (selector.elementType==this.elementType)
 	 {
 		 if (selector.selectors.length==this.selectors.length)
 		 {
 			 for (var i=0;i<this.selectors.length;i++)
 			 {
 				 if (this.combiners[i]!=selector.combiners[i])
						 return false;
				 if (!this.selectors[i].matchesSelector(selector.selectors[i]))
					 return false;
 			 }
 			 return true;
 		 } 
 	 }
  }

  davinci.html.CSSCombinedSelector.prototype.getText = function(context){
		 var s= "";
		 for (var i=0;i<this.selectors.length-1;i++)
		 {
			 s=s+this.selectors[i].getText(context);
			 if(this.combiners[i]!=" ") 
				 s+=' '+this.combiners[i]+' ';
			 else
				 s+= this.combiners[i];
		 }
		 s=s+this.selectors[this.selectors.length-1].getText(context);
		return s;
		};

	davinci.html.CSSCombinedSelector.prototype.matches = function(domNode){

		var  selectorInx=this.selectors.length-1;
		 var totalSpecific=0;
		for (var i=0;i<domNode.length; i++)
		{
			    var specific;
			   
				if ((specific=this.selectors[selectorInx].matches(domNode,i))>=0)
				{
					totalSpecific+=specific;
					selectorInx--;
					if (selectorInx<0)
						return totalSpecific;
				}
				if (i==0 && specific<0)
					return -1;
		}

	}
	davinci.html.CSSCombinedSelector.prototype.visit = function(visitor){
		  if (!visitor.visit(this)){
			  for (var i=0;i<this.children.length;i++)
				  this.children[i].visit(visitor);
			  for (var i=0;i<this.selectors.length;i++)
				  this.selectors[i].visit(visitor);
		  }
		  if(visitor.endVisit) visitor.endVisit(this); 		  
	 }
	 davinci.html.CSSCombinedSelector.prototype.getCSSRule = function(){
			 return this.parent;
	}

	
  /**  
   * @class davinci.html.CSSProperty
     * @constructor 
     * @extends davinci.html.CSSElement
      * 
     * possible fields
     * url : a url value
     * numberValue : the numeric part of a value
     * units : the units of a numeric value
     * 
     */
  davinci.html.CSSProperty= function(name,value,parent)
  {
  	this.inherits(davinci.html.CSSElement);  
  	this.elementType="CSSProperty";
  	this.name=name || "";
  	this.value=value || "";
  	this.parent=parent;
  	this.expanded = [];
  	this.lengthValues = [];
  }
  
  davinci.Inherits(davinci.html.CSSProperty,davinci.html.CSSElement);
  davinci.html.CSSProperty.prototype.getValue = function(){
	  
	  return this.value;
	  
  }
 davinci.html.CSSProperty.prototype.getText = function(context){
	  var s="";
		 if(this.comment && !context.noComments){
				s+= "\n  " + this.comment.getText(context);
			 }
		 s+=this.name+" : "+this.value;
		 if (this.isNotImportant)
			 s+=' !important'
		 s+=";";
		 if(this.postComment && !context.noComments){
				s+= this.postComment.getText(context);
			 }
		 return s;
};

davinci.html.CSSProperty.prototype.getCSSRule = function(){
			 return this.parent;
}
davinci.html.CSSProperty.prototype.addProperty = function(name,value){
				 var property=new davinci.html.CSSProperty(name,value,this);
				 this.properties.push(property);
			 
};

davinci.html.CSSProperty.prototype.getURL = function(){
			 if (this.url)
			 {
				  var path = new davinci.model.Path(this.getCSSFile().url);
				  path=path.getParentPath().append(this.url);
				  return path.toString();
			 }
}
	/**  
		   * @class davinci.html.CSSImport
		     * @constructor 
		     * @extends davinci.html.CSSElement
		   */
davinci.html.CSSImport= function(){
			
		  	this.inherits(davinci.html.CSSElement);  
		  	this.elementType="CSSImport";
};
davinci.Inherits(davinci.html.CSSImport,davinci.html.CSSElement);

davinci.html.CSSImport.prototype.getCSSFile = function(){
					 return this.parent;
}
davinci.html.CSSImport.prototype.visit = function(visitor){
			  if (!visitor.visit(this)){
				  for (var i=0;i<this.children.length;i++)
					  this.children[i].visit(visitor);
				  if(this.cssFile) 
					  this.cssFile.visit(visitor);
			  }
			  if(visitor.endVisit) visitor.endVisit(this); 		  
}
davinci.html.CSSImport.prototype.getText = function(context){
			  s="@import ";
			  if (this.isURL)
				  s+='url("'+this.url+'");';
			  else
				  s+='"'+this.url+'";';
			   
			  return s;
};
davinci.html.CSSImport.prototype.close = function(includeImports){
	davinci.model.Factory.getInstance().closeModel(this.cssFile);
	if (this.connection) dojo.disconnect(this.connection);
	delete this.connection;
}

davinci.html.CSSImport.prototype.load = function(includeImports){
				  var p = this.parent;
				  while(p && ! (p.url || p.fileName) ){
					  p = p.parent;
				  }
				
				  var path = new davinci.model.Path(p.url || p.fileName);
				  path=path.getParentPath().append(this.url);
				  var myUrl=path.toString();
				  this.cssFile=davinci.model.Factory.getInstance().getModel({
					  url: myUrl,
					  loader: this.parent.loader,
					  includeImports: this.parent.includeImports || includeImports
				  });
				 this.cssFile.relativeURL=this.url;
				 this.connection = dojo.connect(this.cssFile, 'onChange', this.parent, 'onChange');
};
 
/**  
 * @class davinci.html.CSSAtRule
   * @constructor 
   * @extends davinci.html.CSSElement
 */
davinci.html.CSSAtRule= function(){
	
	this.inherits(davinci.html.CSSElement);  
	this.elementType="CSSAtRule";
};
davinci.Inherits(davinci.html.CSSAtRule,davinci.html.CSSElement);

davinci.html.CSSAtRule.prototype.getCSSFile = function(){
			 return this.parent;
}
davinci.html.CSSAtRule.prototype.getText = function(context){
	  s="@";
	  s=s+this.name+" "+this.value+";";
	  return s;
};
