/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/XmlStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/data/util/filter","dojox/xml/parser"],function(_1,_2){
_1.declare("dojox.data.XmlStore",null,{constructor:function(_3){
if(_3){
this.url=_3.url;
this.rootItem=(_3.rootItem||_3.rootitem||this.rootItem);
this.keyAttribute=(_3.keyAttribute||_3.keyattribute||this.keyAttribute);
this._attributeMap=(_3.attributeMap||_3.attributemap);
this.label=_3.label||this.label;
this.sendQuery=(_3.sendQuery||_3.sendquery||this.sendQuery);
if("urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
}
this._newItems=[];
this._deletedItems=[];
this._modifiedItems=[];
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,attributeMap:null,urlPreventCache:true,getValue:function(_4,_5,_6){
var _7=_4.element;
var i;
var _8;
if(_5==="tagName"){
return _7.nodeName;
}else{
if(_5==="childNodes"){
for(i=0;i<_7.childNodes.length;i++){
_8=_7.childNodes[i];
if(_8.nodeType===1){
return this._getItem(_8);
}
}
return _6;
}else{
if(_5==="text()"){
for(i=0;i<_7.childNodes.length;i++){
_8=_7.childNodes[i];
if(_8.nodeType===3||_8.nodeType===4){
return _8.nodeValue;
}
}
return _6;
}else{
_5=this._getAttribute(_7.nodeName,_5);
if(_5.charAt(0)==="@"){
var _9=_5.substring(1);
var _a=_7.getAttribute(_9);
return (_a)?_a:_6;
}else{
for(i=0;i<_7.childNodes.length;i++){
_8=_7.childNodes[i];
if(_8.nodeType===1&&_8.nodeName===_5){
return this._getItem(_8);
}
}
return _6;
}
}
}
}
},getValues:function(_b,_c){
var _d=_b.element;
var _e=[];
var i;
var _f;
if(_c==="tagName"){
return [_d.nodeName];
}else{
if(_c==="childNodes"){
for(i=0;i<_d.childNodes.length;i++){
_f=_d.childNodes[i];
if(_f.nodeType===1){
_e.push(this._getItem(_f));
}
}
return _e;
}else{
if(_c==="text()"){
var ec=_d.childNodes;
for(i=0;i<ec.length;i++){
_f=ec[i];
if(_f.nodeType===3||_f.nodeType===4){
_e.push(_f.nodeValue);
}
}
return _e;
}else{
_c=this._getAttribute(_d.nodeName,_c);
if(_c.charAt(0)==="@"){
var _10=_c.substring(1);
var _11=_d.getAttribute(_10);
return (_11!==undefined)?[_11]:[];
}else{
for(i=0;i<_d.childNodes.length;i++){
_f=_d.childNodes[i];
if(_f.nodeType===1&&_f.nodeName===_c){
_e.push(this._getItem(_f));
}
}
return _e;
}
}
}
}
},getAttributes:function(_12){
var _13=_12.element;
var _14=[];
var i;
_14.push("tagName");
if(_13.childNodes.length>0){
var _15={};
var _16=true;
var _17=false;
for(i=0;i<_13.childNodes.length;i++){
var _18=_13.childNodes[i];
if(_18.nodeType===1){
var _19=_18.nodeName;
if(!_15[_19]){
_14.push(_19);
_15[_19]=_19;
}
_16=true;
}else{
if(_18.nodeType===3){
_17=true;
}
}
}
if(_16){
_14.push("childNodes");
}
if(_17){
_14.push("text()");
}
}
for(i=0;i<_13.attributes.length;i++){
_14.push("@"+_13.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
i=key.indexOf(".");
if(i>0){
var _1a=key.substring(0,i);
if(_1a===_13.nodeName){
_14.push(key.substring(i+1));
}
}else{
_14.push(key);
}
}
}
return _14;
},hasAttribute:function(_1b,_1c){
return (this.getValue(_1b,_1c)!==undefined);
},containsValue:function(_1d,_1e,_1f){
var _20=this.getValues(_1d,_1e);
for(var i=0;i<_20.length;i++){
if((typeof _1f==="string")){
if(_20[i].toString&&_20[i].toString()===_1f){
return true;
}
}else{
if(_20[i]===_1f){
return true;
}
}
}
return false;
},isItem:function(_21){
if(_21&&_21.element&&_21.store&&_21.store===this){
return true;
}
return false;
},isItemLoaded:function(_22){
return this.isItem(_22);
},loadItem:function(_23){
},getFeatures:function(){
var _24={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
if(!this.sendQuery||this.keyAttribute!==""){
_24["dojo.data.api.Identity"]=true;
}
return _24;
},getLabel:function(_25){
if((this.label!=="")&&this.isItem(_25)){
var _26=this.getValue(_25,this.label);
if(_26){
return _26.toString();
}
}
return undefined;
},getLabelAttributes:function(_27){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_28,_29,_2a){
var url=this._getFetchUrl(_28);
if(!url){
_2a(new Error("No URL specified."));
return;
}
var _2b=(!this.sendQuery?_28:{});
var _2c=this;
var _2d={url:url,handleAs:"xml",preventCache:_2c.urlPreventCache};
var _2e=_1.xhrGet(_2d);
_2e.addCallback(function(_2f){
var _30=_2c._getItems(_2f,_2b);
if(_30&&_30.length>0){
_29(_30,_28);
}else{
_29([],_28);
}
});
_2e.addErrback(function(_31){
_2a(_31,_28);
});
},_getFetchUrl:function(_32){
if(!this.sendQuery){
return this.url;
}
var _33=_32.query;
if(!_33){
return this.url;
}
if(_1.isString(_33)){
return this.url+_33;
}
var _34="";
for(var _35 in _33){
var _36=_33[_35];
if(_36){
if(_34){
_34+="&";
}
_34+=(_35+"="+_36);
}
}
if(!_34){
return this.url;
}
var _37=this.url;
if(_37.indexOf("?")<0){
_37+="?";
}else{
_37+="&";
}
return _37+_34;
},_getItems:function(_38,_39){
var _3a=null;
if(_39){
_3a=_39.query;
}
var _3b=[];
var _3c=null;
if(this.rootItem!==""){
_3c=_1.query(this.rootItem,_38);
}else{
_3c=_38.documentElement.childNodes;
}
var _3d=_39.queryOptions?_39.queryOptions.deep:false;
if(_3d){
_3c=this._flattenNodes(_3c);
}
for(var i=0;i<_3c.length;i++){
var _3e=_3c[i];
if(_3e.nodeType!=1){
continue;
}
var _3f=this._getItem(_3e);
if(_3a){
var _40=_39.queryOptions?_39.queryOptions.ignoreCase:false;
var _41;
var _42=false;
var j;
var _43=true;
var _44={};
for(var key in _3a){
_41=_3a[key];
if(typeof _41==="string"){
_44[key]=_1.data.util.filter.patternToRegExp(_41,_40);
}
}
for(var _45 in _3a){
_43=false;
var _46=this.getValues(_3f,_45);
for(j=0;j<_46.length;j++){
_41=_46[j];
if(_41){
var _47=_3a[_45];
if((typeof _41)==="string"&&(_44[_45])){
if((_41.match(_44[_45]))!==null){
_42=true;
}else{
_42=false;
}
}else{
if((typeof _41)==="object"){
if(_41.toString&&(_44[_45])){
var _48=_41.toString();
if((_48.match(_44[_45]))!==null){
_42=true;
}else{
_42=false;
}
}else{
if(_47==="*"||_47===_41){
_42=true;
}else{
_42=false;
}
}
}
}
}
if(_42){
break;
}
}
if(!_42){
break;
}
}
if(_43||_42){
_3b.push(_3f);
}
}else{
_3b.push(_3f);
}
}
_1.forEach(_3b,function(_49){
if(_49.element.parentNode){
_49.element.parentNode.removeChild(_49.element);
}
},this);
return _3b;
},_flattenNodes:function(_4a){
var _4b=[];
if(_4a){
var i;
for(i=0;i<_4a.length;i++){
var _4c=_4a[i];
_4b.push(_4c);
if(_4c.childNodes&&_4c.childNodes.length>0){
_4b=_4b.concat(this._flattenNodes(_4c.childNodes));
}
}
}
return _4b;
},close:function(_4d){
},newItem:function(_4e,_4f){
_4e=(_4e||{});
var _50=_4e.tagName;
if(!_50){
_50=this.rootItem;
if(_50===""){
return null;
}
}
var _51=this._getDocument();
var _52=_51.createElement(_50);
for(var _53 in _4e){
var _54;
if(_53==="tagName"){
continue;
}else{
if(_53==="text()"){
_54=_51.createTextNode(_4e[_53]);
_52.appendChild(_54);
}else{
_53=this._getAttribute(_50,_53);
if(_53.charAt(0)==="@"){
var _55=_53.substring(1);
_52.setAttribute(_55,_4e[_53]);
}else{
var _56=_51.createElement(_53);
_54=_51.createTextNode(_4e[_53]);
_56.appendChild(_54);
_52.appendChild(_56);
}
}
}
}
var _57=this._getItem(_52);
this._newItems.push(_57);
var _58=null;
if(_4f&&_4f.parent&&_4f.attribute){
_58={item:_4f.parent,attribute:_4f.attribute,oldValue:undefined};
var _59=this.getValues(_4f.parent,_4f.attribute);
if(_59&&_59.length>0){
var _5a=_59.slice(0,_59.length);
if(_59.length===1){
_58.oldValue=_59[0];
}else{
_58.oldValue=_59.slice(0,_59.length);
}
_5a.push(_57);
this.setValues(_4f.parent,_4f.attribute,_5a);
_58.newValue=this.getValues(_4f.parent,_4f.attribute);
}else{
this.setValues(_4f.parent,_4f.attribute,_57);
_58.newValue=_57;
}
}
return _57;
},deleteItem:function(_5b){
var _5c=_5b.element;
if(_5c.parentNode){
this._backupItem(_5b);
_5c.parentNode.removeChild(_5c);
return true;
}
this._forgetItem(_5b);
this._deletedItems.push(_5b);
return true;
},setValue:function(_5d,_5e,_5f){
if(_5e==="tagName"){
return false;
}
this._backupItem(_5d);
var _60=_5d.element;
var _61;
var _62;
if(_5e==="childNodes"){
_61=_5f.element;
_60.appendChild(_61);
}else{
if(_5e==="text()"){
while(_60.firstChild){
_60.removeChild(_60.firstChild);
}
_62=this._getDocument(_60).createTextNode(_5f);
_60.appendChild(_62);
}else{
_5e=this._getAttribute(_60.nodeName,_5e);
if(_5e.charAt(0)==="@"){
var _63=_5e.substring(1);
_60.setAttribute(_63,_5f);
}else{
for(var i=0;i<_60.childNodes.length;i++){
var _64=_60.childNodes[i];
if(_64.nodeType===1&&_64.nodeName===_5e){
_61=_64;
break;
}
}
var _65=this._getDocument(_60);
if(_61){
while(_61.firstChild){
_61.removeChild(_61.firstChild);
}
}else{
_61=_65.createElement(_5e);
_60.appendChild(_61);
}
_62=_65.createTextNode(_5f);
_61.appendChild(_62);
}
}
}
return true;
},setValues:function(_66,_67,_68){
if(_67==="tagName"){
return false;
}
this._backupItem(_66);
var _69=_66.element;
var i;
var _6a;
var _6b;
if(_67==="childNodes"){
while(_69.firstChild){
_69.removeChild(_69.firstChild);
}
for(i=0;i<_68.length;i++){
_6a=_68[i].element;
_69.appendChild(_6a);
}
}else{
if(_67==="text()"){
while(_69.firstChild){
_69.removeChild(_69.firstChild);
}
var _6c="";
for(i=0;i<_68.length;i++){
_6c+=_68[i];
}
_6b=this._getDocument(_69).createTextNode(_6c);
_69.appendChild(_6b);
}else{
_67=this._getAttribute(_69.nodeName,_67);
if(_67.charAt(0)==="@"){
var _6d=_67.substring(1);
_69.setAttribute(_6d,_68[0]);
}else{
for(i=_69.childNodes.length-1;i>=0;i--){
var _6e=_69.childNodes[i];
if(_6e.nodeType===1&&_6e.nodeName===_67){
_69.removeChild(_6e);
}
}
var _6f=this._getDocument(_69);
for(i=0;i<_68.length;i++){
_6a=_6f.createElement(_67);
_6b=_6f.createTextNode(_68[i]);
_6a.appendChild(_6b);
_69.appendChild(_6a);
}
}
}
}
return true;
},unsetAttribute:function(_70,_71){
if(_71==="tagName"){
return false;
}
this._backupItem(_70);
var _72=_70.element;
if(_71==="childNodes"||_71==="text()"){
while(_72.firstChild){
_72.removeChild(_72.firstChild);
}
}else{
_71=this._getAttribute(_72.nodeName,_71);
if(_71.charAt(0)==="@"){
var _73=_71.substring(1);
_72.removeAttribute(_73);
}else{
for(var i=_72.childNodes.length-1;i>=0;i--){
var _74=_72.childNodes[i];
if(_74.nodeType===1&&_74.nodeName===_71){
_72.removeChild(_74);
}
}
}
}
return true;
},save:function(_75){
if(!_75){
_75={};
}
var i;
for(i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_75,"PUT");
}
for(i=0;i<this._newItems.length;i++){
var _76=this._newItems[i];
if(_76.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_75,"POST");
}
for(i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_75,"DELETE");
}
},revert:function(){
this._newItems=[];
this._restoreItems(this._deletedItems);
this._deletedItems=[];
this._restoreItems(this._modifiedItems);
this._modifiedItems=[];
return true;
},isDirty:function(_77){
if(_77){
var _78=this._getRootElement(_77.element);
return (this._getItemIndex(this._newItems,_78)>=0||this._getItemIndex(this._deletedItems,_78)>=0||this._getItemIndex(this._modifiedItems,_78)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(_79,_7a,_7b){
var url;
var _7c;
if(_7b==="PUT"){
url=this._getPutUrl(_79);
}else{
if(_7b==="DELETE"){
url=this._getDeleteUrl(_79);
}else{
url=this._getPostUrl(_79);
}
}
if(!url){
if(_7a.onError){
_7c=_7a.scope||_1.global;
_7a.onError.call(_7c,new Error("No URL for saving content: "+this._getPostContent(_79)));
}
return;
}
var _7d={url:url,method:(_7b||"POST"),contentType:"text/xml",handleAs:"xml"};
var _7e;
if(_7b==="PUT"){
_7d.putData=this._getPutContent(_79);
_7e=_1.rawXhrPut(_7d);
}else{
if(_7b==="DELETE"){
_7e=_1.xhrDelete(_7d);
}else{
_7d.postData=this._getPostContent(_79);
_7e=_1.rawXhrPost(_7d);
}
}
_7c=(_7a.scope||_1.global);
var _7f=this;
_7e.addCallback(function(_80){
_7f._forgetItem(_79);
if(_7a.onComplete){
_7a.onComplete.call(_7c);
}
});
_7e.addErrback(function(_81){
if(_7a.onError){
_7a.onError.call(_7c,_81);
}
});
},_getPostUrl:function(_82){
return this.url;
},_getPutUrl:function(_83){
return this.url;
},_getDeleteUrl:function(_84){
var url=this.url;
if(_84&&this.keyAttribute!==""){
var _85=this.getValue(_84,this.keyAttribute);
if(_85){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_85;
}
}
return url;
},_getPostContent:function(_86){
var _87=_86.element;
var _88="<?xml version=\"1.0\"?>";
return _88+_2.xml.parser.innerXML(_87);
},_getPutContent:function(_89){
var _8a=_89.element;
var _8b="<?xml version=\"1.0\"?>";
return _8b+_2.xml.parser.innerXML(_8a);
},_getAttribute:function(_8c,_8d){
if(this._attributeMap){
var key=_8c+"."+_8d;
var _8e=this._attributeMap[key];
if(_8e){
_8d=_8e;
}else{
_8e=this._attributeMap[_8d];
if(_8e){
_8d=_8e;
}
}
}
return _8d;
},_getItem:function(_8f){
try{
var q=null;
if(this.keyAttribute===""){
q=this._getXPath(_8f);
}
return new _2.data.XmlItem(_8f,this,q);
}
catch(e){
}
return null;
},_getItemIndex:function(_90,_91){
for(var i=0;i<_90.length;i++){
if(_90[i].element===_91){
return i;
}
}
return -1;
},_backupItem:function(_92){
var _93=this._getRootElement(_92.element);
if(this._getItemIndex(this._newItems,_93)>=0||this._getItemIndex(this._modifiedItems,_93)>=0){
return;
}
if(_93!=_92.element){
_92=this._getItem(_93);
}
_92._backup=_93.cloneNode(true);
this._modifiedItems.push(_92);
},_restoreItems:function(_94){
_1.forEach(_94,function(_95){
if(_95._backup){
_95.element=_95._backup;
_95._backup=null;
}
},this);
},_forgetItem:function(_96){
var _97=_96.element;
var _98=this._getItemIndex(this._newItems,_97);
if(_98>=0){
this._newItems.splice(_98,1);
}
_98=this._getItemIndex(this._deletedItems,_97);
if(_98>=0){
this._deletedItems.splice(_98,1);
}
_98=this._getItemIndex(this._modifiedItems,_97);
if(_98>=0){
this._modifiedItems.splice(_98,1);
}
},_getDocument:function(_99){
if(_99){
return _99.ownerDocument;
}else{
if(!this._document){
return _2.xml.parser.parse();
}
}
return null;
},_getRootElement:function(_9a){
while(_9a.parentNode){
_9a=_9a.parentNode;
}
return _9a;
},_getXPath:function(_9b){
var _9c=null;
if(!this.sendQuery){
var _9d=_9b;
_9c="";
while(_9d&&_9d!=_9b.ownerDocument){
var pos=0;
var _9e=_9d;
var _9f=_9d.nodeName;
while(_9e){
_9e=_9e.previousSibling;
if(_9e&&_9e.nodeName===_9f){
pos++;
}
}
var _a0="/"+_9f+"["+pos+"]";
if(_9c){
_9c=_a0+_9c;
}else{
_9c=_a0;
}
_9d=_9d.parentNode;
}
}
return _9c;
},getIdentity:function(_a1){
if(!this.isItem(_a1)){
throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
}else{
var id=null;
if(this.sendQuery&&this.keyAttribute!==""){
id=this.getValue(_a1,this.keyAttribute).toString();
}else{
if(!this.serverQuery){
if(this.keyAttribute!==""){
id=this.getValue(_a1,this.keyAttribute).toString();
}else{
id=_a1.q;
}
}
}
return id;
}
},getIdentityAttributes:function(_a2){
if(!this.isItem(_a2)){
throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
}else{
if(this.keyAttribute!==""){
return [this.keyAttribute];
}else{
return null;
}
}
},fetchItemByIdentity:function(_a3){
var _a4=null;
var _a5=null;
var _a6=this;
var url=null;
var _a7=null;
var _a8=null;
if(!_a6.sendQuery){
_a4=function(_a9){
if(_a9){
if(_a6.keyAttribute!==""){
var _aa={};
_aa.query={};
_aa.query[_a6.keyAttribute]=_a3.identity;
_aa.queryOptions={deep:true};
var _ab=_a6._getItems(_a9,_aa);
_a5=_a3.scope||_1.global;
if(_ab.length===1){
if(_a3.onItem){
_a3.onItem.call(_a5,_ab[0]);
}
}else{
if(_ab.length===0){
if(_a3.onItem){
_a3.onItem.call(_a5,null);
}
}else{
if(_a3.onError){
_a3.onError.call(_a5,new Error("Items array size for identity lookup greater than 1, invalid keyAttribute."));
}
}
}
}else{
var _ac=_a3.identity.split("/");
var i;
var _ad=_a9;
for(i=0;i<_ac.length;i++){
if(_ac[i]&&_ac[i]!==""){
var _ae=_ac[i];
_ae=_ae.substring(0,_ae.length-1);
var _af=_ae.split("[");
var tag=_af[0];
var _b0=parseInt(_af[1],10);
var pos=0;
if(_ad){
var _b1=_ad.childNodes;
if(_b1){
var j;
var _b2=null;
for(j=0;j<_b1.length;j++){
var _b3=_b1[j];
if(_b3.nodeName===tag){
if(pos<_b0){
pos++;
}else{
_b2=_b3;
break;
}
}
}
if(_b2){
_ad=_b2;
}else{
_ad=null;
}
}else{
_ad=null;
}
}else{
break;
}
}
}
var _b4=null;
if(_ad){
_b4=_a6._getItem(_ad);
if(_b4.element.parentNode){
_b4.element.parentNode.removeChild(_b4.element);
}
}
if(_a3.onItem){
_a5=_a3.scope||_1.global;
_a3.onItem.call(_a5,_b4);
}
}
}
};
url=this._getFetchUrl(null);
_a7={url:url,handleAs:"xml",preventCache:_a6.urlPreventCache};
_a8=_1.xhrGet(_a7);
_a8.addCallback(_a4);
if(_a3.onError){
_a8.addErrback(function(_b5){
var s=_a3.scope||_1.global;
_a3.onError.call(s,_b5);
});
}
}else{
if(_a6.keyAttribute!==""){
var _b6={query:{}};
_b6.query[_a6.keyAttribute]=_a3.identity;
url=this._getFetchUrl(_b6);
_a4=function(_b7){
var _b8=null;
if(_b7){
var _b9=_a6._getItems(_b7,{});
if(_b9.length===1){
_b8=_b9[0];
}else{
if(_a3.onError){
var _ba=_a3.scope||_1.global;
_a3.onError.call(_ba,new Error("More than one item was returned from the server for the denoted identity"));
}
}
}
if(_a3.onItem){
_ba=_a3.scope||_1.global;
_a3.onItem.call(_ba,_b8);
}
};
_a7={url:url,handleAs:"xml",preventCache:_a6.urlPreventCache};
_a8=_1.xhrGet(_a7);
_a8.addCallback(_a4);
if(_a3.onError){
_a8.addErrback(function(_bb){
var s=_a3.scope||_1.global;
_a3.onError.call(s,_bb);
});
}
}else{
if(_a3.onError){
var s=_a3.scope||_1.global;
_a3.onError.call(s,new Error("XmlStore is not told that the server to provides identity support.  No keyAttribute specified."));
}
}
}
}});
_1.declare("dojox.data.XmlItem",null,{constructor:function(_bc,_bd,_be){
this.element=_bc;
this.store=_bd;
this.q=_be;
},toString:function(){
var str="";
if(this.element){
for(var i=0;i<this.element.childNodes.length;i++){
var _bf=this.element.childNodes[i];
if(_bf.nodeType===3||_bf.nodeType===4){
str+=_bf.nodeValue;
}
}
}
return str;
}});
_1.extend(_2.data.XmlStore,_1.data.util.simpleFetch);
return _2.data.XmlStore;
});
