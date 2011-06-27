/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/html",["./main","./parser"],function(_1){
_1.getObject("html",true,_1);
var _2=0,d=_1;
_1.html._secureForInnerHtml=function(_3){
return _3.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig,"");
};
_1.html._emptyNode=_1.empty;
_1.html._setNodeContent=function(_4,_5){
d.empty(_4);
if(_5){
if(typeof _5=="string"){
_5=d._toDom(_5,_4.ownerDocument);
}
if(!_5.nodeType&&d.isArrayLike(_5)){
for(var _6=_5.length,i=0;i<_5.length;i=_6==_5.length?i+1:0){
d.place(_5[i],_4,"last");
}
}else{
d.place(_5,_4,"last");
}
}
return _4;
};
_1.declare("dojo.html._ContentSetter",null,{node:"",content:"",id:"",cleanContent:false,extractContent:false,parseContent:false,parserScope:_1._scopeName,startup:true,constructor:function(_7,_8){
_1.mixin(this,_7||{});
_8=this.node=_1.byId(this.node||_8);
if(!this.id){
this.id=["Setter",(_8)?_8.id||_8.tagName:"",_2++].join("_");
}
},set:function(_9,_a){
if(undefined!==_9){
this.content=_9;
}
if(_a){
this._mixin(_a);
}
this.onBegin();
this.setContent();
this.onEnd();
return this.node;
},setContent:function(){
var _b=this.node;
if(!_b){
throw new Error(this.declaredClass+": setContent given no node");
}
try{
_b=_1.html._setNodeContent(_b,this.content);
}
catch(e){
var _c=this.onContentError(e);
try{
_b.innerHTML=_c;
}
catch(e){
console.error("Fatal "+this.declaredClass+".setContent could not change content due to "+e.message,e);
}
}
this.node=_b;
},empty:function(){
if(this.parseResults&&this.parseResults.length){
_1.forEach(this.parseResults,function(w){
if(w.destroy){
w.destroy();
}
});
delete this.parseResults;
}
_1.html._emptyNode(this.node);
},onBegin:function(){
var _d=this.content;
if(_1.isString(_d)){
if(this.cleanContent){
_d=_1.html._secureForInnerHtml(_d);
}
if(this.extractContent){
var _e=_d.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_e){
_d=_e[1];
}
}
}
this.empty();
this.content=_d;
return this.node;
},onEnd:function(){
if(this.parseContent){
this._parse();
}
return this.node;
},tearDown:function(){
delete this.parseResults;
delete this.node;
delete this.content;
},onContentError:function(_f){
return "Error occured setting content: "+_f;
},_mixin:function(_10){
var _11={},key;
for(key in _10){
if(key in _11){
continue;
}
this[key]=_10[key];
}
},_parse:function(){
var _12=this.node;
try{
var _13={};
_1.forEach(["dir","lang","textDir"],function(_14){
if(this[_14]){
_13[_14]=this[_14];
}
},this);
this.parseResults=_1.parser.parse({rootNode:_12,noStart:!this.startup,inherited:_13,scope:this.parserScope});
}
catch(e){
this._onError("Content",e,"Error parsing in _ContentSetter#"+this.id);
}
},_onError:function(_15,err,_16){
var _17=this["on"+_15+"Error"].call(this,err);
if(_16){
console.error(_16,err);
}else{
if(_17){
_1.html._setNodeContent(this.node,_17,true);
}
}
}});
_1.html.set=function(_18,_19,_1a){
if(undefined==_19){
console.warn("dojo.html.set: no cont argument provided, using empty string");
_19="";
}
if(!_1a){
return _1.html._setNodeContent(_18,_19,true);
}else{
var op=new _1.html._ContentSetter(_1.mixin(_1a,{content:_19,node:_18}));
return op.set();
}
};
return _1.html;
});
