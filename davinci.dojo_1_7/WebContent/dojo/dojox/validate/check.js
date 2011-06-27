/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/validate/check",["dojo/_base/lang","./_base"],function(_1,_2){
_1.experimental("dojox.validate.check");
_2.check=function(_3,_4){
var _5=[];
var _6=[];
var _7={isSuccessful:function(){
return (!this.hasInvalid()&&!this.hasMissing());
},hasMissing:function(){
return (_5.length>0);
},getMissing:function(){
return _5;
},isMissing:function(_8){
for(var i=0;i<_5.length;i++){
if(_8==_5[i]){
return true;
}
}
return false;
},hasInvalid:function(){
return (_6.length>0);
},getInvalid:function(){
return _6;
},isInvalid:function(_9){
for(var i=0;i<_6.length;i++){
if(_9==_6[i]){
return true;
}
}
return false;
}};
var _a=function(_b,_c){
return (typeof _c[_b]=="undefined");
};
if(_4.trim instanceof Array){
for(var i=0;i<_4.trim.length;i++){
var _d=_3[_4.trim[i]];
if(_a("type",_d)||_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
_d.value=_d.value.replace(/(^\s*|\s*$)/g,"");
}
}
if(_4.uppercase instanceof Array){
for(var i=0;i<_4.uppercase.length;i++){
var _d=_3[_4.uppercase[i]];
if(_a("type",_d)||_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
_d.value=_d.value.toUpperCase();
}
}
if(_4.lowercase instanceof Array){
for(var i=0;i<_4.lowercase.length;i++){
var _d=_3[_4.lowercase[i]];
if(_a("type",_d)||_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
_d.value=_d.value.toLowerCase();
}
}
if(_4.ucfirst instanceof Array){
for(var i=0;i<_4.ucfirst.length;i++){
var _d=_3[_4.ucfirst[i]];
if(_a("type",_d)||_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
_d.value=_d.value.replace(/\b\w+\b/g,function(_e){
return _e.substring(0,1).toUpperCase()+_e.substring(1).toLowerCase();
});
}
}
if(_4.digit instanceof Array){
for(var i=0;i<_4.digit.length;i++){
var _d=_3[_4.digit[i]];
if(_a("type",_d)||_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
_d.value=_d.value.replace(/\D/g,"");
}
}
if(_4.required instanceof Array){
for(var i=0;i<_4.required.length;i++){
if(!_1.isString(_4.required[i])){
continue;
}
var _d=_3[_4.required[i]];
if(!_a("type",_d)&&(_d.type=="text"||_d.type=="textarea"||_d.type=="password"||_d.type=="file")&&/^\s*$/.test(_d.value)){
_5[_5.length]=_d.name;
}else{
if(!_a("type",_d)&&(_d.type=="select-one"||_d.type=="select-multiple")&&(_d.selectedIndex==-1||/^\s*$/.test(_d.options[_d.selectedIndex].value))){
_5[_5.length]=_d.name;
}else{
if(_d instanceof Array){
var _f=false;
for(var j=0;j<_d.length;j++){
if(_d[j].checked){
_f=true;
}
}
if(!_f){
_5[_5.length]=_d[0].name;
}
}
}
}
}
}
if(_4.required instanceof Array){
for(var i=0;i<_4.required.length;i++){
if(!_1.isObject(_4.required[i])){
continue;
}
var _d,_10;
for(var _11 in _4.required[i]){
_d=_3[_11];
_10=_4.required[i][_11];
}
if(_d instanceof Array){
var _f=0;
for(var j=0;j<_d.length;j++){
if(_d[j].checked){
_f++;
}
}
if(_f<_10){
_5[_5.length]=_d[0].name;
}
}else{
if(!_a("type",_d)&&_d.type=="select-multiple"){
var _12=0;
for(var j=0;j<_d.options.length;j++){
if(_d.options[j].selected&&!/^\s*$/.test(_d.options[j].value)){
_12++;
}
}
if(_12<_10){
_5[_5.length]=_d.name;
}
}
}
}
}
if(_1.isObject(_4.dependencies)){
for(_11 in _4.dependencies){
var _d=_3[_11];
if(_a("type",_d)){
continue;
}
if(_d.type!="text"&&_d.type!="textarea"&&_d.type!="password"){
continue;
}
if(/\S+/.test(_d.value)){
continue;
}
if(_7.isMissing(_d.name)){
continue;
}
var _13=_3[_4.dependencies[_11]];
if(_13.type!="text"&&_13.type!="textarea"&&_13.type!="password"){
continue;
}
if(/^\s*$/.test(_13.value)){
continue;
}
_5[_5.length]=_d.name;
}
}
if(_1.isObject(_4.constraints)){
for(_11 in _4.constraints){
var _d=_3[_11];
if(!_d){
continue;
}
if(!_a("tagName",_d)&&(_d.tagName.toLowerCase().indexOf("input")>=0||_d.tagName.toLowerCase().indexOf("textarea")>=0)&&/^\s*$/.test(_d.value)){
continue;
}
var _14=true;
if(_1.isFunction(_4.constraints[_11])){
_14=_4.constraints[_11](_d.value);
}else{
if(_1.isArray(_4.constraints[_11])){
if(_1.isArray(_4.constraints[_11][0])){
for(var i=0;i<_4.constraints[_11].length;i++){
_14=_2.evaluateConstraint(_4,_4.constraints[_11][i],_11,_d);
if(!_14){
break;
}
}
}else{
_14=_2.evaluateConstraint(_4,_4.constraints[_11],_11,_d);
}
}
}
if(!_14){
_6[_6.length]=_d.name;
}
}
}
if(_1.isObject(_4.confirm)){
for(_11 in _4.confirm){
var _d=_3[_11];
var _13=_3[_4.confirm[_11]];
if(_a("type",_d)||_a("type",_13)||(_d.type!="text"&&_d.type!="textarea"&&_d.type!="password")||(_13.type!=_d.type)||(_13.value==_d.value)||(_7.isInvalid(_d.name))||(/^\s*$/.test(_13.value))){
continue;
}
_6[_6.length]=_d.name;
}
}
return _7;
};
_2.evaluateConstraint=function(_15,_16,_17,_18){
var _19=_16[0];
var _1a=_16.slice(1);
_1a.unshift(_18.value);
if(typeof _19!="undefined"){
return _19.apply(null,_1a);
}
return false;
};
return _2.check;
});
