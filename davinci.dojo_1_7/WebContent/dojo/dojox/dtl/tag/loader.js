/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/tag/loader",["dojo/_base/kernel","dojo/_base/lang","../_base","dojo/_base/array","dojo/_base/connect"],function(_1,_2,dd){
_1.getObject("dtl.tag.loader",true,dojox);
var _3=dd.tag.loader;
_3.BlockNode=_1.extend(function(_4,_5){
this.name=_4;
this.nodelist=_5;
},{"super":function(){
if(this.parent){
var _6=this.parent.nodelist.dummyRender(this.context,null,true);
if(typeof _6=="string"){
_6=new String(_6);
}
_6.safe=true;
return _6;
}
return "";
},render:function(_7,_8){
var _9=this.name;
var _a=this.nodelist;
var _b;
if(_8.blocks){
var _c=_8.blocks[_9];
if(_c){
_b=_c.parent;
_a=_c.nodelist;
_c.used=true;
}
}
this.rendered=_a;
_7=_7.push();
this.context=_7;
this.parent=null;
if(_a!=this.nodelist){
this.parent=this;
}
_7.block=this;
if(_8.getParent){
var _d=_8.getParent();
var _e=_1.connect(_8,"onSetParent",function(_f,up,_10){
if(up&&_10){
_8.setParent(_d);
}
});
}
_8=_a.render(_7,_8,this);
_e&&_1.disconnect(_e);
_7=_7.pop();
return _8;
},unrender:function(_11,_12){
return this.rendered.unrender(_11,_12);
},clone:function(_13){
return new this.constructor(this.name,this.nodelist.clone(_13));
},toString:function(){
return "dojox.dtl.tag.loader.BlockNode";
}});
_3.ExtendsNode=_1.extend(function(_14,_15,_16,_17,key){
this.getTemplate=_14;
this.nodelist=_15;
this.shared=_16;
this.parent=_17;
this.key=key;
},{parents:{},getParent:function(_18){
var _19=this.parent;
if(!_19){
var _1a;
_19=this.parent=_18.get(this.key,false);
if(!_19){
throw new Error("extends tag used a variable that did not resolve");
}
if(typeof _19=="object"){
var url=_19.url||_19.templatePath;
if(_19.shared){
this.shared=true;
}
if(url){
_19=this.parent=url.toString();
}else{
if(_19.templateString){
_1a=_19.templateString;
_19=this.parent=" ";
}else{
_19=this.parent=this.parent.toString();
}
}
}
if(_19&&_19.indexOf("shared:")===0){
this.shared=true;
_19=this.parent=_19.substring(7,_19.length);
}
}
if(!_19){
throw new Error("Invalid template name in 'extends' tag.");
}
if(_19.render){
return _19;
}
if(this.parents[_19]){
return this.parents[_19];
}
this.parent=this.getTemplate(_1a||dojox.dtl.text.getTemplateString(_19));
if(this.shared){
this.parents[_19]=this.parent;
}
return this.parent;
},render:function(_1b,_1c){
var _1d=this.getParent(_1b);
_1d.blocks=_1d.blocks||{};
_1c.blocks=_1c.blocks||{};
for(var i=0,_1e;_1e=this.nodelist.contents[i];i++){
if(_1e instanceof dojox.dtl.tag.loader.BlockNode){
var old=_1d.blocks[_1e.name];
if(old&&old.nodelist!=_1e.nodelist){
_1c=old.nodelist.unrender(_1b,_1c);
}
_1d.blocks[_1e.name]=_1c.blocks[_1e.name]={shared:this.shared,nodelist:_1e.nodelist,used:false};
}
}
this.rendered=_1d;
return _1d.nodelist.render(_1b,_1c,this);
},unrender:function(_1f,_20){
return this.rendered.unrender(_1f,_20,this);
},toString:function(){
return "dojox.dtl.block.ExtendsNode";
}});
_3.IncludeNode=_1.extend(function(_21,_22,_23,_24,_25){
this._path=_21;
this.constant=_22;
this.path=(_22)?_21:new dd._Filter(_21);
this.getTemplate=_23;
this.text=_24;
this.parsed=(arguments.length==5)?_25:true;
},{_cache:[{},{}],render:function(_26,_27){
var _28=((this.constant)?this.path:this.path.resolve(_26)).toString();
var _29=Number(this.parsed);
var _2a=false;
if(_28!=this.last){
_2a=true;
if(this.last){
_27=this.unrender(_26,_27);
}
this.last=_28;
}
var _2b=this._cache[_29];
if(_29){
if(!_2b[_28]){
_2b[_28]=dd.text._resolveTemplateArg(_28,true);
}
if(_2a){
var _2c=this.getTemplate(_2b[_28]);
this.rendered=_2c.nodelist;
}
return this.rendered.render(_26,_27,this);
}else{
if(this.text instanceof dd._TextNode){
if(_2a){
this.rendered=this.text;
this.rendered.set(dd.text._resolveTemplateArg(_28,true));
}
return this.rendered.render(_26,_27);
}else{
if(!_2b[_28]){
var _2d=[];
var div=document.createElement("div");
div.innerHTML=dd.text._resolveTemplateArg(_28,true);
var _2e=div.childNodes;
while(_2e.length){
var _2f=div.removeChild(_2e[0]);
_2d.push(_2f);
}
_2b[_28]=_2d;
}
if(_2a){
this.nodelist=[];
var _30=true;
for(var i=0,_31;_31=_2b[_28][i];i++){
this.nodelist.push(_31.cloneNode(true));
}
}
for(var i=0,_32;_32=this.nodelist[i];i++){
_27=_27.concat(_32);
}
}
}
return _27;
},unrender:function(_33,_34){
if(this.rendered){
_34=this.rendered.unrender(_33,_34);
}
if(this.nodelist){
for(var i=0,_35;_35=this.nodelist[i];i++){
_34=_34.remove(_35);
}
}
return _34;
},clone:function(_36){
return new this.constructor(this._path,this.constant,this.getTemplate,this.text.clone(_36),this.parsed);
}});
_1.mixin(_3,{block:function(_37,_38){
var _39=_38.contents.split();
var _3a=_39[1];
_37._blocks=_37._blocks||{};
_37._blocks[_3a]=_37._blocks[_3a]||[];
_37._blocks[_3a].push(_3a);
var _3b=_37.parse(["endblock","endblock "+_3a]).rtrim();
_37.next_token();
return new dojox.dtl.tag.loader.BlockNode(_3a,_3b);
},extends_:function(_3c,_3d){
var _3e=_3d.contents.split();
var _3f=false;
var _40=null;
var key=null;
if(_3e[1].charAt(0)=="\""||_3e[1].charAt(0)=="'"){
_40=_3e[1].substring(1,_3e[1].length-1);
}else{
key=_3e[1];
}
if(_40&&_40.indexOf("shared:")==0){
_3f=true;
_40=_40.substring(7,_40.length);
}
var _41=_3c.parse();
return new dojox.dtl.tag.loader.ExtendsNode(_3c.getTemplate,_41,_3f,_40,key);
},include:function(_42,_43){
var _44=_43.contents.split();
if(_44.length!=2){
throw new Error(_44[0]+" tag takes one argument: the name of the template to be included");
}
var _45=_44[1];
var _46=false;
if((_45.charAt(0)=="\""||_45.slice(-1)=="'")&&_45.charAt(0)==_45.slice(-1)){
_45=_45.slice(1,-1);
_46=true;
}
return new _3.IncludeNode(_45,_46,_42.getTemplate,_42.create_text_node());
},ssi:function(_47,_48){
var _49=_48.contents.split();
var _4a=false;
if(_49.length==3){
_4a=(_49.pop()=="parsed");
if(!_4a){
throw new Error("Second (optional) argument to ssi tag must be 'parsed'");
}
}
var _4b=_3.include(_47,new dd.Token(_48.token_type,_49.join(" ")));
_4b.parsed=_4a;
return _4b;
}});
return dojox.dtl.tag.loader;
});
