/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/ItemFileReadStore",["../main","./util/filter","./util/simpleFetch","../date/stamp"],function(_1){
_1.declare("dojo.data.ItemFileReadStore",null,{constructor:function(_2){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_2.url;
this._ccUrl=_2.url;
this.url=_2.url;
this._jsonData=_2.data;
this.data=null;
this._datatypeMap=_2.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_3){
return _1.date.stamp.fromISOString(_3);
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
if(_2.urlPreventCache!==undefined){
this.urlPreventCache=_2.urlPreventCache?true:false;
}
if(_2.hierarchical!==undefined){
this.hierarchical=_2.hierarchical?true:false;
}
if(_2.clearOnClose){
this.clearOnClose=true;
}
if("failOk" in _2){
this.failOk=_2.failOk?true:false;
}
},url:"",_ccUrl:"",data:null,typeMap:null,clearOnClose:false,urlPreventCache:false,failOk:false,hierarchical:true,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_5){
if(typeof _5!=="string"){
throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.");
}
},getValue:function(_6,_7,_8){
var _9=this.getValues(_6,_7);
return (_9.length>0)?_9[0]:_8;
},getValues:function(_a,_b){
this._assertIsItem(_a);
this._assertIsAttribute(_b);
return (_a[_b]||[]).slice(0);
},getAttributes:function(_c){
this._assertIsItem(_c);
var _d=[];
for(var _e in _c){
if((_e!==this._storeRefPropName)&&(_e!==this._itemNumPropName)&&(_e!==this._rootItemPropName)&&(_e!==this._reverseRefMap)){
_d.push(_e);
}
}
return _d;
},hasAttribute:function(_f,_10){
this._assertIsItem(_f);
this._assertIsAttribute(_10);
return (_10 in _f);
},containsValue:function(_11,_12,_13){
var _14=undefined;
if(typeof _13==="string"){
_14=_1.data.util.filter.patternToRegExp(_13,false);
}
return this._containsValue(_11,_12,_13,_14);
},_containsValue:function(_15,_16,_17,_18){
return _1.some(this.getValues(_15,_16),function(_19){
if(_19!==null&&!_1.isObject(_19)&&_18){
if(_19.toString().match(_18)){
return true;
}
}else{
if(_17===_19){
return true;
}
}
});
},isItem:function(_1a){
if(_1a&&_1a[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_1a[this._itemNumPropName]]===_1a){
return true;
}
}
return false;
},isItemLoaded:function(_1b){
return this.isItem(_1b);
},loadItem:function(_1c){
this._assertIsItem(_1c.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_1d){
if(this._labelAttr&&this.isItem(_1d)){
return this.getValue(_1d,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_1e){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_1f,_20,_21){
var _22=this,_23=function(_24,_25){
var _26=[],i,key;
if(_24.query){
var _27,_28=_24.queryOptions?_24.queryOptions.ignoreCase:false;
var _29={};
for(key in _24.query){
_27=_24.query[key];
if(typeof _27==="string"){
_29[key]=_1.data.util.filter.patternToRegExp(_27,_28);
}else{
if(_27 instanceof RegExp){
_29[key]=_27;
}
}
}
for(i=0;i<_25.length;++i){
var _2a=true;
var _2b=_25[i];
if(_2b===null){
_2a=false;
}else{
for(key in _24.query){
_27=_24.query[key];
if(!_22._containsValue(_2b,key,_27,_29[key])){
_2a=false;
}
}
}
if(_2a){
_26.push(_2b);
}
}
_20(_26,_24);
}else{
for(i=0;i<_25.length;++i){
var _2c=_25[i];
if(_2c!==null){
_26.push(_2c);
}
}
_20(_26,_24);
}
};
if(this._loadFinished){
_23(_1f,this._getItemsArray(_1f.queryOptions));
}else{
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_1f,filter:_23});
}else{
this._loadInProgress=true;
var _2d={url:_22._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk};
var _2e=_1.xhrGet(_2d);
_2e.addCallback(function(_2f){
try{
_22._getItemsFromLoadedData(_2f);
_22._loadFinished=true;
_22._loadInProgress=false;
_23(_1f,_22._getItemsArray(_1f.queryOptions));
_22._handleQueuedFetches();
}
catch(e){
_22._loadFinished=true;
_22._loadInProgress=false;
_21(e,_1f);
}
});
_2e.addErrback(function(_30){
_22._loadInProgress=false;
_21(_30,_1f);
});
var _31=null;
if(_1f.abort){
_31=_1f.abort;
}
_1f.abort=function(){
var df=_2e;
if(df&&df.fired===-1){
df.cancel();
df=null;
}
if(_31){
_31.call(_1f);
}
};
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_23(_1f,this._getItemsArray(_1f.queryOptions));
}
catch(e){
_21(e,_1f);
}
}else{
_21(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_1f);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _32=this._queuedFetches[i],_33=_32.args,_34=_32.filter;
if(_34){
_34(_33,this._getItemsArray(_33.queryOptions));
}else{
this.fetchItemByIdentity(_33);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_35){
if(_35&&_35.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_36){
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
},_getItemsFromLoadedData:function(_37){
var _38=false,_39=this;
function _3a(_3b){
return (_3b!==null)&&(typeof _3b==="object")&&(!_1.isArray(_3b)||_38)&&(!_1.isFunction(_3b))&&(_3b.constructor==Object||_1.isArray(_3b))&&(typeof _3b._reference==="undefined")&&(typeof _3b._type==="undefined")&&(typeof _3b._value==="undefined")&&_39.hierarchical;
};
function _3c(_3d){
_39._arrayOfAllItems.push(_3d);
for(var _3e in _3d){
var _3f=_3d[_3e];
if(_3f){
if(_1.isArray(_3f)){
var _40=_3f;
for(var k=0;k<_40.length;++k){
var _41=_40[k];
if(_3a(_41)){
_3c(_41);
}
}
}else{
if(_3a(_3f)){
_3c(_3f);
}
}
}
}
};
this._labelAttr=_37.label;
var i,_42;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_37.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_42=this._arrayOfTopLevelItems[i];
if(_1.isArray(_42)){
_38=true;
}
_3c(_42);
_42[this._rootItemPropName]=true;
}
var _43={},key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_42=this._arrayOfAllItems[i];
for(key in _42){
if(key!==this._rootItemPropName){
var _44=_42[key];
if(_44!==null){
if(!_1.isArray(_44)){
_42[key]=[_44];
}
}else{
_42[key]=[null];
}
}
_43[key]=key;
}
}
while(_43[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_43[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_43[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _45;
var _46=_37.identifier;
if(_46){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_46;
for(i=0;i<this._arrayOfAllItems.length;++i){
_42=this._arrayOfAllItems[i];
_45=_42[_46];
var _47=_45[0];
if(!Object.hasOwnProperty.call(this._itemsByIdentity,_47)){
this._itemsByIdentity[_47]=_42;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_46+"].  Value collided: ["+_47+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_46+"].  Value collided: ["+_47+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_42=this._arrayOfAllItems[i];
_42[this._storeRefPropName]=this;
_42[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_42=this._arrayOfAllItems[i];
for(key in _42){
_45=_42[key];
for(var j=0;j<_45.length;++j){
_44=_45[j];
if(_44!==null&&typeof _44=="object"){
if(("_type" in _44)&&("_value" in _44)){
var _48=_44._type;
var _49=this._datatypeMap[_48];
if(!_49){
throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_48+"'");
}else{
if(_1.isFunction(_49)){
_45[j]=new _49(_44._value);
}else{
if(_1.isFunction(_49.deserialize)){
_45[j]=_49.deserialize(_44._value);
}else{
throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_44._reference){
var _4a=_44._reference;
if(!_1.isObject(_4a)){
_45[j]=this._getItemByIdentity(_4a);
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _4b=this._arrayOfAllItems[k],_4c=true;
for(var _4d in _4a){
if(_4b[_4d]!=_4a[_4d]){
_4c=false;
}
}
if(_4c){
_45[j]=_4b;
}
}
}
if(this.referenceIntegrity){
var _4e=_45[j];
if(this.isItem(_4e)){
this._addReferenceToMap(_4e,_42,key);
}
}
}else{
if(this.isItem(_44)){
if(this.referenceIntegrity){
this._addReferenceToMap(_44,_42,key);
}
}
}
}
}
}
}
},_addReferenceToMap:function(_4f,_50,_51){
},getIdentity:function(_52){
var _53=this._features["dojo.data.api.Identity"];
if(_53===Number){
return _52[this._itemNumPropName];
}else{
var _54=_52[_53];
if(_54){
return _54[0];
}
}
return null;
},fetchItemByIdentity:function(_55){
var _56,_57;
if(!this._loadFinished){
var _58=this;
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
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
this._queuedFetches.push({args:_55});
}else{
this._loadInProgress=true;
var _59={url:_58._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk};
var _5a=_1.xhrGet(_59);
_5a.addCallback(function(_5b){
var _5c=_55.scope?_55.scope:_1.global;
try{
_58._getItemsFromLoadedData(_5b);
_58._loadFinished=true;
_58._loadInProgress=false;
_56=_58._getItemByIdentity(_55.identity);
if(_55.onItem){
_55.onItem.call(_5c,_56);
}
_58._handleQueuedFetches();
}
catch(error){
_58._loadInProgress=false;
if(_55.onError){
_55.onError.call(_5c,error);
}
}
});
_5a.addErrback(function(_5d){
_58._loadInProgress=false;
if(_55.onError){
var _5e=_55.scope?_55.scope:_1.global;
_55.onError.call(_5e,_5d);
}
});
}
}else{
if(this._jsonData){
_58._getItemsFromLoadedData(_58._jsonData);
_58._jsonData=null;
_58._loadFinished=true;
_56=_58._getItemByIdentity(_55.identity);
if(_55.onItem){
_57=_55.scope?_55.scope:_1.global;
_55.onItem.call(_57,_56);
}
}
}
}else{
_56=this._getItemByIdentity(_55.identity);
if(_55.onItem){
_57=_55.scope?_55.scope:_1.global;
_55.onItem.call(_57,_56);
}
}
},_getItemByIdentity:function(_5f){
var _60=null;
if(this._itemsByIdentity&&Object.hasOwnProperty.call(this._itemsByIdentity,_5f)){
_60=this._itemsByIdentity[_5f];
}else{
if(Object.hasOwnProperty.call(this._arrayOfAllItems,_5f)){
_60=this._arrayOfAllItems[_5f];
}
}
if(_60===undefined){
_60=null;
}
return _60;
},getIdentityAttributes:function(_61){
var _62=this._features["dojo.data.api.Identity"];
if(_62===Number){
return null;
}else{
return [_62];
}
},_forceLoad:function(){
var _63=this;
if(this._jsonFileUrl!==this._ccUrl){
_1.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
var _64={url:this._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk,sync:true};
var _65=_1.xhrGet(_64);
_65.addCallback(function(_66){
try{
if(_63._loadInProgress!==true&&!_63._loadFinished){
_63._getItemsFromLoadedData(_66);
_63._loadFinished=true;
}else{
if(_63._loadInProgress){
throw new Error("dojo.data.ItemFileReadStore:  Unable to perform a synchronous load, an async load is in progress.");
}
}
}
catch(e){
throw e;
}
});
_65.addErrback(function(_67){
throw _67;
});
}else{
if(this._jsonData){
_63._getItemsFromLoadedData(_63._jsonData);
_63._jsonData=null;
_63._loadFinished=true;
}
}
}});
_1.extend(_1.data.ItemFileReadStore,_1.data.util.simpleFetch);
return _1.data.ItemFileReadStore;
});
