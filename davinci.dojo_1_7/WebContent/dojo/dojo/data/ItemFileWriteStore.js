/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/ItemFileWriteStore",["../main","./ItemFileReadStore"],function(_1){
_1.declare("dojo.data.ItemFileWriteStore",_1.data.ItemFileReadStore,{constructor:function(_2){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(_3){
return _1.date.stamp.toISOString(_3,{zulu:true});
};
}
if(_2&&(_2.referenceIntegrity===false)){
this.referenceIntegrity=false;
}
this._saveInProgress=false;
},referenceIntegrity:true,_assert:function(_4){
if(!_4){
throw new Error("assertion failed in ItemFileWriteStore");
}
},_getIdentifierAttribute:function(){
return this.getFeatures()["dojo.data.api.Identity"];
},newItem:function(_5,_6){
this._assert(!this._saveInProgress);
if(!this._loadFinished){
this._forceLoad();
}
if(typeof _5!="object"&&typeof _5!="undefined"){
throw new Error("newItem() was passed something other than an object");
}
var _7=null;
var _8=this._getIdentifierAttribute();
if(_8===Number){
_7=this._arrayOfAllItems.length;
}else{
_7=_5[_8];
if(typeof _7==="undefined"){
throw new Error("newItem() was not passed an identity for the new item");
}
if(_1.isArray(_7)){
throw new Error("newItem() was not passed an single-valued identity");
}
}
if(this._itemsByIdentity){
this._assert(typeof this._itemsByIdentity[_7]==="undefined");
}
this._assert(typeof this._pending._newItems[_7]==="undefined");
this._assert(typeof this._pending._deletedItems[_7]==="undefined");
var _9={};
_9[this._storeRefPropName]=this;
_9[this._itemNumPropName]=this._arrayOfAllItems.length;
if(this._itemsByIdentity){
this._itemsByIdentity[_7]=_9;
_9[_8]=[_7];
}
this._arrayOfAllItems.push(_9);
var _a=null;
if(_6&&_6.parent&&_6.attribute){
_a={item:_6.parent,attribute:_6.attribute,oldValue:undefined};
var _b=this.getValues(_6.parent,_6.attribute);
if(_b&&_b.length>0){
var _c=_b.slice(0,_b.length);
if(_b.length===1){
_a.oldValue=_b[0];
}else{
_a.oldValue=_b.slice(0,_b.length);
}
_c.push(_9);
this._setValueOrValues(_6.parent,_6.attribute,_c,false);
_a.newValue=this.getValues(_6.parent,_6.attribute);
}else{
this._setValueOrValues(_6.parent,_6.attribute,_9,false);
_a.newValue=_9;
}
}else{
_9[this._rootItemPropName]=true;
this._arrayOfTopLevelItems.push(_9);
}
this._pending._newItems[_7]=_9;
for(var _d in _5){
if(_d===this._storeRefPropName||_d===this._itemNumPropName){
throw new Error("encountered bug in ItemFileWriteStore.newItem");
}
var _e=_5[_d];
if(!_1.isArray(_e)){
_e=[_e];
}
_9[_d]=_e;
if(this.referenceIntegrity){
for(var i=0;i<_e.length;i++){
var _f=_e[i];
if(this.isItem(_f)){
this._addReferenceToMap(_f,_9,_d);
}
}
}
}
this.onNew(_9,_a);
return _9;
},_removeArrayElement:function(_10,_11){
var _12=_1.indexOf(_10,_11);
if(_12!=-1){
_10.splice(_12,1);
return true;
}
return false;
},deleteItem:function(_13){
this._assert(!this._saveInProgress);
this._assertIsItem(_13);
var _14=_13[this._itemNumPropName];
var _15=this.getIdentity(_13);
if(this.referenceIntegrity){
var _16=this.getAttributes(_13);
if(_13[this._reverseRefMap]){
_13["backup_"+this._reverseRefMap]=_1.clone(_13[this._reverseRefMap]);
}
_1.forEach(_16,function(_17){
_1.forEach(this.getValues(_13,_17),function(_18){
if(this.isItem(_18)){
if(!_13["backupRefs_"+this._reverseRefMap]){
_13["backupRefs_"+this._reverseRefMap]=[];
}
_13["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_18),attr:_17});
this._removeReferenceFromMap(_18,_13,_17);
}
},this);
},this);
var _19=_13[this._reverseRefMap];
if(_19){
for(var _1a in _19){
var _1b=null;
if(this._itemsByIdentity){
_1b=this._itemsByIdentity[_1a];
}else{
_1b=this._arrayOfAllItems[_1a];
}
if(_1b){
for(var _1c in _19[_1a]){
var _1d=this.getValues(_1b,_1c)||[];
var _1e=_1.filter(_1d,function(_1f){
return !(this.isItem(_1f)&&this.getIdentity(_1f)==_15);
},this);
this._removeReferenceFromMap(_13,_1b,_1c);
if(_1e.length<_1d.length){
this._setValueOrValues(_1b,_1c,_1e,true);
}
}
}
}
}
}
this._arrayOfAllItems[_14]=null;
_13[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_15];
}
this._pending._deletedItems[_15]=_13;
if(_13[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_13);
}
this.onDelete(_13);
return true;
},setValue:function(_20,_21,_22){
return this._setValueOrValues(_20,_21,_22,true);
},setValues:function(_23,_24,_25){
return this._setValueOrValues(_23,_24,_25,true);
},unsetAttribute:function(_26,_27){
return this._setValueOrValues(_26,_27,[],true);
},_setValueOrValues:function(_28,_29,_2a,_2b){
this._assert(!this._saveInProgress);
this._assertIsItem(_28);
this._assert(_1.isString(_29));
this._assert(typeof _2a!=="undefined");
var _2c=this._getIdentifierAttribute();
if(_29==_2c){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _2d=this._getValueOrValues(_28,_29);
var _2e=this.getIdentity(_28);
if(!this._pending._modifiedItems[_2e]){
var _2f={};
for(var key in _28){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_2f[key]=_28[key];
}else{
if(key===this._reverseRefMap){
_2f[key]=_1.clone(_28[key]);
}else{
_2f[key]=_28[key].slice(0,_28[key].length);
}
}
}
this._pending._modifiedItems[_2e]=_2f;
}
var _30=false;
if(_1.isArray(_2a)&&_2a.length===0){
_30=delete _28[_29];
_2a=undefined;
if(this.referenceIntegrity&&_2d){
var _31=_2d;
if(!_1.isArray(_31)){
_31=[_31];
}
for(var i=0;i<_31.length;i++){
var _32=_31[i];
if(this.isItem(_32)){
this._removeReferenceFromMap(_32,_28,_29);
}
}
}
}else{
var _33;
if(_1.isArray(_2a)){
_33=_2a.slice(0,_2a.length);
}else{
_33=[_2a];
}
if(this.referenceIntegrity){
if(_2d){
var _31=_2d;
if(!_1.isArray(_31)){
_31=[_31];
}
var map={};
_1.forEach(_31,function(_34){
if(this.isItem(_34)){
var id=this.getIdentity(_34);
map[id.toString()]=true;
}
},this);
_1.forEach(_33,function(_35){
if(this.isItem(_35)){
var id=this.getIdentity(_35);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_35,_28,_29);
}
}
},this);
for(var rId in map){
var _36;
if(this._itemsByIdentity){
_36=this._itemsByIdentity[rId];
}else{
_36=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_36,_28,_29);
}
}else{
for(var i=0;i<_33.length;i++){
var _32=_33[i];
if(this.isItem(_32)){
this._addReferenceToMap(_32,_28,_29);
}
}
}
}
_28[_29]=_33;
_30=true;
}
if(_2b){
this.onSet(_28,_29,_2d,_2a);
}
return _30;
},_addReferenceToMap:function(_37,_38,_39){
var _3a=this.getIdentity(_38);
var _3b=_37[this._reverseRefMap];
if(!_3b){
_3b=_37[this._reverseRefMap]={};
}
var _3c=_3b[_3a];
if(!_3c){
_3c=_3b[_3a]={};
}
_3c[_39]=true;
},_removeReferenceFromMap:function(_3d,_3e,_3f){
var _40=this.getIdentity(_3e);
var _41=_3d[this._reverseRefMap];
var _42;
if(_41){
for(_42 in _41){
if(_42==_40){
delete _41[_42][_3f];
if(this._isEmpty(_41[_42])){
delete _41[_42];
}
}
}
if(this._isEmpty(_41)){
delete _3d[this._reverseRefMap];
}
}
},_dumpReferenceMap:function(){
var i;
for(i=0;i<this._arrayOfAllItems.length;i++){
var _43=this._arrayOfAllItems[i];
if(_43&&_43[this._reverseRefMap]){
}
}
},_getValueOrValues:function(_44,_45){
var _46=undefined;
if(this.hasAttribute(_44,_45)){
var _47=this.getValues(_44,_45);
if(_47.length==1){
_46=_47[0];
}else{
_46=_47;
}
}
return _46;
},_flatten:function(_48){
if(this.isItem(_48)){
return {_reference:this.getIdentity(_48)};
}else{
if(typeof _48==="object"){
for(var _49 in this._datatypeMap){
var _4a=this._datatypeMap[_49];
if(_1.isObject(_4a)&&!_1.isFunction(_4a)){
if(_48 instanceof _4a.type){
if(!_4a.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+_49+"]");
}
return {_type:_49,_value:_4a.serialize(_48)};
}
}else{
if(_48 instanceof _4a){
return {_type:_49,_value:_48.toString()};
}
}
}
}
return _48;
}
},_getNewFileContentString:function(){
var _4b={};
var _4c=this._getIdentifierAttribute();
if(_4c!==Number){
_4b.identifier=_4c;
}
if(this._labelAttr){
_4b.label=this._labelAttr;
}
_4b.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var _4d=this._arrayOfAllItems[i];
if(_4d!==null){
var _4e={};
for(var key in _4d){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName&&key!==this._reverseRefMap&&key!==this._rootItemPropName){
var _4f=this.getValues(_4d,key);
if(_4f.length==1){
_4e[key]=this._flatten(_4f[0]);
}else{
var _50=[];
for(var j=0;j<_4f.length;++j){
_50.push(this._flatten(_4f[j]));
_4e[key]=_50;
}
}
}
}
_4b.items.push(_4e);
}
}
var _51=true;
return _1.toJson(_4b,_51);
},_isEmpty:function(_52){
var _53=true;
if(_1.isObject(_52)){
var i;
for(i in _52){
_53=false;
break;
}
}else{
if(_1.isArray(_52)){
if(_52.length>0){
_53=false;
}
}
}
return _53;
},save:function(_54){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var _55=this;
var _56=function(){
_55._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
_55._saveInProgress=false;
if(_54&&_54.onComplete){
var _57=_54.scope||_1.global;
_54.onComplete.call(_57);
}
};
var _58=function(err){
_55._saveInProgress=false;
if(_54&&_54.onError){
var _59=_54.scope||_1.global;
_54.onError.call(_59,err);
}
};
if(this._saveEverything){
var _5a=this._getNewFileContentString();
this._saveEverything(_56,_58,_5a);
}
if(this._saveCustom){
this._saveCustom(_56,_58);
}
if(!this._saveEverything&&!this._saveCustom){
_56();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _5b;
for(_5b in this._pending._modifiedItems){
var _5c=this._pending._modifiedItems[_5b];
var _5d=null;
if(this._itemsByIdentity){
_5d=this._itemsByIdentity[_5b];
}else{
_5d=this._arrayOfAllItems[_5b];
}
_5c[this._storeRefPropName]=this;
for(var key in _5d){
delete _5d[key];
}
_1.mixin(_5d,_5c);
}
var _5e;
for(_5b in this._pending._deletedItems){
_5e=this._pending._deletedItems[_5b];
_5e[this._storeRefPropName]=this;
var _5f=_5e[this._itemNumPropName];
if(_5e["backup_"+this._reverseRefMap]){
_5e[this._reverseRefMap]=_5e["backup_"+this._reverseRefMap];
delete _5e["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_5f]=_5e;
if(this._itemsByIdentity){
this._itemsByIdentity[_5b]=_5e;
}
if(_5e[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_5e);
}
}
for(_5b in this._pending._deletedItems){
_5e=this._pending._deletedItems[_5b];
if(_5e["backupRefs_"+this._reverseRefMap]){
_1.forEach(_5e["backupRefs_"+this._reverseRefMap],function(_60){
var _61;
if(this._itemsByIdentity){
_61=this._itemsByIdentity[_60.id];
}else{
_61=this._arrayOfAllItems[_60.id];
}
this._addReferenceToMap(_61,_5e,_60.attr);
},this);
delete _5e["backupRefs_"+this._reverseRefMap];
}
}
for(_5b in this._pending._newItems){
var _62=this._pending._newItems[_5b];
_62[this._storeRefPropName]=null;
this._arrayOfAllItems[_62[this._itemNumPropName]]=null;
if(_62[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_62);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_5b];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(_63){
if(_63){
var _64=this.getIdentity(_63);
return new Boolean(this._pending._newItems[_64]||this._pending._modifiedItems[_64]||this._pending._deletedItems[_64]).valueOf();
}else{
return !this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems);
}
},onSet:function(_65,_66,_67,_68){
},onNew:function(_69,_6a){
},onDelete:function(_6b){
},close:function(_6c){
if(this.clearOnClose){
if(!this.isDirty()){
this.inherited(arguments);
}else{
throw new Error("dojo.data.ItemFileWriteStore: There are unsaved changes present in the store.  Please save or revert the changes before invoking close.");
}
}
}});
return _1.data.ItemFileWriteStore;
});
