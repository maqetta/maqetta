dojo.provide("davinci.html.HTMLModel");
dojo.require("davinci.model.Model");
dojo.require("davinci.js.JSModel");
dojo.require("davinci.html.CSSModel");
dojo.require("davinci.html.HTMLParser");


if (!davinci.html)
	davinci.html={};    
       
davinci.html._noFormatElements=
({
	'span':true,
	'b':true,
	'it':true
});


davinci.html.escapeXml = function(value){
	if(!value){
		return value;
	}
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
davinci.html.unEscapeXml = function(value){
	if(!value || typeof value !== "string"){
		return value;
	}
	return value.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
};

/**  
 * @class davinci.html.HTMLItem
   * @constructor 
   * @extends davinci.model.Model
 */
davinci.html.HTMLItem= function()
{
    
	this.inherits( davinci.model.Model);  
	this.elementType="HTMLItem"; 
}

 davinci.Inherits(davinci.html.HTMLItem,davinci.model.Model);

 davinci.html.HTMLItem.prototype.getLabel = function(){
	 context= {};
	 context.indent=0;
	 return this.getText(context);
}

davinci.html.HTMLItem.prototype.onChange = function(arg){
	 // called when the model changes
	//debugger;
	if (this.parent)
		if (arg)
			this.parent.onChange(arg);


}
 
davinci.html.HTMLItem.prototype._addWS = function(lines,indent)
{
	lines=lines || 0;
	indent=indent || 0;
	 var res=[];
	 for (var i=0;i<lines;i++)
		 res.push("\n");
	 res.push("                                          ".substring(0,indent));
	 return res.join("");
}

 davinci.html.HTMLItem.prototype.close = function(){
	 for(var i = 0;i<this.children.length;i++)
		 this.children[i].close();
	 
	 
 }
 
 davinci.html.HTMLItem.prototype.getID = function(){
		return this.parent.getID()+":"+this.startOffset+":"+this.getLabel();
	}
 davinci.html.HTMLItem.prototype.getHTMLFile = function(){
	    var element=this;
	    while (element && element.elementType != "HTMLFile") {
	    	element=element.parent;
	    }
	    return element;
	}


 
 /**
  * @class davinci.html.HTMLFile
    * @constructor
    * @extends davinci.html.HTMLItem
  */
 davinci.html.HTMLFile= function(fileName)
 {
	this.fileName = fileName;
 	this.inherits( davinci.html.HTMLItem);
 	this.elementType="HTMLFile";
    this._loadedCSS={};
 }
 davinci.Inherits(davinci.html.HTMLFile,davinci.html.HTMLItem);

 davinci.html.HTMLFile.prototype.save = function (isWorkingCopy) {
	 var file = davinci.resource.findResource(this.fileName);
	 if(file){
		var text = this.getText();
		file.setContents(text,isWorkingCopy);
	 }
 }
 
// WHOEVER Added this should rename so it doesnt conflict with the real getText 
// davinci.html.HTMLFile.prototype.getText = function(context){
//	 var file = davinci.resource.findResource(this.url);
//	 if(file){
//		var text = this.getText();
//		file.setContents(text);
//	 }
//}
davinci.html.HTMLFile.prototype.getText = function(context){
	 context=context || {};
	 context.indent=0;
	 var s="";
	 for (var i=0;i<this.children.length; i++)
     {
		 var child=this.children[i];
		 s=s+child.getText(context);
		 if (child.elementType=="HTMLComment")
			 s=s+this._addWS(child._fmLine,child._fmIndent);
     }
	return s;
};

davinci.html.HTMLFile.prototype.getDocumentElement = function(context){
	 for (var i=0;i<this.children.length; i++)
		 if (this.children[i].tag=="html")
			 return this.children[i];
			 
};

davinci.html.HTMLFile.prototype.findElement = function(id){
	var documentElement=this.getDocumentElement();
	if (documentElement)
		return documentElement.findElement(id);
}

davinci.html.HTMLFile.prototype.getMatchingRules = function(domElement, returnMatchLevels){
	
	
	
	
	var visitor = {
			visit:function(node){
					if(node.elementType=="CSSFile"){
						var m = [];
						var newRules = node.getMatchingRules(domElement,[],m);
						
						for(var i=0;i<newRules.length;i++){
							for(var j=0;j<this.matchLevels.length;j++){
								if(m[i]> this.matchLevels[j]){
									this.matchLevels.splice(j,0,m[i]); 
									this.rules.splice(j,0,newRules[i]); 
									break;
								}
							}
						}
						
						if(this.rules.length==0){
							this.rules = newRules;
							this.matchLevels = m;
						}
						
						return true;
					}
					return false;
			},	
			matchLevels:[],
			rules :[]
	}
	this.visit(visitor);
	if(returnMatchLevels)
		return {'rules':visitor.rules,'matchLevels':visitor.matchLevels};
	else
		return visitor.rules;
		
}

davinci.html.HTMLFile.prototype.getRule = function(selector){
	if (!selector)
		return [];
	var selectors = davinci.html.CSSSelector.parseSelectors(selector);
	var visitor = {
			visit:function(node){
					if(node.elementType=="CSSFile"){
						var newRules = node.getRule(selectors);
						this.rules = this.rules.concat(newRules || []);
						return true;
					}
					return false;
			},
			rules :[]
	}
	this.visit(visitor);
	return visitor.rules;
}

davinci.html.HTMLFile.prototype.setText = function (text, noImport) {
	
	  var oldChildren=this.children;
	  
	  this.children=[];
	  var result=davinci.html.HTMLParser.parse(text || "",this);
	  if (!noImport && result.errors.length==0)
	  {
		  // the input html may have extraneous whitespace which is thrown away by our formatting
		  // reparse the html on the source as formatted by us, so positions are correct 
		  var formattedHTML=this.getText();
		  this.children=[];
		  result=davinci.html.HTMLParser.parse(formattedHTML,this);
	  }
	  
//	  this.reportPositions();
	  this.endOffset=result.offset;
	  this.errors=result.errors;
	   var htmlmodel = this;
	   if (!noImport)
	   {
		   this.visit({visit:function(node){
					if(node.elementType=="CSSImport"){
						if(!node.cssFile){
							node.load(true);
							dojo.connect(node.cssFile, 'onChange', null, dojo.hitch(htmlmodel, 'onChange')); 
						}
					}
					
		   		}});
	   }
	this.onChange();
	   
}   

davinci.html.HTMLFile.prototype.hasStyleSheet = function (url) {
	
	return (url in this._loadedCSS)
	
};

davinci.html.HTMLFile.prototype.addStyleSheet = function(url, content, dontLoad) {
    // create CSS File model
	
	if(!dontLoad){
	    this._loadedCSS[url] = davinci.model.Factory.getInstance().getModel({
	        url : url,
	        includeImports : true
	    });
	}
    if (content) {
        this._loadedCSS[url].setText(content);
    }
    
    this.onChange();
    
    // add CSS link to HTML
// XXX This isn't yet supported.  Instead, add an "@import" inside of a "<style>" element in
//     the head.
//    var link = new davinci.html.HTMLElement('link');
//    link.addAttribute('rel', 'stylesheet');
//    link.addAttribute('type', 'text/css');
//    link.addAttribute('href', url);
//    this.getDocumentElement().getChildElement('head').addChild(link);
    if (!this._styleElem) {
        var head = this.getDocumentElement().getChildElement('head');
        var style = head.getChildElement('style');
        if (!style) {
            style = new davinci.html.HTMLElement('style');
            head.addChild(style);
        }
        this._styleElem = style;
    }
    var css = new davinci.html.CSSImport();
    css.url = url;
    this._styleElem.addChild(css);
    if(!dontLoad){ 
    	css.load(true);
    }
    	
};


davinci.html.HTMLFile.prototype.close = function () {
	   this.visit({visit:function(node){
				if(node.elementType=="CSSImport"){
					node.close();
				}
				
   	   }});
	
}

davinci.html.HTMLFile.prototype.getLabel = function(){
	 return "<>" ;
}
	

davinci.html.HTMLFile.prototype.getID = function(){
	return this.fileName;
}

davinci.html.HTMLFile.prototype.updatePositions = function(startOffset,delta){
	davinci.model.Model.updatePositions(this,startOffset,delta);
	visitor = 
	{
			visit: function(element)
			{
				if (element.endOffset<startOffset)
					return true;
				if (element.elementType=="HTMLElement" && element.startTagOffset>startOffset)
					element.startTagOffset+=delta;
			}
	};
	
	this.visit(visitor);
}
davinci.html.HTMLFile.prototype.reportPositions = function(){
	visitor = 
	{
			visit: function(element)
			{
				if (element.elementType=="HTMLElement")
				{
					console.log("<"+element.tag+"> "+element.startOffset+" -> "+element.startTagOffset+" -> "+element.endOffset)
				}
				else if (element.elementType=="HTMLAttribute")
				{
					console.log("   "+element.name+"= "+element.value+":: -> "+element.startOffset+" -> "+element.endOffset)
					
				}
			}
	};
	
	this.visit(visitor);
}


	 /**
	  * @class davinci.html.HTMLElement
	    * @constructor
	    * @extends davinci.html.HTMLItem
	  */
	 davinci.html.HTMLElement= function(tag)
	 {

	 	this.inherits( davinci.html.HTMLItem);
	 	this.elementType="HTMLElement";
	 	this.attributes=[];
	 	this.tag=tag || "";
	 	this._fmChildLine=0;
	 	this._fmChildIndent=0;
	 }
	 davinci.Inherits(davinci.html.HTMLElement,davinci.html.HTMLItem);


	 davinci.html.HTMLElement.prototype.add = function(stmt){
		if (!this.statements)
             this.statements=[];
		this.statements.push(stmt);
		this.onChange();
       }

	 
	 davinci.html.HTMLElement.prototype.getText = function(context){
		 

		 
		 var s="";
		 var doFormat;
//		 if (!this.wasParsed  && !davinci.html._noFormatElements[this.tag])
//		 {
//			  doFormat=true;
//			 s=s+"\n"+"                                          ".substring(0,  context.indent+1);
//		 }
		 context.indent+=2;
		 s=s+"<"+this.tag ;
		 for (var i=0;i<this.attributes.length; i++)
		 {
			 var attrtext=this.attributes[i].getText(context);
			 // noPersist attributes return empty string
			 if(attrtext.length>0)
				 s=s+" "+attrtext;
		 }
		 if (this.noEndTag)
			 s=s+"/>";
		 else
		 {
		 s=s+'>';
		  s=s+this._addWS(this._fmChildLine,this._fmChildIndent);
		 if (this.statements)
		 {

			 for (var i=0;i<this.statements.length; i++)
				 s=s+this.statements[i].printStatement(context,this.statements[i]);
		 }
		 else if (this.script)
			 s=s+this.script;
		 else
		  if (this.children.length>0)
		 {
			 var isStyle=this.tag=="style";
			 
			 for (var i=0;i<this.children.length; i++)
			 {
				 s=s+this.children[i].getText(context);
				 if (isStyle)
				 {
					 var lines=this._fmChildLine,indent=this._fmChildIndent || 0;
					 if (i+1==this.children.length)
					 {
						 lines=this._fmLine;
						 indent=this._fmIndent;
						 
					 }
					 s=s+this._addWS(lines,indent);
				 }
			 }
		 }
		 if (doFormat && this.children.length>0)
			 s=s+"\n"+"                                          ".substring(0,  context.indent+1);
		 s= s+  "</"+this.tag +">";
		 } 
		 context.indent-=2;
		  s=s+this._addWS(this._fmLine,this._fmIndent);
		 
		return s;
		};


		 davinci.html.HTMLElement.prototype._formatModel = function( newElement, index, context){
			 
			 var offset=0;
			 var lfSize=1;		// should check if 2
			 if (index==undefined)
				 index=this.children.length;
			 
			 function addIndent(indent,elemChild,elem)
			 {
				 offset+= (lfSize+indent);
				 if (elemChild)
				 {
					 elemChild._fmChildLine=1;
					 elemChild._fmChildIndent=context.indent;
				 }
				 else
				 {
					 elem._fmLine=1;
					 elem._fmIndent=context.indent;
				 }

			 }
			 
			 
			 function formatElem(elem, context)
			 {
				 elem.startOffset=offset;
				 elem.wasParsed=true;
				 offset+=elem.tag.length+2;
				 for (var i=0;i<elem.attributes.length; i++)
				 {
					 elem.attributes[i].startOffset=offset;
					 var attrtext=elem.attributes[i].getText(context);
					 if (attrtext.length>0)
						 offset+=1+attrtext.length;
					 elem.attributes[i].endOffset=offset-1;
				 }
				 if (elem.noEndTag)
					 offset++;
				 elem.startTagOffset=offset;
				 var s="";
				 if (elem.statements)
				 {

					 for (var i=0;i<elem.statements.length; i++)
						 s=s+elem.statements[i].printStatement(context,elem.statements[i]);
				 }
				 else if (elem.script)
					 s=elem.script;
				 if (s)
					 offset+=s.length;
				 else
				  if (elem.children.length>0)
				 {
					  var doFormat;
					  if (!davinci.html._noFormatElements[elem.tag])
					  {
						  context.indent+=2;
						  addIndent(context.indent,elem);
						  doFormat=true;
					  }
					  var lastChild;
					 for (var i=0;i<elem.children.length; i++)
					 {
						 var child=elem.children[i];
						 switch (child.elementType)
						 {
						 case "HTMLElement":
							 if (lastChild && lastChild.elementType1!="HTMLText" && !davinci.html._noFormatElements[child.tag])
								 addIndent(context.indent,null, lastChild);
							 formatElem(child,context);
							 
							 break;
						 case "HTMLText":
							 child.startOffset=offset;
							  offset+=child.value.length;
							 break;
						 case "HTMLComment":
							 child.startOffset=offset;
							  offset+=child.value.length;
							  offset++;
 							  if (child.isProcessingInstruction)
 								  offset+=2;

							 break;
						 default:
							 debugger;
								 
						 }
						 lastChild=child;
				     }
					 if (doFormat)
					   context.indent-=2;
					 if (lastChild && lastChild.elementType!="HTMLText")
						 addIndent(context.indent,null, lastChild);
				 }
				 
				 offset+=elem.tag.length+3;
				 elem.endOffset=offset-1;
			 }
			 
			 var elem1, elem2;
			 if (!this.children.length || index==0)
			 {
				 elem1=this;
				 offset=this.startTagOffset+1;
			 }
			 else
			 {
					 var elem2=this.children[index-1];
					 offset=elem2.endOffset+1;
			 }
			 var startOffset=offset;
			 if (!davinci.html._noFormatElements[newElement.tag])
			 {
				 addIndent(context.indent,elem1, elem2);

				 newElement._fmLine=1;
				 newElement._fmIndent= (index<this.children.length) ?context.indent : context.indent-2;
			 }
			 
			 formatElem(newElement,context);
//			 if (!davinci.html._noFormatElements[newElement.tag])
//				 offset+=lfSize;
			 return (offset>startOffset) ? offset-startOffset : 0;
			};


		
		 davinci.html.HTMLElement.prototype.getElementText = function(context){
			 context=context || {};
			 var s="" ;
			  if (this.children.length>0)
			 {
				 for (var i=0;i<this.children.length; i++)
					 if (this.children[i].elementType!="HTMLComment")
						 s=s+this.children[i].getText(context);
			 }
			  else if (this.script)
				  return this.script;
			  else if (this.statements)
			  {
				  for (var i=0;i<this.statements.length; i++)
					 	 s=s+this.statements[i].printStatement(context,this.statements[i]);
			  }
			return s;
		};

		 davinci.html.HTMLElement.prototype.getChildElements = function(tagName, recurse, result){
			 result = result || [];
			 for (var i=0;i<this.children.length;i++){
				 if (this.children[i].tag==tagName)
					 result.push(this.children[i]);
			     if (recurse && this.children[i].elementType=="HTMLElement")
			    	 this.children[i].getChildElements(tagName,recurse,result);
			 }
			 return result;
		}

		 davinci.html.HTMLElement.prototype.getChildElement = function(tagName){
			 for (var i=0;i<this.children.length;i++)
				 if (this.children[i].tag==tagName)
					 return this.children[i];
		}


			
		 davinci.html.HTMLElement.prototype.getAttribute = function(name){
			 var attr=this._getAttribute(name);
			 if (attr)
			   return attr.value;
			 
		}
		
		 davinci.html.HTMLElement.prototype._getAttribute = function(name){
			 for (var i=0;i<this.attributes.length;i++)
				 if (this.attributes[i].name==name)
					 return this.attributes[i];
			 
		}
		
			
		 davinci.html.HTMLElement.prototype.addText = function(text){
			 this.addChild(new davinci.html.HTMLText(text));
			 this.onChange();
		}
		 davinci.html.HTMLElement.prototype.addComment = function(text){
			 this.addChild(new davinci.html.HTMLComment(text));
			 this.onChange();
		}
		 
		 davinci.html.HTMLElement.prototype.getLabel = function(){
			 return "<"+this.tag+">" ;
		}
		
			
		 davinci.html.HTMLElement.prototype.addAttribute = function(name, value, noPersist){
			 if (name=='textContent')
			 {
				 this.children=[];
				 this.addText(value);
				 return;
			}
			 var delta;
			 var startOffset=(this.attributes.length>0) 
			 	? this.attributes[this.attributes.length-1].endOffset +1
			 	: this.startTagOffset -(this.noEndTag ? 2 : 1) ;
			 var attr=this._getAttribute(name);
			 var add;
			 if (!attr)
			 {
				 attr=new davinci.html.HTMLAttribute();
				 add=true;
				 delta=name.length+value.length+4;
				 attr.startOffset=startOffset;
				 attr.endOffset=startOffset+delta-1;
			 }
			 else
				 delta=value.length-attr.value.length;
			 attr.name=name;
			 attr.setValue(value);
			 attr.noPersist=noPersist;
			 if (  this.wasParsed && !noPersist && delta>0)
			 {
				 this.getHTMLFile().updatePositions(startOffset,delta);
//				 console.log("addAttribute=" +name);
//				   this.getHTMLFile().reportPositions();

			 }
			 if (add)		// delay adding til after other positions updated
				 this.attributes.push(attr);
			 this.onChange();
		}
		
		 davinci.html.HTMLElement.prototype.removeAttribute = function(name){
			 for (var i=0;i<this.attributes.length;i++)
				 if (this.attributes[i].name==name)
				 {
					 var attr=this.attributes[i];
					 var s=attr.getText({});
					 this.attributes.splice(i, 1);
					 if (!attr.noPersist)
						 this.getHTMLFile().updatePositions(attr.startOffset,0-(s.length+1));
					 return;
				 }
			 this.onChange();
		}
		 davinci.html.HTMLElement.prototype.setAttribute = function(name,value){
			 this.removeAttribute(name);
			 this.addAttribute(name,value);
		}
		 davinci.html.HTMLElement.prototype.getUniqueID = function(noPersist){
			 var attr=this.getAttribute("id");
			 if (!attr)
			 {
				 var file=this.getHTMLFile();
				 if (!file.uniqueIDs)
					 file.uniqueIDs={};
				 var id;
				 if (!file.uniqueIDs.hasOwnProperty(this.tag))
				 {
					 id = file.uniqueIDs[this.tag]=0;
				 }
				 else
					 id=++file.uniqueIDs[this.tag];
				this.addAttribute("id",this.tag+"_"+id,noPersist);	 
			 }
		}
		 
		 davinci.html.HTMLElement.prototype.findElement = function(id){
			 var attr=this.getAttribute("id");
			 if (id==attr )
				 return this;
			 for (var i=0;i<this.children.length; i++)
				 if (this.children[i].elementType=="HTMLElement")
				 {
					 var found=this.children[i].findElement(id);
					 if (found)
						 return found;
				 }
		}
		 davinci.html.HTMLElement.prototype.insertBefore = function(newChild,beforeChild){
				var index= dojo.indexOf(this.children, beforeChild);
				if (index<0)
					index=undefined;
				this.addChild(newChild,index);
				this.onChange();
		}
		 davinci.html.HTMLElement.prototype.addChild = function(newChild,index, fromParser){
			 if ( !fromParser && this.wasParsed)
			 {
				 if (newChild.elementType=='HTMLElement')
				 {
					 // calculate indent
					 var myIndent=this._getIndent();
					 var childIndent;
					 if (index<this.children.length && this.children[index].elementType=="HTMLElement")		// if inserting before element, use same indent as that element
					 {
						 childIndent=this.children[index]._getIndent();
					 }
					 else
					{
						 if (this.children.length)
						   dojo.forEach(this.children, function(element){
							   if (element.elementType=="HTMLElement")
								   childIndent=element._getIndent();
						   });
						 else
							 childIndent=myIndent+1;
						 
					}
					 var indent=childIndent;
					 var context={indent:indent};
					 var delta=this._formatModel(newChild,index,  context);
					 
					 this.getHTMLFile().updatePositions(newChild.startOffset,delta);
					 
					 //add text with newLine
					 // update positions in new element
					 
				 }
				 else if (newChild.elementType=="HTMLText" || newChild.elementType.substring(0,3)=="CSS")
				 {
					 var s=newChild.getText();
					 var offset=this.children.length ? this.children[this.children.length-1].endOffset : this.startTagOffset;
					 var len=s.length;
					 if (len>0)
					 {
						 if (newChild.elementType!="HTMLText")
							len+= this._fmChildIndent+1;	// if css, add indent+lf
						 this.getHTMLFile().updatePositions(offset+1,len);
					 }
					 newChild.startOffset=offset+1;
					 newChild.endOffset=newChild.startOffset+s.length-1;
				 }
				 // update positions in old elements
//				 console.log("addChild -"+newChild.tag);
//				   this.getHTMLFile().reportPositions();

			 }
			 davinci.html.HTMLItem.prototype.addChild.apply(this,arguments);
		}

		 davinci.html.HTMLElement.prototype.removeChild = function(child){
				var index= dojo.indexOf(this.children, child);
     		   var lfSize=1;
               if (index>=0)
               {
            	   var delta=1+child.endOffset-child.startOffset;

            	   if (child.elementType=="HTMLElement")
            	   {
          			   if (this.children.length==1)
          			   {
                		   delta+=this._fmChildLine*lfSize + this._fmChildIndent;
          				   this._fmChildIndent -= 2;
          			   }
          			   else
          			   {
          				   if (index>0 && this.children[index-1].elementType=="HTMLElement")
          				   {
          					   var prevChild=this.children[index-1];
          					   delta+=prevChild._fmLine*lfSize + prevChild._fmIndent;
          				   }
          					   
              			   if (index+1==this.children.length && this.children[index-1].elementType=="HTMLElement")
              				   this.children[index-1]._fmChildIndent -=2;
          				   
          			   }
            	   }

            	   
            	   if (delta > 0 && this.wasParsed) {
            		   this.getHTMLFile().updatePositions(child.startOffset,0-delta);
            	   }
               }
               
			 davinci.html.HTMLItem.prototype.removeChild.apply(this,arguments);
		 }

		 davinci.html.HTMLElement.prototype._textModify = function(newText,oldText){
			 var delta=newText.length-oldText.length;
				 if (delta!=0 && this.wasParsed) {
					 this.getHTMLFile().updatePositions( this.startOffset, delta);
                }
			 }		 

		 davinci.html.HTMLElement.prototype.setScript = function(script){
			 this._textModify(script, this.script);
			 this.script=script;
					 
		 }		 
		 
		 davinci.html.HTMLElement.prototype._previous = function(){
			 var inx=dojo.indexOf(this.parent.children,this);
			 if  (inx>0) 
				 return this.parent.children[inx-1];
		 }

		 
		 davinci.html.HTMLElement.prototype._getIndent = function(){
			 var prev=this._previous();
			 if (prev)
			 {
				 if ( prev.elementType=="HTMLText")
				 {
					 var txt=prev.value.split('\n');
					 return  txt[txt.length-1].length;
				 }
				 else
					 return prev._fmIndent;
			 }
			 else
				 return this.parent._fmChildIndent;
		 }
		 
		 
		 davinci.html.HTMLElement.prototype.visit = function (visitor) {
			  if (!visitor.visit(this))
			  {
				  for (var i=0;i<this.attributes.length;i++)
						 this.attributes[i].visit(visitor);
				  
					  for (var i=0;i<this.children.length;i++)
						 this.children[i].visit(visitor);
			  }
			  
			  if(visitor.endVisit) visitor.endVisit(this);	
			 
			 
		 }
		 
		 davinci.html.HTMLElement.prototype.setText = function (text) {
				
			   var options={xmode:'outer'};
			   var currentParent=this.parent;
			   var result=davinci.html.HTMLParser.parse(text,this);
			   
			   this.errors=result.errors;
			   // first child is actually the parsed element, so replace this with child
			   dojo.mixin(this, this.children[0]);
			   this.parent=currentParent;
				var visitor = {
						visit:function(node){
							delete node.wasParsed;
						},
						rules :[]
				}
				this.visit(visitor);
			   this.onChange();
		}   
 /**
  * @class davinci.html.HTMLAttribute
    * @constructor
    * @extends davinci.html.HTMLItem
  */
 davinci.html.HTMLAttribute= function()
 {

 	this.inherits( davinci.html.HTMLItem);
 	this.elementType="HTMLAttribute";
 	this.name="";
 	this.value="";
 }
 davinci.Inherits(davinci.html.HTMLAttribute,davinci.html.HTMLItem);
 
 davinci.html.HTMLAttribute.prototype.getText = function(context){
	 if (this.noPersist && !context.includeNoPersist)
		 return "";
	 var s=this.name;
	 if (!this.noValue)
		 s=s+'="'+davinci.html.escapeXml(String(this.value))+'"';
	return s;
	};


 davinci.html.HTMLAttribute.prototype.setValue = function(value){
	 this.value=davinci.html.unEscapeXml(value);
	 this.onChange();
};


	/**
	  * @class davinci.html.HTMLText
	    * @constructor
	    * @extends davinci.html.HTMLItem
	  */
	 davinci.html.HTMLText= function(value)
	 {

	 	this.inherits( davinci.html.HTMLItem);
	 	this.elementType="HTMLText";
	 	this.value=value ||"";
	 	
	 }
	 davinci.Inherits(davinci.html.HTMLText,davinci.html.HTMLItem);
	 
	 davinci.html.HTMLText.prototype.getText = function(context){
		return this.value;
	};

	 davinci.html.HTMLText.prototype.setText = function(value){
		 	if (this.wasParsed || (this.parent && this.parent.wasParsed))
		 	{
		 		var delta= value.length-this.value.length;
		 		if (delta>0)
					 this.getHTMLFile().updatePositions(this.startOffset+1,delta);

		 	}
			this.value = value;
			
		};
	davinci.html.HTMLText.prototype.getLabel = function(){
		if (this.value.length<15)
		 return this.value;
		return this.value.substring(0, 15)+"..."
	}

	 /**
	  * @class davinci.html.HTMLComment
	    * @constructor
	    * @extends davinci.html.HTMLItem
	  */
	 davinci.html.HTMLComment= function(value)
	 {

	 	this.inherits( davinci.html.HTMLItem);
	 	this.elementType="HTMLComment";
	 	this.value=value || "";
	 }
	 davinci.Inherits(davinci.html.HTMLComment,davinci.html.HTMLItem);
	 
	 davinci.html.HTMLComment.prototype.getText = function(context){
		 var dash= this.isProcessingInstruction ? "":"--";
		return '<!'+dash+this.value+dash+'>';
	};

	  