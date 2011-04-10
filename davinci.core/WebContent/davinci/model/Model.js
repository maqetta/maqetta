dojo.provide("davinci.model.Model");

if (!davinci)
	davinci={};

davinci.Inherits = function(clazz, parent ){
	clazz.prototype = new parent();
	clazz.prototype.constructor = clazz;
}

/**
 * @class davinci.model.Model
   * @constructor     
 */
davinci.model.Model= function(){
	this.elementType="";
	this.name = "";
	this.startOffset = 0;
	this.endOffset = 0;
	this.parent= null;
	this.children = [];
}
davinci.model.Model.prototype.inherits = function( parent ){
 	if( arguments.length > 1 ){
 		parent.apply( this, Array.prototype.slice.call( arguments, 1 ) );
 	}
 	else{
 		parent.call( this );
 	}
}
davinci.model.Model.prototype.getText= function(){
	
}

davinci.model.Model.prototype.setText= function(text){}
davinci.model.Model.prototype.addChild= function(child,index, fromParser){
	child.parent=this;	
	if (index!=undefined)
	{
		this.children.splice(index, 0,child);
	}
	else
		this.children.push(child);
}
davinci.model.Model.prototype.setStart = function (offset){
	this.startOffset=offset;
}
davinci.model.Model.prototype.setEnd = function (offset){
	this.endOffset=offset;
}
davinci.model.Model.prototype.getLabel = function (){
	return null;
}
davinci.model.Model.prototype.getID = function (){
	return null;
}
davinci.model.Model.prototype.findChildAtPosition = function (position){
	if (!position.endOffset)
		position.endOffset=position.startOffset;
	
	if (position.startOffset>=this.startOffset  && position.endOffset<=this.endOffset){
		
//		if (position.startLine==this.startLine && this.startCol>position.startCol)
//			return null;
//		if (position.endLine==this.endLine && position.startCol>this.endCol)
//			return null;
		for (var i=0;i<this.children.length;i++){
				var child=this.children[i].findChildAtPosition(position);
				if (child!=null)
					return child;
		}
		return this;
	}
	return null;
}

davinci.model.Model.prototype.removeChild = function(child){
	 for (var i=0;i<this.children.length;i++)
		 if (this.children[i]==child)
		 {
			 this.children.splice(i, 1);
			 return;
		 }
}

davinci.model.Model.prototype.find = function (attributeMap, stopOnFirst) {
	
	/* search for nodes with given attributes, example:
	 * 
	 * {'elementType':'CSSFile', 'url': ./app.css'} 
	 * 
	 * matches all elemenType = "CSSFile" with url = ./app1.css
	 */
	
	var visitor = {
			visit:function(node){
					if(this.found.length>0 && stopOnFirst)
						return true;
					var name = null;
					for(name in attributeMap){
						if(node[name] != attributeMap[name])
							break;
					}
					if(node[name] == attributeMap[name])
						this.found.push(node);
					return false;
			},	
			found :[]
	};
	
	this.visit(visitor);
	
	if(stopOnFirst && visitor.found.length>0)
		return visitor.found[0];
	
	return visitor.found;
	
	
}

davinci.model.Model.prototype.setDirty = function(isDirty){
	this.dirtyResource = isDirty;
}

davinci.model.Model.prototype.isDirty = function(){
	return this.dirtyResource;
}


davinci.model.Model.prototype.searchUp = function(elementType){
	if(this.elementType==elementType) return this;
	var parent = this.parent;
	while(parent && parent.elementType!=elementType)
		parent = parent.parent;
	
	return parent;
	
}
davinci.model.Model.prototype.visit = function(visitor){
  if (!visitor.visit(this))
	  for (var i=0;i<this.children.length;i++)
		 this.children[i].visit(visitor);
  if(visitor.endVisit) visitor.endVisit(this);	
}

davinci.model.Model.updatePositions = function (model,offset,delta)
{
	
	visitor = 
	{
			visit: function(element)
			{
				if (element.endOffset<offset)
					return true;
				if (element.startOffset>=offset)
				{
					element.startOffset+=delta;
					element.endOffset+=delta;
				}
				else 
				if (element.endOffset>=offset)
				{
					element.endOffset+=delta;
				}
			}
	};
	
	model.visit(visitor);
}

/**
 * @class davinci.model.Comment
   * @extends davinci.model.Model
   * @constructor
 */
davinci.model.Comment= function()
{
	this.inherits( davinci.model.Model);  
	this.elementType="Comment";
	this.nosemicolon=true;
}

davinci.Inherits(davinci.model.Comment,davinci.model.Model);
davinci.model.Comment.prototype.addComment = function(type, start,stop,text){
	
	if(this.comments==null){
		this.comments = [];
		
	}
	
	this.comments[this.comments.length] = {commentType:type,
			                                start:start,
			                                stop:stop,
			                                s:text};
	
	
}
davinci.model.Comment.prototype.appendComment = function(text){
	
	var comment=this.comments[this.comments.length-1];
	comment.s+=text;
	comment.stop+=text.length;
}


davinci.model.Comment.prototype.getText = function (context) 
{
	var s="";
	

	for(var i = 0;i<this.comments.length;i++){
		if(this.comments[i].commentType=="line"){
			s+="//" + this.comments[i].s + "\n";
		}else if(this.comments[i].commentType=="block"){
			s+="/*" + this.comments[i].s + "*/\n";
		}	
	}
	return s;
} 


