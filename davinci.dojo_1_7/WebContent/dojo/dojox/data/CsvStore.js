/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/CsvStore",["dojo","dojox","dojo/data/util/filter","dojo/data/util/simpleFetch"],function(_1,_2){
_1.declare("dojox.data.CsvStore",null,{constructor:function(_3){
this._attributes=[];
this._attributeIndexes={};
this._dataArray=[];
this._arrayOfAllItems=[];
this._loadFinished=false;
if(_3.url){
this.url=_3.url;
}
this._csvData=_3.data;
if(_3.label){
this.label=_3.label;
}else{
if(this.label===""){
this.label=undefined;
}
}
this._storeProp="_csvStore";
this._idProp="_csvId";
this._features={"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
this._loadInProgress=false;
this._queuedFetches=[];
this.identifier=_3.identifier;
if(this.identifier===""){
delete this.identifier;
}else{
this._idMap={};
}
if("separator" in _3){
this.separator=_3.separator;
}
if("urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
},url:"",label:"",identifier:"",separator:",",urlPreventCache:false,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error(this.declaredClass+": a function was passed an item argument that was not an item");
}
},_getIndex:function(_5){
var _6=this.getIdentity(_5);
if(this.identifier){
_6=this._idMap[_6];
}
return _6;
},getValue:function(_7,_8,_9){
this._assertIsItem(_7);
var _a=_9;
if(typeof _8==="string"){
var ai=this._attributeIndexes[_8];
if(ai!=null){
var _b=this._dataArray[this._getIndex(_7)];
_a=_b[ai]||_9;
}
}else{
throw new Error(this.declaredClass+": a function was passed an attribute argument that was not a string");
}
return _a;
},getValues:function(_c,_d){
var _e=this.getValue(_c,_d);
return (_e?[_e]:[]);
},getAttributes:function(_f){
this._assertIsItem(_f);
var _10=[];
var _11=this._dataArray[this._getIndex(_f)];
for(var i=0;i<_11.length;i++){
if(_11[i]!==""){
_10.push(this._attributes[i]);
}
}
return _10;
},hasAttribute:function(_12,_13){
this._assertIsItem(_12);
if(typeof _13==="string"){
var _14=this._attributeIndexes[_13];
var _15=this._dataArray[this._getIndex(_12)];
return (typeof _14!=="undefined"&&_14<_15.length&&_15[_14]!=="");
}else{
throw new Error(this.declaredClass+": a function was passed an attribute argument that was not a string");
}
},containsValue:function(_16,_17,_18){
var _19=undefined;
if(typeof _18==="string"){
_19=_1.data.util.filter.patternToRegExp(_18,false);
}
return this._containsValue(_16,_17,_18,_19);
},_containsValue:function(_1a,_1b,_1c,_1d){
var _1e=this.getValues(_1a,_1b);
for(var i=0;i<_1e.length;++i){
var _1f=_1e[i];
if(typeof _1f==="string"&&_1d){
return (_1f.match(_1d)!==null);
}else{
if(_1c===_1f){
return true;
}
}
}
return false;
},isItem:function(_20){
if(_20&&_20[this._storeProp]===this){
var _21=_20[this._idProp];
if(this.identifier){
var _22=this._dataArray[this._idMap[_21]];
if(_22){
return true;
}
}else{
if(_21>=0&&_21<this._dataArray.length){
return true;
}
}
}
return false;
},isItemLoaded:function(_23){
return this.isItem(_23);
},loadItem:function(_24){
},getFeatures:function(){
return this._features;
},getLabel:function(_25){
if(this.label&&this.isItem(_25)){
return this.getValue(_25,this.label);
}
return undefined;
},getLabelAttributes:function(_26){
if(this.label){
return [this.label];
}
return null;
},_fetchItems:function(_27,_28,_29){
var _2a=this;
var _2b=function(_2c,_2d){
var _2e=null;
if(_2c.query){
var key,_2f;
_2e=[];
var _30=_2c.queryOptions?_2c.queryOptions.ignoreCase:false;
var _31={};
for(key in _2c.query){
_2f=_2c.query[key];
if(typeof _2f==="string"){
_31[key]=_1.data.util.filter.patternToRegExp(_2f,_30);
}
}
for(var i=0;i<_2d.length;++i){
var _32=true;
var _33=_2d[i];
for(key in _2c.query){
_2f=_2c.query[key];
if(!_2a._containsValue(_33,key,_2f,_31[key])){
_32=false;
}
}
if(_32){
_2e.push(_33);
}
}
}else{
_2e=_2d.slice(0,_2d.length);
}
_28(_2e,_2c);
};
if(this._loadFinished){
_2b(_27,this._arrayOfAllItems);
}else{
if(this.url!==""){
if(this._loadInProgress){
this._queuedFetches.push({args:_27,filter:_2b});
}else{
this._loadInProgress=true;
var _34={url:_2a.url,handleAs:"text",preventCache:_2a.urlPreventCache};
var _35=_1.xhrGet(_34);
_35.addCallback(function(_36){
try{
_2a._processData(_36);
_2b(_27,_2a._arrayOfAllItems);
_2a._handleQueuedFetches();
}
catch(e){
_29(e,_27);
}
});
_35.addErrback(function(_37){
_2a._loadInProgress=false;
if(_29){
_29(_37,_27);
}else{
throw _37;
}
});
var _38=null;
if(_27.abort){
_38=_27.abort;
}
_27.abort=function(){
var df=_35;
if(df&&df.fired===-1){
df.cancel();
df=null;
}
if(_38){
_38.call(_27);
}
};
}
}else{
if(this._csvData){
try{
this._processData(this._csvData);
this._csvData=null;
_2b(_27,this._arrayOfAllItems);
}
catch(e){
_29(e,_27);
}
}else{
var _39=new Error(this.declaredClass+": No CSV source data was provided as either URL or String data input.");
if(_29){
_29(_39,_27);
}else{
throw _39;
}
}
}
}
},close:function(_3a){
},_getArrayOfArraysFromCsvFileContents:function(_3b){
if(_1.isString(_3b)){
var _3c=new RegExp("^\\s+","g");
var _3d=new RegExp("\\s+$","g");
var _3e=new RegExp("\"\"","g");
var _3f=[];
var i;
var _40=this._splitLines(_3b);
for(i=0;i<_40.length;++i){
var _41=_40[i];
if(_41.length>0){
var _42=_41.split(this.separator);
var j=0;
while(j<_42.length){
var _43=_42[j];
var _44=_43.replace(_3c,"");
var _45=_44.replace(_3d,"");
var _46=_45.charAt(0);
var _47=_45.charAt(_45.length-1);
var _48=_45.charAt(_45.length-2);
var _49=_45.charAt(_45.length-3);
if(_45.length===2&&_45=="\"\""){
_42[j]="";
}else{
if((_46=="\"")&&((_47!="\"")||((_47=="\"")&&(_48=="\"")&&(_49!="\"")))){
if(j+1===_42.length){
return;
}
var _4a=_42[j+1];
_42[j]=_44+this.separator+_4a;
_42.splice(j+1,1);
}else{
if((_46=="\"")&&(_47=="\"")){
_45=_45.slice(1,(_45.length-1));
_45=_45.replace(_3e,"\"");
}
_42[j]=_45;
j+=1;
}
}
}
_3f.push(_42);
}
}
this._attributes=_3f.shift();
for(i=0;i<this._attributes.length;i++){
this._attributeIndexes[this._attributes[i]]=i;
}
this._dataArray=_3f;
}
},_splitLines:function(_4b){
var _4c=[];
var i;
var _4d="";
var _4e=false;
for(i=0;i<_4b.length;i++){
var c=_4b.charAt(i);
switch(c){
case "\"":
_4e=!_4e;
_4d+=c;
break;
case "\r":
if(_4e){
_4d+=c;
}else{
_4c.push(_4d);
_4d="";
if(i<(_4b.length-1)&&_4b.charAt(i+1)=="\n"){
i++;
}
}
break;
case "\n":
if(_4e){
_4d+=c;
}else{
_4c.push(_4d);
_4d="";
}
break;
default:
_4d+=c;
}
}
if(_4d!==""){
_4c.push(_4d);
}
return _4c;
},_processData:function(_4f){
this._getArrayOfArraysFromCsvFileContents(_4f);
this._arrayOfAllItems=[];
if(this.identifier){
if(this._attributeIndexes[this.identifier]===undefined){
throw new Error(this.declaredClass+": Identity specified is not a column header in the data set.");
}
}
for(var i=0;i<this._dataArray.length;i++){
var id=i;
if(this.identifier){
var _50=this._dataArray[i];
id=_50[this._attributeIndexes[this.identifier]];
this._idMap[id]=i;
}
this._arrayOfAllItems.push(this._createItemFromIdentity(id));
}
this._loadFinished=true;
this._loadInProgress=false;
},_createItemFromIdentity:function(_51){
var _52={};
_52[this._storeProp]=this;
_52[this._idProp]=_51;
return _52;
},getIdentity:function(_53){
if(this.isItem(_53)){
return _53[this._idProp];
}
return null;
},fetchItemByIdentity:function(_54){
var _55;
var _56=_54.scope?_54.scope:_1.global;
if(!this._loadFinished){
var _57=this;
if(this.url!==""){
if(this._loadInProgress){
this._queuedFetches.push({args:_54});
}else{
this._loadInProgress=true;
var _58={url:_57.url,handleAs:"text"};
var _59=_1.xhrGet(_58);
_59.addCallback(function(_5a){
try{
_57._processData(_5a);
var _5b=_57._createItemFromIdentity(_54.identity);
if(!_57.isItem(_5b)){
_5b=null;
}
if(_54.onItem){
_54.onItem.call(_56,_5b);
}
_57._handleQueuedFetches();
}
catch(error){
if(_54.onError){
_54.onError.call(_56,error);
}
}
});
_59.addErrback(function(_5c){
this._loadInProgress=false;
if(_54.onError){
_54.onError.call(_56,_5c);
}
});
}
}else{
if(this._csvData){
try{
_57._processData(_57._csvData);
_57._csvData=null;
_55=_57._createItemFromIdentity(_54.identity);
if(!_57.isItem(_55)){
_55=null;
}
if(_54.onItem){
_54.onItem.call(_56,_55);
}
}
catch(e){
if(_54.onError){
_54.onError.call(_56,e);
}
}
}
}
}else{
_55=this._createItemFromIdentity(_54.identity);
if(!this.isItem(_55)){
_55=null;
}
if(_54.onItem){
_54.onItem.call(_56,_55);
}
}
},getIdentityAttributes:function(_5d){
if(this.identifier){
return [this.identifier];
}else{
return null;
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _5e=this._queuedFetches[i];
var _5f=_5e.filter;
var _60=_5e.args;
if(_5f){
_5f(_60,this._arrayOfAllItems);
}else{
this.fetchItemByIdentity(_5e.args);
}
}
this._queuedFetches=[];
}
}});
_1.extend(_2.data.CsvStore,_1.data.util.simpleFetch);
return _2.data.CsvStore;
});
