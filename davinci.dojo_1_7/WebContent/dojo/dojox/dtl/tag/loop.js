/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/tag/loop",["dojo/_base/kernel","dojo/_base/lang","../_base","dojox/string/tokenize","dojo/_base/array"],function(_1,_2,dd,_3){
_1.getObject("dtl.tag.loop",true,dojox);
var _4=dd.tag.loop;
_4.CycleNode=_1.extend(function(_5,_6,_7,_8){
this.cyclevars=_5;
this.name=_6;
this.contents=_7;
this.shared=_8||{counter:-1,map:{}};
},{render:function(_9,_a){
if(_9.forloop&&!_9.forloop.counter0){
this.shared.counter=-1;
}
++this.shared.counter;
var _b=this.cyclevars[this.shared.counter%this.cyclevars.length];
var _c=this.shared.map;
if(!_c[_b]){
_c[_b]=new dd._Filter(_b);
}
_b=_c[_b].resolve(_9,_a);
if(this.name){
_9[this.name]=_b;
}
this.contents.set(_b);
return this.contents.render(_9,_a);
},unrender:function(_d,_e){
return this.contents.unrender(_d,_e);
},clone:function(_f){
return new this.constructor(this.cyclevars,this.name,this.contents.clone(_f),this.shared);
}});
_4.IfChangedNode=_1.extend(function(_10,_11,_12){
this.nodes=_10;
this._vars=_11;
this.shared=_12||{last:null,counter:0};
this.vars=_1.map(_11,function(_13){
return new dojox.dtl._Filter(_13);
});
},{render:function(_14,_15){
if(_14.forloop){
if(_14.forloop.counter<=this.shared.counter){
this.shared.last=null;
}
this.shared.counter=_14.forloop.counter;
}
var _16;
if(this.vars.length){
_16=_1.toJson(_1.map(this.vars,function(_17){
return _17.resolve(_14);
}));
}else{
_16=this.nodes.dummyRender(_14,_15);
}
if(_16!=this.shared.last){
var _18=(this.shared.last===null);
this.shared.last=_16;
_14=_14.push();
_14.ifchanged={firstloop:_18};
_15=this.nodes.render(_14,_15);
_14=_14.pop();
}else{
_15=this.nodes.unrender(_14,_15);
}
return _15;
},unrender:function(_19,_1a){
return this.nodes.unrender(_19,_1a);
},clone:function(_1b){
return new this.constructor(this.nodes.clone(_1b),this._vars,this.shared);
}});
_4.RegroupNode=_1.extend(function(_1c,key,_1d){
this._expression=_1c;
this.expression=new dd._Filter(_1c);
this.key=key;
this.alias=_1d;
},{_push:function(_1e,_1f,_20){
if(_20.length){
_1e.push({grouper:_1f,list:_20});
}
},render:function(_21,_22){
_21[this.alias]=[];
var _23=this.expression.resolve(_21);
if(_23){
var _24=null;
var _25=[];
for(var i=0;i<_23.length;i++){
var id=_23[i][this.key];
if(_24!==id){
this._push(_21[this.alias],_24,_25);
_24=id;
_25=[_23[i]];
}else{
_25.push(_23[i]);
}
}
this._push(_21[this.alias],_24,_25);
}
return _22;
},unrender:function(_26,_27){
return _27;
},clone:function(_28,_29){
return this;
}});
_1.mixin(_4,{cycle:function(_2a,_2b){
var _2c=_2b.split_contents();
if(_2c.length<2){
throw new Error("'cycle' tag requires at least two arguments");
}
if(_2c[1].indexOf(",")!=-1){
var _2d=_2c[1].split(",");
_2c=[_2c[0]];
for(var i=0;i<_2d.length;i++){
_2c.push("\""+_2d[i]+"\"");
}
}
if(_2c.length==2){
var _2e=_2c[_2c.length-1];
if(!_2a._namedCycleNodes){
throw new Error("No named cycles in template: '"+_2e+"' is not defined");
}
if(!_2a._namedCycleNodes[_2e]){
throw new Error("Named cycle '"+_2e+"' does not exist");
}
return _2a._namedCycleNodes[_2e];
}
if(_2c.length>4&&_2c[_2c.length-2]=="as"){
var _2e=_2c[_2c.length-1];
var _2f=new _4.CycleNode(_2c.slice(1,_2c.length-2),_2e,_2a.create_text_node());
if(!_2a._namedCycleNodes){
_2a._namedCycleNodes={};
}
_2a._namedCycleNodes[_2e]=_2f;
}else{
_2f=new _4.CycleNode(_2c.slice(1),null,_2a.create_text_node());
}
return _2f;
},ifchanged:function(_30,_31){
var _32=_31.contents.split();
var _33=_30.parse(["endifchanged"]);
_30.delete_first_token();
return new _4.IfChangedNode(_33,_32.slice(1));
},regroup:function(_34,_35){
var _36=_3(_35.contents,/(\s+)/g,function(_37){
return _37;
});
if(_36.length<11||_36[_36.length-3]!="as"||_36[_36.length-7]!="by"){
throw new Error("Expected the format: regroup list by key as newList");
}
var _38=_36.slice(2,-8).join("");
var key=_36[_36.length-5];
var _39=_36[_36.length-1];
return new _4.RegroupNode(_38,key,_39);
}});
return dojox.dtl.tag.loop;
});
