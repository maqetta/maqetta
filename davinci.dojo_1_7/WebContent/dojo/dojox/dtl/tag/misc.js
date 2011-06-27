/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/tag/misc",["dojo/_base/kernel","dojo/_base/lang","../_base","dojo/_base/array","dojo/_base/connect"],function(_1,_2,dd){
_1.getObject("dtl.tag.misc",true,dojox);
var _3=dd.tag.misc;
_3.DebugNode=_1.extend(function(_4){
this.text=_4;
},{render:function(_5,_6){
var _7=_5.getKeys();
var _8=[];
var _9={};
for(var i=0,_a;_a=_7[i];i++){
_9[_a]=_5[_a];
_8+="["+_a+": "+typeof _5[_a]+"]\n";
}
return this.text.set(_8).render(_5,_6,this);
},unrender:function(_b,_c){
return _c;
},clone:function(_d){
return new this.constructor(this.text.clone(_d));
},toString:function(){
return "ddtm.DebugNode";
}});
_3.FilterNode=_1.extend(function(_e,_f){
this._varnode=_e;
this._nodelist=_f;
},{render:function(_10,_11){
var _12=this._nodelist.render(_10,new dojox.string.Builder());
_10=_10.update({"var":_12.toString()});
var _13=this._varnode.render(_10,_11);
_10=_10.pop();
return _11;
},unrender:function(_14,_15){
return _15;
},clone:function(_16){
return new this.constructor(this._expression,this._nodelist.clone(_16));
}});
_3.FirstOfNode=_1.extend(function(_17,_18){
this._vars=_17;
this.vars=_1.map(_17,function(_19){
return new dojox.dtl._Filter(_19);
});
this.contents=_18;
},{render:function(_1a,_1b){
for(var i=0,_1c;_1c=this.vars[i];i++){
var _1d=_1c.resolve(_1a);
if(typeof _1d!="undefined"){
if(_1d===null){
_1d="null";
}
this.contents.set(_1d);
return this.contents.render(_1a,_1b);
}
}
return this.contents.unrender(_1a,_1b);
},unrender:function(_1e,_1f){
return this.contents.unrender(_1e,_1f);
},clone:function(_20){
return new this.constructor(this._vars,this.contents.clone(_20));
}});
_3.SpacelessNode=_1.extend(function(_21,_22){
this.nodelist=_21;
this.contents=_22;
},{render:function(_23,_24){
if(_24.getParent){
var _25=[_1.connect(_24,"onAddNodeComplete",this,"_watch"),_1.connect(_24,"onSetParent",this,"_watchParent")];
_24=this.nodelist.render(_23,_24);
_1.disconnect(_25[0]);
_1.disconnect(_25[1]);
}else{
var _26=this.nodelist.dummyRender(_23);
this.contents.set(_26.replace(/>\s+</g,"><"));
_24=this.contents.render(_23,_24);
}
return _24;
},unrender:function(_27,_28){
return this.nodelist.unrender(_27,_28);
},clone:function(_29){
return new this.constructor(this.nodelist.clone(_29),this.contents.clone(_29));
},_isEmpty:function(_2a){
return (_2a.nodeType==3&&!_2a.data.match(/[^\s\n]/));
},_watch:function(_2b){
if(this._isEmpty(_2b)){
var _2c=false;
if(_2b.parentNode.firstChild==_2b){
_2b.parentNode.removeChild(_2b);
}
}else{
var _2d=_2b.parentNode.childNodes;
if(_2b.nodeType==1&&_2d.length>2){
for(var i=2,_2e;_2e=_2d[i];i++){
if(_2d[i-2].nodeType==1&&this._isEmpty(_2d[i-1])){
_2b.parentNode.removeChild(_2d[i-1]);
return;
}
}
}
}
},_watchParent:function(_2f){
var _30=_2f.childNodes;
if(_30.length){
while(_2f.childNodes.length){
var _31=_2f.childNodes[_2f.childNodes.length-1];
if(!this._isEmpty(_31)){
return;
}
_2f.removeChild(_31);
}
}
}});
_3.TemplateTagNode=_1.extend(function(tag,_32){
this.tag=tag;
this.contents=_32;
},{mapping:{openblock:"{%",closeblock:"%}",openvariable:"{{",closevariable:"}}",openbrace:"{",closebrace:"}",opencomment:"{#",closecomment:"#}"},render:function(_33,_34){
this.contents.set(this.mapping[this.tag]);
return this.contents.render(_33,_34);
},unrender:function(_35,_36){
return this.contents.unrender(_35,_36);
},clone:function(_37){
return new this.constructor(this.tag,this.contents.clone(_37));
}});
_3.WidthRatioNode=_1.extend(function(_38,max,_39,_3a){
this.current=new dd._Filter(_38);
this.max=new dd._Filter(max);
this.width=_39;
this.contents=_3a;
},{render:function(_3b,_3c){
var _3d=+this.current.resolve(_3b);
var max=+this.max.resolve(_3b);
if(typeof _3d!="number"||typeof max!="number"||!max){
this.contents.set("");
}else{
this.contents.set(""+Math.round((_3d/max)*this.width));
}
return this.contents.render(_3b,_3c);
},unrender:function(_3e,_3f){
return this.contents.unrender(_3e,_3f);
},clone:function(_40){
return new this.constructor(this.current.getExpression(),this.max.getExpression(),this.width,this.contents.clone(_40));
}});
_3.WithNode=_1.extend(function(_41,_42,_43){
this.target=new dd._Filter(_41);
this.alias=_42;
this.nodelist=_43;
},{render:function(_44,_45){
var _46=this.target.resolve(_44);
_44=_44.push();
_44[this.alias]=_46;
_45=this.nodelist.render(_44,_45);
_44=_44.pop();
return _45;
},unrender:function(_47,_48){
return _48;
},clone:function(_49){
return new this.constructor(this.target.getExpression(),this.alias,this.nodelist.clone(_49));
}});
_1.mixin(_3,{comment:function(_4a,_4b){
_4a.skip_past("endcomment");
return dd._noOpNode;
},debug:function(_4c,_4d){
return new _3.DebugNode(_4c.create_text_node());
},filter:function(_4e,_4f){
var _50=_4f.contents.split(null,1)[1];
var _51=_4e.create_variable_node("var|"+_50);
var _52=_4e.parse(["endfilter"]);
_4e.next_token();
return new _3.FilterNode(_51,_52);
},firstof:function(_53,_54){
var _55=_54.split_contents().slice(1);
if(!_55.length){
throw new Error("'firstof' statement requires at least one argument");
}
return new _3.FirstOfNode(_55,_53.create_text_node());
},spaceless:function(_56,_57){
var _58=_56.parse(["endspaceless"]);
_56.delete_first_token();
return new _3.SpacelessNode(_58,_56.create_text_node());
},templatetag:function(_59,_5a){
var _5b=_5a.contents.split();
if(_5b.length!=2){
throw new Error("'templatetag' statement takes one argument");
}
var tag=_5b[1];
var _5c=_3.TemplateTagNode.prototype.mapping;
if(!_5c[tag]){
var _5d=[];
for(var key in _5c){
_5d.push(key);
}
throw new Error("Invalid templatetag argument: '"+tag+"'. Must be one of: "+_5d.join(", "));
}
return new _3.TemplateTagNode(tag,_59.create_text_node());
},widthratio:function(_5e,_5f){
var _60=_5f.contents.split();
if(_60.length!=4){
throw new Error("widthratio takes three arguments");
}
var _61=+_60[3];
if(typeof _61!="number"){
throw new Error("widthratio final argument must be an integer");
}
return new _3.WidthRatioNode(_60[1],_60[2],_61,_5e.create_text_node());
},with_:function(_62,_63){
var _64=_63.split_contents();
if(_64.length!=4||_64[2]!="as"){
throw new Error("do_width expected format as 'with value as name'");
}
var _65=_62.parse(["endwith"]);
_62.next_token();
return new _3.WithNode(_64[1],_64[3],_65);
}});
return dojox.dtl.tag.misc;
});
