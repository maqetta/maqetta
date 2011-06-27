/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/AndOrReadStore",["dojo","dojox","dojo/data/util/filter","dojo/data/util/simpleFetch","dojo/date/stamp"],function(_1,_2){
_1.declare("dojox.data.AndOrReadStore",null,{constructor:function(_3){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_3.url;
this._ccUrl=_3.url;
this.url=_3.url;
this._jsonData=_3.data;
this.data=null;
this._datatypeMap=_3.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_4){
return _1.date.stamp.fromISOString(_4);
}};
}
this._features={"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
this._itemsByIdentity=null;
this._storeRefPropName="_S";
this._itemNumPropName="_0";
this._rootItemPropName="_RI";
this._reverseRefMap="_RRM";
this._loadInProgress=false;
this._queuedFetches=[];
if(_3.urlPreventCache!==undefined){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
if(_3.hierarchical!==undefined){
this.hierarchical=_3.hierarchical?true:false;
}
if(_3.clearOnClose){
this.clearOnClose=true;
}
},url:"",_ccUrl:"",data:null,typeMap:null,clearOnClose:false,urlPreventCache:false,hierarchical:true,_assertIsItem:function(_5){
if(!this.isItem(_5)){
throw new Error("dojox.data.AndOrReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_6){
if(typeof _6!=="string"){
throw new Error("dojox.data.AndOrReadStore: Invalid attribute argument.");
}
},getValue:function(_7,_8,_9){
var _a=this.getValues(_7,_8);
return (_a.length>0)?_a[0]:_9;
},getValues:function(_b,_c){
this._assertIsItem(_b);
this._assertIsAttribute(_c);
var _d=_b[_c]||[];
return _d.slice(0,_d.length);
},getAttributes:function(_e){
this._assertIsItem(_e);
var _f=[];
for(var key in _e){
if((key!==this._storeRefPropName)&&(key!==this._itemNumPropName)&&(key!==this._rootItemPropName)&&(key!==this._reverseRefMap)){
_f.push(key);
}
}
return _f;
},hasAttribute:function(_10,_11){
this._assertIsItem(_10);
this._assertIsAttribute(_11);
return (_11 in _10);
},containsValue:function(_12,_13,_14){
var _15=undefined;
if(typeof _14==="string"){
_15=_1.data.util.filter.patternToRegExp(_14,false);
}
return this._containsValue(_12,_13,_14,_15);
},_containsValue:function(_16,_17,_18,_19){
return _1.some(this.getValues(_16,_17),function(_1a){
if(_1a!==null&&!_1.isObject(_1a)&&_19){
if(_1a.toString().match(_19)){
return true;
}
}else{
if(_18===_1a){
return true;
}
}
});
},isItem:function(_1b){
if(_1b&&_1b[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_1b[this._itemNumPropName]]===_1b){
return true;
}
}
return false;
},isItemLoaded:function(_1c){
return this.isItem(_1c);
},loadItem:function(_1d){
this._assertIsItem(_1d.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_1e){
if(this._labelAttr&&this.isItem(_1e)){
return this.getValue(_1e,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_1f){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_20,_21,_22){
var _23=this;
var _24=function(_25,_26){
var _27=[];
if(_25.query){
var _28=_1.fromJson(_1.toJson(_25.query));
if(typeof _28=="object"){
var _29=0;
var p;
for(p in _28){
_29++;
}
if(_29>1&&_28.complexQuery){
var cq=_28.complexQuery;
var _2a=false;
for(p in _28){
if(p!=="complexQuery"){
if(!_2a){
cq="( "+cq+" )";
_2a=true;
}
var v=_25.query[p];
if(_1.isString(v)){
v="'"+v+"'";
}
cq+=" AND "+p+":"+v;
delete _28[p];
}
}
_28.complexQuery=cq;
}
}
var _2b=_25.queryOptions?_25.queryOptions.ignoreCase:false;
if(typeof _28!="string"){
_28=_1.toJson(_28);
_28=_28.replace(/\\\\/g,"\\");
}
_28=_28.replace(/\\"/g,"\"");
var _2c=_1.trim(_28.replace(/{|}/g,""));
var _2d,i;
if(_2c.match(/"? *complexQuery *"?:/)){
_2c=_1.trim(_2c.replace(/"?\s*complexQuery\s*"?:/,""));
var _2e=["'","\""];
var _2f,_30;
var _31=false;
for(i=0;i<_2e.length;i++){
_2f=_2c.indexOf(_2e[i]);
_2d=_2c.indexOf(_2e[i],1);
_30=_2c.indexOf(":",1);
if(_2f===0&&_2d!=-1&&_30<_2d){
_31=true;
break;
}
}
if(_31){
_2c=_2c.replace(/^\"|^\'|\"$|\'$/g,"");
}
}
var _32=_2c;
var _33=/^,|^NOT |^AND |^OR |^\(|^\)|^!|^&&|^\|\|/i;
var _34="";
var op="";
var val="";
var pos=-1;
var err=false;
var key="";
var _35="";
var tok="";
_2d=-1;
for(i=0;i<_26.length;++i){
var _36=true;
var _37=_26[i];
if(_37===null){
_36=false;
}else{
_2c=_32;
_34="";
while(_2c.length>0&&!err){
op=_2c.match(_33);
while(op&&!err){
_2c=_1.trim(_2c.replace(op[0],""));
op=_1.trim(op[0]).toUpperCase();
op=op=="NOT"?"!":op=="AND"||op==","?"&&":op=="OR"?"||":op;
op=" "+op+" ";
_34+=op;
op=_2c.match(_33);
}
if(_2c.length>0){
pos=_2c.indexOf(":");
if(pos==-1){
err=true;
break;
}else{
key=_1.trim(_2c.substring(0,pos).replace(/\"|\'/g,""));
_2c=_1.trim(_2c.substring(pos+1));
tok=_2c.match(/^\'|^\"/);
if(tok){
tok=tok[0];
pos=_2c.indexOf(tok);
_2d=_2c.indexOf(tok,pos+1);
if(_2d==-1){
err=true;
break;
}
_35=_2c.substring(pos+1,_2d);
if(_2d==_2c.length-1){
_2c="";
}else{
_2c=_1.trim(_2c.substring(_2d+1));
}
_34+=_23._containsValue(_37,key,_35,_1.data.util.filter.patternToRegExp(_35,_2b));
}else{
tok=_2c.match(/\s|\)|,/);
if(tok){
var _38=new Array(tok.length);
for(var j=0;j<tok.length;j++){
_38[j]=_2c.indexOf(tok[j]);
}
pos=_38[0];
if(_38.length>1){
for(var j=1;j<_38.length;j++){
pos=Math.min(pos,_38[j]);
}
}
_35=_1.trim(_2c.substring(0,pos));
_2c=_1.trim(_2c.substring(pos));
}else{
_35=_1.trim(_2c);
_2c="";
}
_34+=_23._containsValue(_37,key,_35,_1.data.util.filter.patternToRegExp(_35,_2b));
}
}
}
}
_36=eval(_34);
}
if(_36){
_27.push(_37);
}
}
if(err){
_27=[];
}
_21(_27,_25);
}else{
for(var i=0;i<_26.length;++i){
var _39=_26[i];
if(_39!==null){
_27.push(_39);
}
}
_21(_27,_25);
}
};
if(this._loadFinished){
_24(_20,this._getItemsArray(_20.queryOptions));
}else{
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojox.data.AndOrReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null&&this._jsonData==null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_20,filter:_24});
}else{
this._loadInProgress=true;
var _3a={url:_23._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _3b=_1.xhrGet(_3a);
_3b.addCallback(function(_3c){
try{
_23._getItemsFromLoadedData(_3c);
_23._loadFinished=true;
_23._loadInProgress=false;
_24(_20,_23._getItemsArray(_20.queryOptions));
_23._handleQueuedFetches();
}
catch(e){
_23._loadFinished=true;
_23._loadInProgress=false;
_22(e,_20);
}
});
_3b.addErrback(function(_3d){
_23._loadInProgress=false;
_22(_3d,_20);
});
var _3e=null;
if(_20.abort){
_3e=_20.abort;
}
_20.abort=function(){
var df=_3b;
if(df&&df.fired===-1){
df.cancel();
df=null;
}
if(_3e){
_3e.call(_20);
}
};
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_24(_20,this._getItemsArray(_20.queryOptions));
}
catch(e){
_22(e,_20);
}
}else{
_22(new Error("dojox.data.AndOrReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_20);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _3f=this._queuedFetches[i];
var _40=_3f.args;
var _41=_3f.filter;
if(_41){
_41(_40,this._getItemsArray(_40.queryOptions));
}else{
this.fetchItemByIdentity(_40);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_42){
if(_42&&_42.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_43){
if(this.clearOnClose&&this._loadFinished&&!this._loadInProgress){
if(((this._jsonFileUrl==""||this._jsonFileUrl==null)&&(this.url==""||this.url==null))&&this.data==null){
}
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._itemsByIdentity=null;
this._loadInProgress=false;
this._queuedFetches=[];
}
},_getItemsFromLoadedData:function(_44){
var _45=this;
function _46(_47){
var _48=((_47!==null)&&(typeof _47==="object")&&(!_1.isArray(_47))&&(!_1.isFunction(_47))&&(_47.constructor==Object)&&(typeof _47._reference==="undefined")&&(typeof _47._type==="undefined")&&(typeof _47._value==="undefined")&&_45.hierarchical);
return _48;
};
function _49(_4a){
_45._arrayOfAllItems.push(_4a);
for(var _4b in _4a){
var _4c=_4a[_4b];
if(_4c){
if(_1.isArray(_4c)){
var _4d=_4c;
for(var k=0;k<_4d.length;++k){
var _4e=_4d[k];
if(_46(_4e)){
_49(_4e);
}
}
}else{
if(_46(_4c)){
_49(_4c);
}
}
}
}
};
this._labelAttr=_44.label;
var i;
var _4f;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_44.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_4f=this._arrayOfTopLevelItems[i];
_49(_4f);
_4f[this._rootItemPropName]=true;
}
var _50={};
var key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_4f=this._arrayOfAllItems[i];
for(key in _4f){
if(key!==this._rootItemPropName){
var _51=_4f[key];
if(_51!==null){
if(!_1.isArray(_51)){
_4f[key]=[_51];
}
}else{
_4f[key]=[null];
}
}
_50[key]=key;
}
}
while(_50[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_50[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_50[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _52;
var _53=_44.identifier;
if(_53){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_53;
for(i=0;i<this._arrayOfAllItems.length;++i){
_4f=this._arrayOfAllItems[i];
_52=_4f[_53];
var _54=_52[0];
if(!this._itemsByIdentity[_54]){
this._itemsByIdentity[_54]=_4f;
}else{
if(this._jsonFileUrl){
throw new Error("dojox.data.AndOrReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_53+"].  Value collided: ["+_54+"]");
}else{
if(this._jsonData){
throw new Error("dojox.data.AndOrReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_53+"].  Value collided: ["+_54+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_4f=this._arrayOfAllItems[i];
_4f[this._storeRefPropName]=this;
_4f[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_4f=this._arrayOfAllItems[i];
for(key in _4f){
_52=_4f[key];
for(var j=0;j<_52.length;++j){
_51=_52[j];
if(_51!==null&&typeof _51=="object"){
if(("_type" in _51)&&("_value" in _51)){
var _55=_51._type;
var _56=this._datatypeMap[_55];
if(!_56){
throw new Error("dojox.data.AndOrReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_55+"'");
}else{
if(_1.isFunction(_56)){
_52[j]=new _56(_51._value);
}else{
if(_1.isFunction(_56.deserialize)){
_52[j]=_56.deserialize(_51._value);
}else{
throw new Error("dojox.data.AndOrReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_51._reference){
var _57=_51._reference;
if(!_1.isObject(_57)){
_52[j]=this._getItemByIdentity(_57);
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _58=this._arrayOfAllItems[k];
var _59=true;
for(var _5a in _57){
if(_58[_5a]!=_57[_5a]){
_59=false;
}
}
if(_59){
_52[j]=_58;
}
}
}
if(this.referenceIntegrity){
var _5b=_52[j];
if(this.isItem(_5b)){
this._addReferenceToMap(_5b,_4f,key);
}
}
}else{
if(this.isItem(_51)){
if(this.referenceIntegrity){
this._addReferenceToMap(_51,_4f,key);
}
}
}
}
}
}
}
},_addReferenceToMap:function(_5c,_5d,_5e){
},getIdentity:function(_5f){
var _60=this._features["dojo.data.api.Identity"];
if(_60===Number){
return _5f[this._itemNumPropName];
}else{
var _61=_5f[_60];
if(_61){
return _61[0];
}
}
return null;
},fetchItemByIdentity:function(_62){
if(!this._loadFinished){
var _63=this;
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojox.data.AndOrReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null&&this._jsonData==null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_62});
}else{
this._loadInProgress=true;
var _64={url:_63._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _65=_1.xhrGet(_64);
_65.addCallback(function(_66){
var _67=_62.scope?_62.scope:_1.global;
try{
_63._getItemsFromLoadedData(_66);
_63._loadFinished=true;
_63._loadInProgress=false;
var _68=_63._getItemByIdentity(_62.identity);
if(_62.onItem){
_62.onItem.call(_67,_68);
}
_63._handleQueuedFetches();
}
catch(error){
_63._loadInProgress=false;
if(_62.onError){
_62.onError.call(_67,error);
}
}
});
_65.addErrback(function(_69){
_63._loadInProgress=false;
if(_62.onError){
var _6a=_62.scope?_62.scope:_1.global;
_62.onError.call(_6a,_69);
}
});
}
}else{
if(this._jsonData){
_63._getItemsFromLoadedData(_63._jsonData);
_63._jsonData=null;
_63._loadFinished=true;
var _6b=_63._getItemByIdentity(_62.identity);
if(_62.onItem){
var _6c=_62.scope?_62.scope:_1.global;
_62.onItem.call(_6c,_6b);
}
}
}
}else{
var _6b=this._getItemByIdentity(_62.identity);
if(_62.onItem){
var _6c=_62.scope?_62.scope:_1.global;
_62.onItem.call(_6c,_6b);
}
}
},_getItemByIdentity:function(_6d){
var _6e=null;
if(this._itemsByIdentity){
_6e=this._itemsByIdentity[_6d];
}else{
_6e=this._arrayOfAllItems[_6d];
}
if(_6e===undefined){
_6e=null;
}
return _6e;
},getIdentityAttributes:function(_6f){
var _70=this._features["dojo.data.api.Identity"];
if(_70===Number){
return null;
}else{
return [_70];
}
},_forceLoad:function(){
var _71=this;
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojox.data.AndOrReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null&&this._jsonData==null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
var _72={url:_71._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,sync:true};
var _73=_1.xhrGet(_72);
_73.addCallback(function(_74){
try{
if(_71._loadInProgress!==true&&!_71._loadFinished){
_71._getItemsFromLoadedData(_74);
_71._loadFinished=true;
}else{
if(_71._loadInProgress){
throw new Error("dojox.data.AndOrReadStore:  Unable to perform a synchronous load, an async load is in progress.");
}
}
}
catch(e){
throw e;
}
});
_73.addErrback(function(_75){
throw _75;
});
}else{
if(this._jsonData){
_71._getItemsFromLoadedData(_71._jsonData);
_71._jsonData=null;
_71._loadFinished=true;
}
}
}});
_1.extend(_2.data.AndOrReadStore,_1.data.util.simpleFetch);
return _2.data.AndOrReadStore;
});
