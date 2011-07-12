/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/AndOrWriteStore",["dojo","dojox","dojox/data/AndOrReadStore"],function(_1,_2){
_1.declare("dojox.data.AndOrWriteStore",_2.data.AndOrReadStore,{constructor:function(_3){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(_4){
return _1.date.stamp.toISOString(_4,{zulu:true});
};
}
if(_3&&(_3.referenceIntegrity===false)){
this.referenceIntegrity=false;
}
this._saveInProgress=false;
},referenceIntegrity:true,_assert:function(_5){
if(!_5){
throw new Error("assertion failed in ItemFileWriteStore");
}
},_getIdentifierAttribute:function(){
var _6=this.getFeatures()["dojo.data.api.Identity"];
return _6;
},newItem:function(_7,_8){
this._assert(!this._saveInProgress);
if(!this._loadFinished){
this._forceLoad();
}
if(typeof _7!="object"&&typeof _7!="undefined"){
throw new Error("newItem() was passed something other than an object");
}
var _9=null;
var _a=this._getIdentifierAttribute();
if(_a===Number){
_9=this._arrayOfAllItems.length;
}else{
_9=_7[_a];
if(typeof _9==="undefined"){
throw new Error("newItem() was not passed an identity for the new item");
}
if(_1.isArray(_9)){
throw new Error("newItem() was not passed an single-valued identity");
}
}
if(this._itemsByIdentity){
this._assert(typeof this._itemsByIdentity[_9]==="undefined");
}
this._assert(typeof this._pending._newItems[_9]==="undefined");
this._assert(typeof this._pending._deletedItems[_9]==="undefined");
var _b={};
_b[this._storeRefPropName]=this;
_b[this._itemNumPropName]=this._arrayOfAllItems.length;
if(this._itemsByIdentity){
this._itemsByIdentity[_9]=_b;
_b[_a]=[_9];
}
this._arrayOfAllItems.push(_b);
var _c=null;
if(_8&&_8.parent&&_8.attribute){
_c={item:_8.parent,attribute:_8.attribute,oldValue:undefined};
var _d=this.getValues(_8.parent,_8.attribute);
if(_d&&_d.length>0){
var _e=_d.slice(0,_d.length);
if(_d.length===1){
_c.oldValue=_d[0];
}else{
_c.oldValue=_d.slice(0,_d.length);
}
_e.push(_b);
this._setValueOrValues(_8.parent,_8.attribute,_e,false);
_c.newValue=this.getValues(_8.parent,_8.attribute);
}else{
this._setValueOrValues(_8.parent,_8.attribute,_b,false);
_c.newValue=_b;
}
}else{
_b[this._rootItemPropName]=true;
this._arrayOfTopLevelItems.push(_b);
}
this._pending._newItems[_9]=_b;
for(var _f in _7){
if(_f===this._storeRefPropName||_f===this._itemNumPropName){
throw new Error("encountered bug in ItemFileWriteStore.newItem");
}
var _10=_7[_f];
if(!_1.isArray(_10)){
_10=[_10];
}
_b[_f]=_10;
if(this.referenceIntegrity){
for(var i=0;i<_10.length;i++){
var val=_10[i];
if(this.isItem(val)){
this._addReferenceToMap(val,_b,_f);
}
}
}
}
this.onNew(_b,_c);
return _b;
},_removeArrayElement:function(_11,_12){
var _13=_1.indexOf(_11,_12);
if(_13!=-1){
_11.splice(_13,1);
return true;
}
return false;
},deleteItem:function(_14){
this._assert(!this._saveInProgress);
this._assertIsItem(_14);
var _15=_14[this._itemNumPropName];
var _16=this.getIdentity(_14);
if(this.referenceIntegrity){
var _17=this.getAttributes(_14);
if(_14[this._reverseRefMap]){
_14["backup_"+this._reverseRefMap]=_1.clone(_14[this._reverseRefMap]);
}
_1.forEach(_17,function(_18){
_1.forEach(this.getValues(_14,_18),function(_19){
if(this.isItem(_19)){
if(!_14["backupRefs_"+this._reverseRefMap]){
_14["backupRefs_"+this._reverseRefMap]=[];
}
_14["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_19),attr:_18});
this._removeReferenceFromMap(_19,_14,_18);
}
},this);
},this);
var _1a=_14[this._reverseRefMap];
if(_1a){
for(var _1b in _1a){
var _1c=null;
if(this._itemsByIdentity){
_1c=this._itemsByIdentity[_1b];
}else{
_1c=this._arrayOfAllItems[_1b];
}
if(_1c){
for(var _1d in _1a[_1b]){
var _1e=this.getValues(_1c,_1d)||[];
var _1f=_1.filter(_1e,function(_20){
return !(this.isItem(_20)&&this.getIdentity(_20)==_16);
},this);
this._removeReferenceFromMap(_14,_1c,_1d);
if(_1f.length<_1e.length){
this._setValueOrValues(_1c,_1d,_1f);
}
}
}
}
}
}
this._arrayOfAllItems[_15]=null;
_14[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_16];
}
this._pending._deletedItems[_16]=_14;
if(_14[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_14);
}
this.onDelete(_14);
return true;
},setValue:function(_21,_22,_23){
return this._setValueOrValues(_21,_22,_23,true);
},setValues:function(_24,_25,_26){
return this._setValueOrValues(_24,_25,_26,true);
},unsetAttribute:function(_27,_28){
return this._setValueOrValues(_27,_28,[],true);
},_setValueOrValues:function(_29,_2a,_2b,_2c){
this._assert(!this._saveInProgress);
this._assertIsItem(_29);
this._assert(_1.isString(_2a));
this._assert(typeof _2b!=="undefined");
var _2d=this._getIdentifierAttribute();
if(_2a==_2d){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _2e=this._getValueOrValues(_29,_2a);
var _2f=this.getIdentity(_29);
if(!this._pending._modifiedItems[_2f]){
var _30={};
for(var key in _29){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_30[key]=_29[key];
}else{
if(key===this._reverseRefMap){
_30[key]=_1.clone(_29[key]);
}else{
_30[key]=_29[key].slice(0,_29[key].length);
}
}
}
this._pending._modifiedItems[_2f]=_30;
}
var _31=false;
if(_1.isArray(_2b)&&_2b.length===0){
_31=delete _29[_2a];
_2b=undefined;
if(this.referenceIntegrity&&_2e){
var _32=_2e;
if(!_1.isArray(_32)){
_32=[_32];
}
for(var i=0;i<_32.length;i++){
var _33=_32[i];
if(this.isItem(_33)){
this._removeReferenceFromMap(_33,_29,_2a);
}
}
}
}else{
var _34;
if(_1.isArray(_2b)){
var _35=_2b;
_34=_2b.slice(0,_2b.length);
}else{
_34=[_2b];
}
if(this.referenceIntegrity){
if(_2e){
var _32=_2e;
if(!_1.isArray(_32)){
_32=[_32];
}
var map={};
_1.forEach(_32,function(_36){
if(this.isItem(_36)){
var id=this.getIdentity(_36);
map[id.toString()]=true;
}
},this);
_1.forEach(_34,function(_37){
if(this.isItem(_37)){
var id=this.getIdentity(_37);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_37,_29,_2a);
}
}
},this);
for(var rId in map){
var _38;
if(this._itemsByIdentity){
_38=this._itemsByIdentity[rId];
}else{
_38=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_38,_29,_2a);
}
}else{
for(var i=0;i<_34.length;i++){
var _33=_34[i];
if(this.isItem(_33)){
this._addReferenceToMap(_33,_29,_2a);
}
}
}
}
_29[_2a]=_34;
_31=true;
}
if(_2c){
this.onSet(_29,_2a,_2e,_2b);
}
return _31;
},_addReferenceToMap:function(_39,_3a,_3b){
var _3c=this.getIdentity(_3a);
var _3d=_39[this._reverseRefMap];
if(!_3d){
_3d=_39[this._reverseRefMap]={};
}
var _3e=_3d[_3c];
if(!_3e){
_3e=_3d[_3c]={};
}
_3e[_3b]=true;
},_removeReferenceFromMap:function(_3f,_40,_41){
var _42=this.getIdentity(_40);
var _43=_3f[this._reverseRefMap];
var _44;
if(_43){
for(_44 in _43){
if(_44==_42){
delete _43[_44][_41];
if(this._isEmpty(_43[_44])){
delete _43[_44];
}
}
}
if(this._isEmpty(_43)){
delete _3f[this._reverseRefMap];
}
}
},_dumpReferenceMap:function(){
var i;
for(i=0;i<this._arrayOfAllItems.length;i++){
var _45=this._arrayOfAllItems[i];
if(_45&&_45[this._reverseRefMap]){
}
}
},_getValueOrValues:function(_46,_47){
var _48=undefined;
if(this.hasAttribute(_46,_47)){
var _49=this.getValues(_46,_47);
if(_49.length==1){
_48=_49[0];
}else{
_48=_49;
}
}
return _48;
},_flatten:function(_4a){
if(this.isItem(_4a)){
var _4b=_4a;
var _4c=this.getIdentity(_4b);
var _4d={_reference:_4c};
return _4d;
}else{
if(typeof _4a==="object"){
for(var _4e in this._datatypeMap){
var _4f=this._datatypeMap[_4e];
if(_1.isObject(_4f)&&!_1.isFunction(_4f)){
if(_4a instanceof _4f.type){
if(!_4f.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+_4e+"]");
}
return {_type:_4e,_value:_4f.serialize(_4a)};
}
}else{
if(_4a instanceof _4f){
return {_type:_4e,_value:_4a.toString()};
}
}
}
}
return _4a;
}
},_getNewFileContentString:function(){
var _50={};
var _51=this._getIdentifierAttribute();
if(_51!==Number){
_50.identifier=_51;
}
if(this._labelAttr){
_50.label=this._labelAttr;
}
_50.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var _52=this._arrayOfAllItems[i];
if(_52!==null){
var _53={};
for(var key in _52){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName&&key!==this._reverseRefMap&&key!==this._rootItemPropName){
var _54=key;
var _55=this.getValues(_52,_54);
if(_55.length==1){
_53[_54]=this._flatten(_55[0]);
}else{
var _56=[];
for(var j=0;j<_55.length;++j){
_56.push(this._flatten(_55[j]));
_53[_54]=_56;
}
}
}
}
_50.items.push(_53);
}
}
var _57=true;
return _1.toJson(_50,_57);
},_isEmpty:function(_58){
var _59=true;
if(_1.isObject(_58)){
var i;
for(i in _58){
_59=false;
break;
}
}else{
if(_1.isArray(_58)){
if(_58.length>0){
_59=false;
}
}
}
return _59;
},save:function(_5a){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var _5b=this;
var _5c=function(){
_5b._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
_5b._saveInProgress=false;
if(_5a&&_5a.onComplete){
var _5d=_5a.scope||_1.global;
_5a.onComplete.call(_5d);
}
};
var _5e=function(){
_5b._saveInProgress=false;
if(_5a&&_5a.onError){
var _5f=_5a.scope||_1.global;
_5a.onError.call(_5f);
}
};
if(this._saveEverything){
var _60=this._getNewFileContentString();
this._saveEverything(_5c,_5e,_60);
}
if(this._saveCustom){
this._saveCustom(_5c,_5e);
}
if(!this._saveEverything&&!this._saveCustom){
_5c();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _61;
for(_61 in this._pending._modifiedItems){
var _62=this._pending._modifiedItems[_61];
var _63=null;
if(this._itemsByIdentity){
_63=this._itemsByIdentity[_61];
}else{
_63=this._arrayOfAllItems[_61];
}
_62[this._storeRefPropName]=this;
for(key in _63){
delete _63[key];
}
_1.mixin(_63,_62);
}
var _64;
for(_61 in this._pending._deletedItems){
_64=this._pending._deletedItems[_61];
_64[this._storeRefPropName]=this;
var _65=_64[this._itemNumPropName];
if(_64["backup_"+this._reverseRefMap]){
_64[this._reverseRefMap]=_64["backup_"+this._reverseRefMap];
delete _64["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_65]=_64;
if(this._itemsByIdentity){
this._itemsByIdentity[_61]=_64;
}
if(_64[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_64);
}
}
for(_61 in this._pending._deletedItems){
_64=this._pending._deletedItems[_61];
if(_64["backupRefs_"+this._reverseRefMap]){
_1.forEach(_64["backupRefs_"+this._reverseRefMap],function(_66){
var _67;
if(this._itemsByIdentity){
_67=this._itemsByIdentity[_66.id];
}else{
_67=this._arrayOfAllItems[_66.id];
}
this._addReferenceToMap(_67,_64,_66.attr);
},this);
delete _64["backupRefs_"+this._reverseRefMap];
}
}
for(_61 in this._pending._newItems){
var _68=this._pending._newItems[_61];
_68[this._storeRefPropName]=null;
this._arrayOfAllItems[_68[this._itemNumPropName]]=null;
if(_68[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_68);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_61];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(_69){
if(_69){
var _6a=this.getIdentity(_69);
return new Boolean(this._pending._newItems[_6a]||this._pending._modifiedItems[_6a]||this._pending._deletedItems[_6a]).valueOf();
}else{
if(!this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems)){
return true;
}
return false;
}
},onSet:function(_6b,_6c,_6d,_6e){
},onNew:function(_6f,_70){
},onDelete:function(_71){
},close:function(_72){
if(this.clearOnClose){
if(!this.isDirty()){
this.inherited(arguments);
}else{
throw new Error("dojox.data.AndOrWriteStore: There are unsaved changes present in the store.  Please save or revert the changes before invoking close.");
}
}
}});
return _2.data.AndOrWriteStore;
});
