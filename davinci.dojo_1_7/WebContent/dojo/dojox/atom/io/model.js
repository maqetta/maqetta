/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/atom/io/model",["dojo","dijit","dojox","dojox/xml/parser","dojo/string","dojo/date/stamp"],function(_1,_2,_3){
_1.getObject("dojox.atom.io.model",1);
_3.atom.io.model._Constants={"ATOM_URI":"http://www.w3.org/2005/Atom","ATOM_NS":"http://www.w3.org/2005/Atom","PURL_NS":"http://purl.org/atom/app#","APP_NS":"http://www.w3.org/2007/app"};
_3.atom.io.model._actions={"link":function(_4,_5){
if(_4.links===null){
_4.links=[];
}
var _6=new _3.atom.io.model.Link();
_6.buildFromDom(_5);
_4.links.push(_6);
},"author":function(_7,_8){
if(_7.authors===null){
_7.authors=[];
}
var _9=new _3.atom.io.model.Person("author");
_9.buildFromDom(_8);
_7.authors.push(_9);
},"contributor":function(_a,_b){
if(_a.contributors===null){
_a.contributors=[];
}
var _c=new _3.atom.io.model.Person("contributor");
_c.buildFromDom(_b);
_a.contributors.push(_c);
},"category":function(_d,_e){
if(_d.categories===null){
_d.categories=[];
}
var _f=new _3.atom.io.model.Category();
_f.buildFromDom(_e);
_d.categories.push(_f);
},"icon":function(obj,_10){
obj.icon=_3.xml.parser.textContent(_10);
},"id":function(obj,_11){
obj.id=_3.xml.parser.textContent(_11);
},"rights":function(obj,_12){
obj.rights=_3.xml.parser.textContent(_12);
},"subtitle":function(obj,_13){
var cnt=new _3.atom.io.model.Content("subtitle");
cnt.buildFromDom(_13);
obj.subtitle=cnt;
},"title":function(obj,_14){
var cnt=new _3.atom.io.model.Content("title");
cnt.buildFromDom(_14);
obj.title=cnt;
},"updated":function(obj,_15){
obj.updated=_3.atom.io.model.util.createDate(_15);
},"issued":function(obj,_16){
obj.issued=_3.atom.io.model.util.createDate(_16);
},"modified":function(obj,_17){
obj.modified=_3.atom.io.model.util.createDate(_17);
},"published":function(obj,_18){
obj.published=_3.atom.io.model.util.createDate(_18);
},"entry":function(obj,_19){
if(obj.entries===null){
obj.entries=[];
}
var _1a=obj.createEntry?obj.createEntry():new _3.atom.io.model.Entry();
_1a.buildFromDom(_19);
obj.entries.push(_1a);
},"content":function(obj,_1b){
var cnt=new _3.atom.io.model.Content("content");
cnt.buildFromDom(_1b);
obj.content=cnt;
},"summary":function(obj,_1c){
var _1d=new _3.atom.io.model.Content("summary");
_1d.buildFromDom(_1c);
obj.summary=_1d;
},"name":function(obj,_1e){
obj.name=_3.xml.parser.textContent(_1e);
},"email":function(obj,_1f){
obj.email=_3.xml.parser.textContent(_1f);
},"uri":function(obj,_20){
obj.uri=_3.xml.parser.textContent(_20);
},"generator":function(obj,_21){
obj.generator=new _3.atom.io.model.Generator();
obj.generator.buildFromDom(_21);
}};
_3.atom.io.model.util={createDate:function(_22){
var _23=_3.xml.parser.textContent(_22);
if(_23){
return _1.date.stamp.fromISOString(_1.trim(_23));
}
return null;
},escapeHtml:function(str){
return str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;").replace(/'/gm,"&#39;");
},unEscapeHtml:function(str){
return str.replace(/&lt;/gm,"<").replace(/&gt;/gm,">").replace(/&quot;/gm,"\"").replace(/&#39;/gm,"'").replace(/&amp;/gm,"&");
},getNodename:function(_24){
var _25=null;
if(_24!==null){
_25=_24.localName?_24.localName:_24.nodeName;
if(_25!==null){
var _26=_25.indexOf(":");
if(_26!==-1){
_25=_25.substring((_26+1),_25.length);
}
}
}
return _25;
}};
_1.declare("dojox.atom.io.model.Node",null,{constructor:function(_27,_28,_29,_2a,_2b){
this.name_space=_27;
this.name=_28;
this.attributes=[];
if(_29){
this.attributes=_29;
}
this.content=[];
this.rawNodes=[];
this.textContent=null;
if(_2a){
this.content.push(_2a);
}
this.shortNs=_2b;
this._objName="Node";
},buildFromDom:function(_2c){
this._saveAttributes(_2c);
this.name_space=_2c.namespaceURI;
this.shortNs=_2c.prefix;
this.name=_3.atom.io.model.util.getNodename(_2c);
for(var x=0;x<_2c.childNodes.length;x++){
var c=_2c.childNodes[x];
if(_3.atom.io.model.util.getNodename(c)!="#text"){
this.rawNodes.push(c);
var n=new _3.atom.io.model.Node();
n.buildFromDom(c,true);
this.content.push(n);
}else{
this.content.push(c.nodeValue);
}
}
this.textContent=_3.xml.parser.textContent(_2c);
},_saveAttributes:function(_2d){
if(!this.attributes){
this.attributes=[];
}
var _2e=function(_2f){
var _30=_2f.attributes;
if(_30===null){
return false;
}
return (_30.length!==0);
};
if(_2e(_2d)&&this._getAttributeNames){
var _31=this._getAttributeNames(_2d);
if(_31&&_31.length>0){
for(var x in _31){
var _32=_2d.getAttribute(_31[x]);
if(_32){
this.attributes[_31[x]]=_32;
}
}
}
}
},addAttribute:function(_33,_34){
this.attributes[_33]=_34;
},getAttribute:function(_35){
return this.attributes[_35];
},_getAttributeNames:function(_36){
var _37=[];
for(var i=0;i<_36.attributes.length;i++){
_37.push(_36.attributes[i].nodeName);
}
return _37;
},toString:function(){
var xml=[];
var x;
var _38=(this.shortNs?this.shortNs+":":"")+this.name;
var _39=(this.name=="#cdata-section");
if(_39){
xml.push("<![CDATA[");
xml.push(this.textContent);
xml.push("]]>");
}else{
xml.push("<");
xml.push(_38);
if(this.name_space){
xml.push(" xmlns='"+this.name_space+"'");
}
if(this.attributes){
for(x in this.attributes){
xml.push(" "+x+"='"+this.attributes[x]+"'");
}
}
if(this.content){
xml.push(">");
for(x in this.content){
xml.push(this.content[x]);
}
xml.push("</"+_38+">\n");
}else{
xml.push("/>\n");
}
}
return xml.join("");
},addContent:function(_3a){
this.content.push(_3a);
}});
_1.declare("dojox.atom.io.model.AtomItem",_3.atom.io.model.Node,{constructor:function(_3b){
this.ATOM_URI=_3.atom.io.model._Constants.ATOM_URI;
this.links=null;
this.authors=null;
this.categories=null;
this.contributors=null;
this.icon=this.id=this.logo=this.xmlBase=this.rights=null;
this.subtitle=this.title=null;
this.updated=this.published=null;
this.issued=this.modified=null;
this.content=null;
this.extensions=null;
this.entries=null;
this.name_spaces={};
this._objName="AtomItem";
},_getAttributeNames:function(){
return null;
},_accepts:{},accept:function(tag){
return Boolean(this._accepts[tag]);
},_postBuild:function(){
},buildFromDom:function(_3c){
var i,c,n;
for(i=0;i<_3c.attributes.length;i++){
c=_3c.attributes.item(i);
n=_3.atom.io.model.util.getNodename(c);
if(c.prefix=="xmlns"&&c.prefix!=n){
this.addNamespace(c.nodeValue,n);
}
}
c=_3c.childNodes;
for(i=0;i<c.length;i++){
if(c[i].nodeType==1){
var _3d=_3.atom.io.model.util.getNodename(c[i]);
if(!_3d){
continue;
}
if(c[i].namespaceURI!=_3.atom.io.model._Constants.ATOM_NS&&_3d!="#text"){
if(!this.extensions){
this.extensions=[];
}
var _3e=new _3.atom.io.model.Node();
_3e.buildFromDom(c[i]);
this.extensions.push(_3e);
}
if(!this.accept(_3d.toLowerCase())){
continue;
}
var fn=_3.atom.io.model._actions[_3d];
if(fn){
fn(this,c[i]);
}
}
}
this._saveAttributes(_3c);
if(this._postBuild){
this._postBuild();
}
},addNamespace:function(_3f,_40){
if(_3f&&_40){
this.name_spaces[_40]=_3f;
}
},addAuthor:function(_41,_42,uri){
if(!this.authors){
this.authors=[];
}
this.authors.push(new _3.atom.io.model.Person("author",_41,_42,uri));
},addContributor:function(_43,_44,uri){
if(!this.contributors){
this.contributors=[];
}
this.contributors.push(new _3.atom.io.model.Person("contributor",_43,_44,uri));
},addLink:function(_45,rel,_46,_47,_48){
if(!this.links){
this.links=[];
}
this.links.push(new _3.atom.io.model.Link(_45,rel,_46,_47,_48));
},removeLink:function(_49,rel){
if(!this.links||!_1.isArray(this.links)){
return;
}
var _4a=0;
for(var i=0;i<this.links.length;i++){
if((!_49||this.links[i].href===_49)&&(!rel||this.links[i].rel===rel)){
this.links.splice(i,1);
_4a++;
}
}
return _4a;
},removeBasicLinks:function(){
if(!this.links){
return;
}
var _4b=0;
for(var i=0;i<this.links.length;i++){
if(!this.links[i].rel){
this.links.splice(i,1);
_4b++;
i--;
}
}
return _4b;
},addCategory:function(_4c,_4d,_4e){
if(!this.categories){
this.categories=[];
}
this.categories.push(new _3.atom.io.model.Category(_4c,_4d,_4e));
},getCategories:function(_4f){
if(!_4f){
return this.categories;
}
var arr=[];
for(var x in this.categories){
if(this.categories[x].scheme===_4f){
arr.push(this.categories[x]);
}
}
return arr;
},removeCategories:function(_50,_51){
if(!this.categories){
return;
}
var _52=0;
for(var i=0;i<this.categories.length;i++){
if((!_50||this.categories[i].scheme===_50)&&(!_51||this.categories[i].term===_51)){
this.categories.splice(i,1);
_52++;
i--;
}
}
return _52;
},setTitle:function(str,_53){
if(!str){
return;
}
this.title=new _3.atom.io.model.Content("title");
this.title.value=str;
if(_53){
this.title.type=_53;
}
},addExtension:function(_54,_55,_56,_57,_58){
if(!this.extensions){
this.extensions=[];
}
this.extensions.push(new _3.atom.io.model.Node(_54,_55,_56,_57,_58||"ns"+this.extensions.length));
},getExtensions:function(_59,_5a){
var arr=[];
if(!this.extensions){
return arr;
}
for(var x in this.extensions){
if((this.extensions[x].name_space===_59||this.extensions[x].shortNs===_59)&&(!_5a||this.extensions[x].name===_5a)){
arr.push(this.extensions[x]);
}
}
return arr;
},removeExtensions:function(_5b,_5c){
if(!this.extensions){
return;
}
for(var i=0;i<this.extensions.length;i++){
if((this.extensions[i].name_space==_5b||this.extensions[i].shortNs===_5b)&&this.extensions[i].name===_5c){
this.extensions.splice(i,1);
i--;
}
}
},destroy:function(){
this.links=null;
this.authors=null;
this.categories=null;
this.contributors=null;
this.icon=this.id=this.logo=this.xmlBase=this.rights=null;
this.subtitle=this.title=null;
this.updated=this.published=null;
this.issued=this.modified=null;
this.content=null;
this.extensions=null;
this.entries=null;
}});
_1.declare("dojox.atom.io.model.Category",_3.atom.io.model.Node,{constructor:function(_5d,_5e,_5f){
this.scheme=_5d;
this.term=_5e;
this.label=_5f;
this._objName="Category";
},_postBuild:function(){
},_getAttributeNames:function(){
return ["label","scheme","term"];
},toString:function(){
var s=[];
s.push("<category ");
if(this.label){
s.push(" label=\""+this.label+"\" ");
}
if(this.scheme){
s.push(" scheme=\""+this.scheme+"\" ");
}
if(this.term){
s.push(" term=\""+this.term+"\" ");
}
s.push("/>\n");
return s.join("");
},buildFromDom:function(_60){
this._saveAttributes(_60);
this.label=this.attributes.label;
this.scheme=this.attributes.scheme;
this.term=this.attributes.term;
if(this._postBuild){
this._postBuild();
}
}});
_1.declare("dojox.atom.io.model.Content",_3.atom.io.model.Node,{constructor:function(_61,_62,src,_63,_64){
this.tagName=_61;
this.value=_62;
this.src=src;
this.type=_63;
this.xmlLang=_64;
this.HTML="html";
this.TEXT="text";
this.XHTML="xhtml";
this.XML="xml";
this._useTextContent="true";
},_getAttributeNames:function(){
return ["type","src"];
},_postBuild:function(){
},buildFromDom:function(_65){
var _66=_65.getAttribute("type");
if(_66){
_66=_66.toLowerCase();
if(_66=="xml"||"text/xml"){
_66=this.XML;
}
}else{
_66="text";
}
if(_66===this.XML){
if(_65.firstChild){
var i;
this.value="";
for(i=0;i<_65.childNodes.length;i++){
var c=_65.childNodes[i];
if(c){
this.value+=_3.xml.parser.innerXML(c);
}
}
}
}else{
if(_65.innerHTML){
this.value=_65.innerHTML;
}else{
this.value=_3.xml.parser.textContent(_65);
}
}
this._saveAttributes(_65);
if(this.attributes){
this.type=this.attributes.type;
this.scheme=this.attributes.scheme;
this.term=this.attributes.term;
}
if(!this.type){
this.type="text";
}
var _67=this.type.toLowerCase();
if(_67==="html"||_67==="text/html"||_67==="xhtml"||_67==="text/xhtml"){
this.value=this.value?_3.atom.io.model.util.unEscapeHtml(this.value):"";
}
if(this._postBuild){
this._postBuild();
}
},toString:function(){
var s=[];
s.push("<"+this.tagName+" ");
if(!this.type){
this.type="text";
}
if(this.type){
s.push(" type=\""+this.type+"\" ");
}
if(this.xmlLang){
s.push(" xml:lang=\""+this.xmlLang+"\" ");
}
if(this.xmlBase){
s.push(" xml:base=\""+this.xmlBase+"\" ");
}
if(this.type.toLowerCase()==this.HTML){
s.push(">"+_3.atom.io.model.util.escapeHtml(this.value)+"</"+this.tagName+">\n");
}else{
s.push(">"+this.value+"</"+this.tagName+">\n");
}
var ret=s.join("");
return ret;
}});
_1.declare("dojox.atom.io.model.Link",_3.atom.io.model.Node,{constructor:function(_68,rel,_69,_6a,_6b){
this.href=_68;
this.hrefLang=_69;
this.rel=rel;
this.title=_6a;
this.type=_6b;
},_getAttributeNames:function(){
return ["href","jrefLang","rel","title","type"];
},_postBuild:function(){
},buildFromDom:function(_6c){
this._saveAttributes(_6c);
this.href=this.attributes.href;
this.hrefLang=this.attributes.hreflang;
this.rel=this.attributes.rel;
this.title=this.attributes.title;
this.type=this.attributes.type;
if(this._postBuild){
this._postBuild();
}
},toString:function(){
var s=[];
s.push("<link ");
if(this.href){
s.push(" href=\""+this.href+"\" ");
}
if(this.hrefLang){
s.push(" hrefLang=\""+this.hrefLang+"\" ");
}
if(this.rel){
s.push(" rel=\""+this.rel+"\" ");
}
if(this.title){
s.push(" title=\""+this.title+"\" ");
}
if(this.type){
s.push(" type = \""+this.type+"\" ");
}
s.push("/>\n");
return s.join("");
}});
_1.declare("dojox.atom.io.model.Person",_3.atom.io.model.Node,{constructor:function(_6d,_6e,_6f,uri){
this.author="author";
this.contributor="contributor";
if(!_6d){
_6d=this.author;
}
this.personType=_6d;
this.name=_6e||"";
this.email=_6f||"";
this.uri=uri||"";
this._objName="Person";
},_getAttributeNames:function(){
return null;
},_postBuild:function(){
},accept:function(tag){
return Boolean(this._accepts[tag]);
},buildFromDom:function(_70){
var c=_70.childNodes;
for(var i=0;i<c.length;i++){
var _71=_3.atom.io.model.util.getNodename(c[i]);
if(!_71){
continue;
}
if(c[i].namespaceURI!=_3.atom.io.model._Constants.ATOM_NS&&_71!="#text"){
if(!this.extensions){
this.extensions=[];
}
var _72=new _3.atom.io.model.Node();
_72.buildFromDom(c[i]);
this.extensions.push(_72);
}
if(!this.accept(_71.toLowerCase())){
continue;
}
var fn=_3.atom.io.model._actions[_71];
if(fn){
fn(this,c[i]);
}
}
this._saveAttributes(_70);
if(this._postBuild){
this._postBuild();
}
},_accepts:{"name":true,"uri":true,"email":true},toString:function(){
var s=[];
s.push("<"+this.personType+">\n");
if(this.name){
s.push("\t<name>"+this.name+"</name>\n");
}
if(this.email){
s.push("\t<email>"+this.email+"</email>\n");
}
if(this.uri){
s.push("\t<uri>"+this.uri+"</uri>\n");
}
s.push("</"+this.personType+">\n");
return s.join("");
}});
_1.declare("dojox.atom.io.model.Generator",_3.atom.io.model.Node,{constructor:function(uri,_73,_74){
this.uri=uri;
this.version=_73;
this.value=_74;
},_postBuild:function(){
},buildFromDom:function(_75){
this.value=_3.xml.parser.textContent(_75);
this._saveAttributes(_75);
this.uri=this.attributes.uri;
this.version=this.attributes.version;
if(this._postBuild){
this._postBuild();
}
},toString:function(){
var s=[];
s.push("<generator ");
if(this.uri){
s.push(" uri=\""+this.uri+"\" ");
}
if(this.version){
s.push(" version=\""+this.version+"\" ");
}
s.push(">"+this.value+"</generator>\n");
var ret=s.join("");
return ret;
}});
_1.declare("dojox.atom.io.model.Entry",_3.atom.io.model.AtomItem,{constructor:function(id){
this.id=id;
this._objName="Entry";
this.feedUrl=null;
},_getAttributeNames:function(){
return null;
},_accepts:{"author":true,"content":true,"category":true,"contributor":true,"created":true,"id":true,"link":true,"published":true,"rights":true,"summary":true,"title":true,"updated":true,"xmlbase":true,"issued":true,"modified":true},toString:function(_76){
var s=[];
var i;
if(_76){
s.push("<?xml version='1.0' encoding='UTF-8'?>");
s.push("<entry xmlns='"+_3.atom.io.model._Constants.ATOM_URI+"'");
}else{
s.push("<entry");
}
if(this.xmlBase){
s.push(" xml:base=\""+this.xmlBase+"\" ");
}
for(i in this.name_spaces){
s.push(" xmlns:"+i+"=\""+this.name_spaces[i]+"\"");
}
s.push(">\n");
s.push("<id>"+(this.id?this.id:"")+"</id>\n");
if(this.issued&&!this.published){
this.published=this.issued;
}
if(this.published){
s.push("<published>"+_1.date.stamp.toISOString(this.published)+"</published>\n");
}
if(this.created){
s.push("<created>"+_1.date.stamp.toISOString(this.created)+"</created>\n");
}
if(this.issued){
s.push("<issued>"+_1.date.stamp.toISOString(this.issued)+"</issued>\n");
}
if(this.modified){
s.push("<modified>"+_1.date.stamp.toISOString(this.modified)+"</modified>\n");
}
if(this.modified&&!this.updated){
this.updated=this.modified;
}
if(this.updated){
s.push("<updated>"+_1.date.stamp.toISOString(this.updated)+"</updated>\n");
}
if(this.rights){
s.push("<rights>"+this.rights+"</rights>\n");
}
if(this.title){
s.push(this.title.toString());
}
if(this.summary){
s.push(this.summary.toString());
}
var _77=[this.authors,this.categories,this.links,this.contributors,this.extensions];
for(var x in _77){
if(_77[x]){
for(var y in _77[x]){
s.push(_77[x][y]);
}
}
}
if(this.content){
s.push(this.content.toString());
}
s.push("</entry>\n");
return s.join("");
},getEditHref:function(){
if(this.links===null||this.links.length===0){
return null;
}
for(var x in this.links){
if(this.links[x].rel&&this.links[x].rel=="edit"){
return this.links[x].href;
}
}
return null;
},setEditHref:function(url){
if(this.links===null){
this.links=[];
}
for(var x in this.links){
if(this.links[x].rel&&this.links[x].rel=="edit"){
this.links[x].href=url;
return;
}
}
this.addLink(url,"edit");
}});
_1.declare("dojox.atom.io.model.Feed",_3.atom.io.model.AtomItem,{_accepts:{"author":true,"content":true,"category":true,"contributor":true,"created":true,"id":true,"link":true,"published":true,"rights":true,"summary":true,"title":true,"updated":true,"xmlbase":true,"entry":true,"logo":true,"issued":true,"modified":true,"icon":true,"subtitle":true},addEntry:function(_78){
if(!_78.id){
throw new Error("The entry object must be assigned an ID attribute.");
}
if(!this.entries){
this.entries=[];
}
_78.feedUrl=this.getSelfHref();
this.entries.push(_78);
},getFirstEntry:function(){
if(!this.entries||this.entries.length===0){
return null;
}
return this.entries[0];
},getEntry:function(_79){
if(!this.entries){
return null;
}
for(var x in this.entries){
if(this.entries[x].id==_79){
return this.entries[x];
}
}
return null;
},removeEntry:function(_7a){
if(!this.entries){
return;
}
var _7b=0;
for(var i=0;i<this.entries.length;i++){
if(this.entries[i]===_7a){
this.entries.splice(i,1);
_7b++;
}
}
return _7b;
},setEntries:function(_7c){
for(var x in _7c){
this.addEntry(_7c[x]);
}
},toString:function(){
var s=[];
var i;
s.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
s.push("<feed xmlns=\""+_3.atom.io.model._Constants.ATOM_URI+"\"");
if(this.xmlBase){
s.push(" xml:base=\""+this.xmlBase+"\"");
}
for(i in this.name_spaces){
s.push(" xmlns:"+i+"=\""+this.name_spaces[i]+"\"");
}
s.push(">\n");
s.push("<id>"+(this.id?this.id:"")+"</id>\n");
if(this.title){
s.push(this.title);
}
if(this.copyright&&!this.rights){
this.rights=this.copyright;
}
if(this.rights){
s.push("<rights>"+this.rights+"</rights>\n");
}
if(this.issued){
s.push("<issued>"+_1.date.stamp.toISOString(this.issued)+"</issued>\n");
}
if(this.modified){
s.push("<modified>"+_1.date.stamp.toISOString(this.modified)+"</modified>\n");
}
if(this.modified&&!this.updated){
this.updated=this.modified;
}
if(this.updated){
s.push("<updated>"+_1.date.stamp.toISOString(this.updated)+"</updated>\n");
}
if(this.published){
s.push("<published>"+_1.date.stamp.toISOString(this.published)+"</published>\n");
}
if(this.icon){
s.push("<icon>"+this.icon+"</icon>\n");
}
if(this.language){
s.push("<language>"+this.language+"</language>\n");
}
if(this.logo){
s.push("<logo>"+this.logo+"</logo>\n");
}
if(this.subtitle){
s.push(this.subtitle.toString());
}
if(this.tagline){
s.push(this.tagline.toString());
}
var _7d=[this.alternateLinks,this.authors,this.categories,this.contributors,this.otherLinks,this.extensions,this.entries];
for(i in _7d){
if(_7d[i]){
for(var x in _7d[i]){
s.push(_7d[i][x]);
}
}
}
s.push("</feed>");
return s.join("");
},createEntry:function(){
var _7e=new _3.atom.io.model.Entry();
_7e.feedUrl=this.getSelfHref();
return _7e;
},getSelfHref:function(){
if(this.links===null||this.links.length===0){
return null;
}
for(var x in this.links){
if(this.links[x].rel&&this.links[x].rel=="self"){
return this.links[x].href;
}
}
return null;
}});
_1.declare("dojox.atom.io.model.Service",_3.atom.io.model.AtomItem,{constructor:function(_7f){
this.href=_7f;
},buildFromDom:function(_80){
var i;
this.workspaces=[];
if(_80.tagName!="service"){
return;
}
if(_80.namespaceURI!=_3.atom.io.model._Constants.PURL_NS&&_80.namespaceURI!=_3.atom.io.model._Constants.APP_NS){
return;
}
var ns=_80.namespaceURI;
this.name_space=_80.namespaceURI;
var _81;
if(typeof (_80.getElementsByTagNameNS)!="undefined"){
_81=_80.getElementsByTagNameNS(ns,"workspace");
}else{
_81=[];
var _82=_80.getElementsByTagName("workspace");
for(i=0;i<_82.length;i++){
if(_82[i].namespaceURI==ns){
_81.push(_82[i]);
}
}
}
if(_81&&_81.length>0){
var _83=0;
var _84;
for(i=0;i<_81.length;i++){
_84=(typeof (_81.item)==="undefined"?_81[i]:_81.item(i));
var _85=new _3.atom.io.model.Workspace();
_85.buildFromDom(_84);
this.workspaces[_83++]=_85;
}
}
},getCollection:function(url){
for(var i=0;i<this.workspaces.length;i++){
var _86=this.workspaces[i].collections;
for(var j=0;j<_86.length;j++){
if(_86[j].href==url){
return _86;
}
}
}
return null;
}});
_1.declare("dojox.atom.io.model.Workspace",_3.atom.io.model.AtomItem,{constructor:function(_87){
this.title=_87;
this.collections=[];
},buildFromDom:function(_88){
var _89=_3.atom.io.model.util.getNodename(_88);
if(_89!="workspace"){
return;
}
var c=_88.childNodes;
var len=0;
for(var i=0;i<c.length;i++){
var _8a=c[i];
if(_8a.nodeType===1){
_89=_3.atom.io.model.util.getNodename(_8a);
if(_8a.namespaceURI==_3.atom.io.model._Constants.PURL_NS||_8a.namespaceURI==_3.atom.io.model._Constants.APP_NS){
if(_89==="collection"){
var _8b=new _3.atom.io.model.Collection();
_8b.buildFromDom(_8a);
this.collections[len++]=_8b;
}
}else{
if(_8a.namespaceURI===_3.atom.io.model._Constants.ATOM_NS){
if(_89==="title"){
this.title=_3.xml.parser.textContent(_8a);
}
}
}
}
}
}});
_1.declare("dojox.atom.io.model.Collection",_3.atom.io.model.AtomItem,{constructor:function(_8c,_8d){
this.href=_8c;
this.title=_8d;
this.attributes=[];
this.features=[];
this.children=[];
this.memberType=null;
this.id=null;
},buildFromDom:function(_8e){
this.href=_8e.getAttribute("href");
var c=_8e.childNodes;
for(var i=0;i<c.length;i++){
var _8f=c[i];
if(_8f.nodeType===1){
var _90=_3.atom.io.model.util.getNodename(_8f);
if(_8f.namespaceURI==_3.atom.io.model._Constants.PURL_NS||_8f.namespaceURI==_3.atom.io.model._Constants.APP_NS){
if(_90==="member-type"){
this.memberType=_3.xml.parser.textContent(_8f);
}else{
if(_90=="feature"){
if(_8f.getAttribute("id")){
this.features.push(_8f.getAttribute("id"));
}
}else{
var _91=new _3.atom.io.model.Node();
_91.buildFromDom(_8f);
this.children.push(_91);
}
}
}else{
if(_8f.namespaceURI===_3.atom.io.model._Constants.ATOM_NS){
if(_90==="id"){
this.id=_3.xml.parser.textContent(_8f);
}else{
if(_90==="title"){
this.title=_3.xml.parser.textContent(_8f);
}
}
}
}
}
}
}});
return _1.getObject("dojox.atom.io.model");
});
require(["dojox/atom/io/model"]);
