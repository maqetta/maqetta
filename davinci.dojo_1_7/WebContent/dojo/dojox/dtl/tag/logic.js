/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/tag/logic",["dojo/_base/kernel","dojo/_base/lang","../_base","dojo/_base/array"],function(_1,_2,dd){
_1.getObject("dtl.tag.logic",true,dojox);
var _3=dd.text;
var _4=dd.tag.logic;
_4.IfNode=_1.extend(function(_5,_6,_7,_8){
this.bools=_5;
this.trues=_6;
this.falses=_7;
this.type=_8;
},{render:function(_9,_a){
var i,_b,_c,_d,_e;
if(this.type=="or"){
for(i=0;_b=this.bools[i];i++){
_c=_b[0];
_d=_b[1];
_e=_d.resolve(_9);
if((_e&&!_c)||(_c&&!_e)){
if(this.falses){
_a=this.falses.unrender(_9,_a);
}
return (this.trues)?this.trues.render(_9,_a,this):_a;
}
}
if(this.trues){
_a=this.trues.unrender(_9,_a);
}
return (this.falses)?this.falses.render(_9,_a,this):_a;
}else{
for(i=0;_b=this.bools[i];i++){
_c=_b[0];
_d=_b[1];
_e=_d.resolve(_9);
if(_e==_c){
if(this.trues){
_a=this.trues.unrender(_9,_a);
}
return (this.falses)?this.falses.render(_9,_a,this):_a;
}
}
if(this.falses){
_a=this.falses.unrender(_9,_a);
}
return (this.trues)?this.trues.render(_9,_a,this):_a;
}
return _a;
},unrender:function(_f,_10){
_10=(this.trues)?this.trues.unrender(_f,_10):_10;
_10=(this.falses)?this.falses.unrender(_f,_10):_10;
return _10;
},clone:function(_11){
var _12=(this.trues)?this.trues.clone(_11):null;
var _13=(this.falses)?this.falses.clone(_11):null;
return new this.constructor(this.bools,_12,_13,this.type);
}});
_4.IfEqualNode=_1.extend(function(_14,_15,_16,_17,_18){
this.var1=new dd._Filter(_14);
this.var2=new dd._Filter(_15);
this.trues=_16;
this.falses=_17;
this.negate=_18;
},{render:function(_19,_1a){
var _1b=this.var1.resolve(_19);
var _1c=this.var2.resolve(_19);
_1b=(typeof _1b!="undefined")?_1b:"";
_1c=(typeof _1b!="undefined")?_1c:"";
if((this.negate&&_1b!=_1c)||(!this.negate&&_1b==_1c)){
if(this.falses){
_1a=this.falses.unrender(_19,_1a,this);
}
return (this.trues)?this.trues.render(_19,_1a,this):_1a;
}
if(this.trues){
_1a=this.trues.unrender(_19,_1a,this);
}
return (this.falses)?this.falses.render(_19,_1a,this):_1a;
},unrender:function(_1d,_1e){
return _4.IfNode.prototype.unrender.call(this,_1d,_1e);
},clone:function(_1f){
var _20=this.trues?this.trues.clone(_1f):null;
var _21=this.falses?this.falses.clone(_1f):null;
return new this.constructor(this.var1.getExpression(),this.var2.getExpression(),_20,_21,this.negate);
}});
_4.ForNode=_1.extend(function(_22,_23,_24,_25){
this.assign=_22;
this.loop=new dd._Filter(_23);
this.reversed=_24;
this.nodelist=_25;
this.pool=[];
},{render:function(_26,_27){
var i,j,k;
var _28=false;
var _29=this.assign;
for(k=0;k<_29.length;k++){
if(typeof _26[_29[k]]!="undefined"){
_28=true;
_26=_26.push();
break;
}
}
if(!_28&&_26.forloop){
_28=true;
_26=_26.push();
}
var _2a=this.loop.resolve(_26)||[];
for(i=_2a.length;i<this.pool.length;i++){
this.pool[i].unrender(_26,_27,this);
}
if(this.reversed){
_2a=_2a.slice(0).reverse();
}
var _2b=_1.isObject(_2a)&&!_1.isArrayLike(_2a);
var _2c=[];
if(_2b){
for(var key in _2a){
_2c.push(_2a[key]);
}
}else{
_2c=_2a;
}
var _2d=_26.forloop={parentloop:_26.get("forloop",{})};
var j=0;
for(i=0;i<_2c.length;i++){
var _2e=_2c[i];
_2d.counter0=j;
_2d.counter=j+1;
_2d.revcounter0=_2c.length-j-1;
_2d.revcounter=_2c.length-j;
_2d.first=!j;
_2d.last=(j==_2c.length-1);
if(_29.length>1&&_1.isArrayLike(_2e)){
if(!_28){
_28=true;
_26=_26.push();
}
var _2f={};
for(k=0;k<_2e.length&&k<_29.length;k++){
_2f[_29[k]]=_2e[k];
}
_1.mixin(_26,_2f);
}else{
_26[_29[0]]=_2e;
}
if(j+1>this.pool.length){
this.pool.push(this.nodelist.clone(_27));
}
_27=this.pool[j++].render(_26,_27,this);
}
delete _26.forloop;
if(_28){
_26=_26.pop();
}else{
for(k=0;k<_29.length;k++){
delete _26[_29[k]];
}
}
return _27;
},unrender:function(_30,_31){
for(var i=0,_32;_32=this.pool[i];i++){
_31=_32.unrender(_30,_31);
}
return _31;
},clone:function(_33){
return new this.constructor(this.assign,this.loop.getExpression(),this.reversed,this.nodelist.clone(_33));
}});
_1.mixin(_4,{if_:function(_34,_35){
var i,_36,_37,_38=[],_39=_35.contents.split();
_39.shift();
_35=_39.join(" ");
_39=_35.split(" and ");
if(_39.length==1){
_37="or";
_39=_35.split(" or ");
}else{
_37="and";
for(i=0;i<_39.length;i++){
if(_39[i].indexOf(" or ")!=-1){
throw new Error("'if' tags can't mix 'and' and 'or'");
}
}
}
for(i=0;_36=_39[i];i++){
var not=false;
if(_36.indexOf("not ")==0){
_36=_36.slice(4);
not=true;
}
_38.push([not,new dd._Filter(_36)]);
}
var _3a=_34.parse(["else","endif"]);
var _3b=false;
var _35=_34.next_token();
if(_35.contents=="else"){
_3b=_34.parse(["endif"]);
_34.next_token();
}
return new _4.IfNode(_38,_3a,_3b,_37);
},_ifequal:function(_3c,_3d,_3e){
var _3f=_3d.split_contents();
if(_3f.length!=3){
throw new Error(_3f[0]+" takes two arguments");
}
var end="end"+_3f[0];
var _40=_3c.parse(["else",end]);
var _41=false;
var _3d=_3c.next_token();
if(_3d.contents=="else"){
_41=_3c.parse([end]);
_3c.next_token();
}
return new _4.IfEqualNode(_3f[1],_3f[2],_40,_41,_3e);
},ifequal:function(_42,_43){
return _4._ifequal(_42,_43);
},ifnotequal:function(_44,_45){
return _4._ifequal(_44,_45,true);
},for_:function(_46,_47){
var _48=_47.contents.split();
if(_48.length<4){
throw new Error("'for' statements should have at least four words: "+_47.contents);
}
var _49=_48[_48.length-1]=="reversed";
var _4a=(_49)?-3:-2;
if(_48[_48.length+_4a]!="in"){
throw new Error("'for' tag received an invalid argument: "+_47.contents);
}
var _4b=_48.slice(1,_4a).join(" ").split(/ *, */);
for(var i=0;i<_4b.length;i++){
if(!_4b[i]||_4b[i].indexOf(" ")!=-1){
throw new Error("'for' tag received an invalid argument: "+_47.contents);
}
}
var _4c=_46.parse(["endfor"]);
_46.next_token();
return new _4.ForNode(_4b,_48[_48.length+_4a+1],_49,_4c);
}});
return dojox.dtl.tag.logic;
});
