/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/_base",["dojo/_base/kernel","dojo/_base/lang","dojox/string/tokenize","dojo/_base/json","dojo/_base/html","dojox/string/Builder"],function(_1,_2,_3){
_1.experimental("dojox.dtl");
_1.getObject("dtl",true,dojox);
(dojox.dtl._base=function(){
var dd=dojox.dtl;
dd.TOKEN_BLOCK=-1;
dd.TOKEN_VAR=-2;
dd.TOKEN_COMMENT=-3;
dd.TOKEN_TEXT=3;
dd._Context=_1.extend(function(_4){
if(_4){
_1._mixin(this,_4);
if(_4.get){
this._getter=_4.get;
delete this.get;
}
}
},{push:function(){
var _5=this;
var _6=_1.delegate(this);
_6.pop=function(){
return _5;
};
return _6;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(_7,_8){
var n=this._normalize;
if(this._getter){
var _9=this._getter(_7);
if(typeof _9!="undefined"){
return n(_9);
}
}
if(typeof this[_7]!="undefined"){
return n(this[_7]);
}
return _8;
},_normalize:function(_a){
if(_a instanceof Date){
_a.year=_a.getFullYear();
_a.month=_a.getMonth()+1;
_a.day=_a.getDate();
_a.date=_a.year+"-"+("0"+_a.month).slice(-2)+"-"+("0"+_a.day).slice(-2);
_a.hour=_a.getHours();
_a.minute=_a.getMinutes();
_a.second=_a.getSeconds();
_a.microsecond=_a.getMilliseconds();
}
return _a;
},update:function(_b){
var _c=this.push();
if(_b){
_1._mixin(this,_b);
}
return _c;
}});
var _d=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _e=/\s+/g;
var _f=function(_10,_11){
_10=_10||_e;
if(!(_10 instanceof RegExp)){
_10=new RegExp(_10,"g");
}
if(!_10.global){
throw new Error("You must use a globally flagged RegExp with split "+_10);
}
_10.exec("");
var _12,_13=[],_14=0,i=0;
while(_12=_10.exec(this)){
_13.push(this.slice(_14,_10.lastIndex-_12[0].length));
_14=_10.lastIndex;
if(_11&&(++i>_11-1)){
break;
}
}
_13.push(this.slice(_14));
return _13;
};
dd.Token=function(_15,_16){
this.token_type=_15;
this.contents=new String(_1.trim(_16));
this.contents.split=_f;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(_17){
var bit,_18=[],i=0;
_17=_17||999;
while(i++<_17&&(bit=_d.exec(this.contents))){
bit=bit[0];
if(bit.charAt(0)=="\""&&bit.slice(-1)=="\""){
_18.push("\""+bit.slice(1,-1).replace("\\\"","\"").replace("\\\\","\\")+"\"");
}else{
if(bit.charAt(0)=="'"&&bit.slice(-1)=="'"){
_18.push("'"+bit.slice(1,-1).replace("\\'","'").replace("\\\\","\\")+"'");
}else{
_18.push(bit);
}
}
}
return _18;
};
var ddt=dd.text={_get:function(_19,_1a,_1b){
var _1c=dd.register.get(_19,_1a.toLowerCase(),_1b);
if(!_1c){
if(!_1b){
throw new Error("No tag found for "+_1a);
}
return null;
}
var fn=_1c[1];
var _1d=_1c[2];
var _1e;
if(fn.indexOf(":")!=-1){
_1e=fn.split(":");
fn=_1e.pop();
}
_1["require"](_1d);
var _1f=_1.getObject(_1d);
return _1f[fn||_1a]||_1f[_1a+"_"]||_1f[fn+"_"];
},getTag:function(_20,_21){
return ddt._get("tag",_20,_21);
},getFilter:function(_22,_23){
return ddt._get("filter",_22,_23);
},getTemplate:function(_24){
return new dd.Template(ddt.getTemplateString(_24));
},getTemplateString:function(_25){
return _1._getText(_25.toString())||"";
},_resolveLazy:function(_26,_27,_28){
if(_27){
if(_28){
return _1.fromJson(_1._getText(_26))||{};
}else{
return dd.text.getTemplateString(_26);
}
}else{
return _1.xhrGet({handleAs:(_28)?"json":"text",url:_26});
}
},_resolveTemplateArg:function(arg,_29){
if(ddt._isTemplate(arg)){
if(!_29){
var d=new _1.Deferred();
d.callback(arg);
return d;
}
return arg;
}
return ddt._resolveLazy(arg,_29);
},_isTemplate:function(arg){
return (typeof arg=="undefined")||(typeof arg=="string"&&(arg.match(/^\s*[<{]/)||arg.indexOf(" ")!=-1));
},_resolveContextArg:function(arg,_2a){
if(arg.constructor==Object){
if(!_2a){
var d=new _1.Deferred;
d.callback(arg);
return d;
}
return arg;
}
return ddt._resolveLazy(arg,_2a,true);
},_re:/(?:\{\{\s*(.+?)\s*\}\}|\{%\s*(load\s*)?(.+?)\s*%\})/g,tokenize:function(str){
return _3(str,ddt._re,ddt._parseDelims);
},_parseDelims:function(_2b,_2c,tag){
if(_2b){
return [dd.TOKEN_VAR,_2b];
}else{
if(_2c){
var _2d=_1.trim(tag).split(/\s+/g);
for(var i=0,_2e;_2e=_2d[i];i++){
_1["require"](_2e);
}
}else{
return [dd.TOKEN_BLOCK,tag];
}
}
}};
dd.Template=_1.extend(function(_2f,_30){
var str=_30?_2f:ddt._resolveTemplateArg(_2f,true)||"";
var _31=ddt.tokenize(str);
var _32=new dd._Parser(_31);
this.nodelist=_32.parse();
},{update:function(_33,_34){
return ddt._resolveContextArg(_34).addCallback(this,function(_35){
var _36=this.render(new dd._Context(_35));
if(_33.forEach){
_33.forEach(function(_37){
_37.innerHTML=_36;
});
}else{
_1.byId(_33).innerHTML=_36;
}
return this;
});
},render:function(_38,_39){
_39=_39||this.getBuffer();
_38=_38||new dd._Context({});
return this.nodelist.render(_38,_39)+"";
},getBuffer:function(){
return new dojox.string.Builder();
}});
var _3a=/\{\{\s*(.+?)\s*\}\}/g;
dd.quickFilter=function(str){
if(!str){
return new dd._NodeList();
}
if(str.indexOf("{%")==-1){
return new dd._QuickNodeList(_3(str,_3a,function(_3b){
return new dd._Filter(_3b);
}));
}
};
dd._QuickNodeList=_1.extend(function(_3c){
this.contents=_3c;
},{render:function(_3d,_3e){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_3e=_3e.concat(this.contents[i].resolve(_3d));
}else{
_3e=_3e.concat(this.contents[i]);
}
}
return _3e;
},dummyRender:function(_3f){
return this.render(_3f,dd.Template.prototype.getBuffer()).toString();
},clone:function(_40){
return this;
}});
dd._Filter=_1.extend(function(_41){
if(!_41){
throw new Error("Filter must be called with variable name");
}
this.contents=_41;
var _42=this._cache[_41];
if(_42){
this.key=_42[0];
this.filters=_42[1];
}else{
this.filters=[];
_3(_41,this._re,this._tokenize,this);
this._cache[_41]=[this.key,this.filters];
}
},{_cache:{},_re:/(?:^_\("([^\\"]*(?:\\.[^\\"])*)"\)|^"([^\\"]*(?:\\.[^\\"]*)*)"|^([a-zA-Z0-9_.]+)|\|(\w+)(?::(?:_\("([^\\"]*(?:\\.[^\\"])*)"\)|"([^\\"]*(?:\\.[^\\"]*)*)"|([a-zA-Z0-9_.]+)|'([^\\']*(?:\\.[^\\']*)*)'))?|^'([^\\']*(?:\\.[^\\']*)*)')/g,_values:{0:"\"",1:"\"",2:"",8:"\""},_args:{4:"\"",5:"\"",6:"",7:"'"},_tokenize:function(){
var pos,arg;
for(var i=0,has=[];i<arguments.length;i++){
has[i]=(typeof arguments[i]!="undefined"&&typeof arguments[i]=="string"&&arguments[i]);
}
if(!this.key){
for(pos in this._values){
if(has[pos]){
this.key=this._values[pos]+arguments[pos]+this._values[pos];
break;
}
}
}else{
for(pos in this._args){
if(has[pos]){
var _43=arguments[pos];
if(this._args[pos]=="'"){
_43=_43.replace(/\\'/g,"'");
}else{
if(this._args[pos]=="\""){
_43=_43.replace(/\\"/g,"\"");
}
}
arg=[!this._args[pos],_43];
break;
}
}
var fn=ddt.getFilter(arguments[3]);
if(!_1.isFunction(fn)){
throw new Error(arguments[3]+" is not registered as a filter");
}
this.filters.push([fn,arg]);
}
},getExpression:function(){
return this.contents;
},resolve:function(_44){
if(typeof this.key=="undefined"){
return "";
}
var str=this.resolvePath(this.key,_44);
for(var i=0,_45;_45=this.filters[i];i++){
if(_45[1]){
if(_45[1][0]){
str=_45[0](str,this.resolvePath(_45[1][1],_44));
}else{
str=_45[0](str,_45[1][1]);
}
}else{
str=_45[0](str);
}
}
return str;
},resolvePath:function(_46,_47){
var _48,_49;
var _4a=_46.charAt(0);
var _4b=_46.slice(-1);
if(!isNaN(parseInt(_4a))){
_48=(_46.indexOf(".")==-1)?parseInt(_46):parseFloat(_46);
}else{
if(_4a=="\""&&_4a==_4b){
_48=_46.slice(1,-1);
}else{
if(_46=="true"){
return true;
}
if(_46=="false"){
return false;
}
if(_46=="null"||_46=="None"){
return null;
}
_49=_46.split(".");
_48=_47.get(_49[0]);
if(_1.isFunction(_48)){
var _4c=_47.getThis&&_47.getThis();
if(_48.alters_data){
_48="";
}else{
if(_4c){
_48=_48.call(_4c);
}else{
_48="";
}
}
}
for(var i=1;i<_49.length;i++){
var _4d=_49[i];
if(_48){
var _4e=_48;
if(_1.isObject(_48)&&_4d=="items"&&typeof _48[_4d]=="undefined"){
var _4f=[];
for(var key in _48){
_4f.push([key,_48[key]]);
}
_48=_4f;
continue;
}
if(_48.get&&_1.isFunction(_48.get)&&_48.get.safe){
_48=_48.get(_4d);
}else{
if(typeof _48[_4d]=="undefined"){
_48=_48[_4d];
break;
}else{
_48=_48[_4d];
}
}
if(_1.isFunction(_48)){
if(_48.alters_data){
_48="";
}else{
_48=_48.call(_4e);
}
}else{
if(_48 instanceof Date){
_48=dd._Context.prototype._normalize(_48);
}
}
}else{
return "";
}
}
}
}
return _48;
}});
dd._TextNode=dd._Node=_1.extend(function(obj){
this.contents=obj;
},{set:function(_50){
this.contents=_50;
return this;
},render:function(_51,_52){
return _52.concat(this.contents);
},isEmpty:function(){
return !_1.trim(this.contents);
},clone:function(){
return this;
}});
dd._NodeList=_1.extend(function(_53){
this.contents=_53||[];
this.last="";
},{push:function(_54){
this.contents.push(_54);
return this;
},concat:function(_55){
this.contents=this.contents.concat(_55);
return this;
},render:function(_56,_57){
for(var i=0;i<this.contents.length;i++){
_57=this.contents[i].render(_56,_57);
if(!_57){
throw new Error("Template must return buffer");
}
}
return _57;
},dummyRender:function(_58){
return this.render(_58,dd.Template.prototype.getBuffer()).toString();
},unrender:function(){
return arguments[1];
},clone:function(){
return this;
},rtrim:function(){
while(1){
i=this.contents.length-1;
if(this.contents[i] instanceof dd._TextNode&&this.contents[i].isEmpty()){
this.contents.pop();
}else{
break;
}
}
return this;
}});
dd._VarNode=_1.extend(function(str){
this.contents=new dd._Filter(str);
},{render:function(_59,_5a){
var str=this.contents.resolve(_59);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _5a.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=_1.extend(function(_5b){
this.contents=_5b;
},{i:0,parse:function(_5c){
var _5d={},_5e;
_5c=_5c||[];
for(var i=0;i<_5c.length;i++){
_5d[_5c[i]]=true;
}
var _5f=new dd._NodeList();
while(this.i<this.contents.length){
_5e=this.contents[this.i++];
if(typeof _5e=="string"){
_5f.push(new dd._TextNode(_5e));
}else{
var _60=_5e[0];
var _61=_5e[1];
if(_60==dd.TOKEN_VAR){
_5f.push(new dd._VarNode(_61));
}else{
if(_60==dd.TOKEN_BLOCK){
if(_5d[_61]){
--this.i;
return _5f;
}
var cmd=_61.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_5f.push(fn(this,new dd.Token(_60,_61)));
}
}
}
}
}
}
if(_5c.length){
throw new Error("Could not find closing tag(s): "+_5c.toString());
}
this.contents.length=0;
return _5f;
},next_token:function(){
var _62=this.contents[this.i++];
return new dd.Token(_62[0],_62[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_63){
while(this.i<this.contents.length){
var _64=this.contents[this.i++];
if(_64[0]==dd.TOKEN_BLOCK&&_64[1]==_63){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_63);
},create_variable_node:function(_65){
return new dd._VarNode(_65);
},create_text_node:function(_66){
return new dd._TextNode(_66||"");
},getTemplate:function(_67){
return new dd.Template(_67);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_68,_69){
var _6a=dd.register._registry[_68+"s"];
for(var i=0,_6b;_6b=_6a[i];i++){
if(typeof _6b[0]=="string"){
if(_6b[0]==_69){
return _6b;
}
}else{
if(_69.match(_6b[0])){
return _6b;
}
}
}
},getAttributeTags:function(){
var _6c=[];
var _6d=dd.register._registry.attributes;
for(var i=0,_6e;_6e=_6d[i];i++){
if(_6e.length==3){
_6c.push(_6e);
}else{
var fn=_1.getObject(_6e[1]);
if(fn&&_1.isFunction(fn)){
_6e.push(fn);
_6c.push(_6e);
}
}
}
return _6c;
},_any:function(_6f,_70,_71){
for(var _72 in _71){
for(var i=0,fn;fn=_71[_72][i];i++){
var key=fn;
if(_1.isArray(fn)){
key=fn[0];
fn=fn[1];
}
if(typeof key=="string"){
if(key.substr(0,5)=="attr:"){
var _73=fn;
if(_73.substr(0,5)=="attr:"){
_73=_73.slice(5);
}
dd.register._registry.attributes.push([_73.toLowerCase(),_70+"."+_72+"."+_73]);
}
key=key.toLowerCase();
}
dd.register._registry[_6f].push([key,fn,_70+"."+_72]);
}
}
},tags:function(_74,_75){
dd.register._any("tags",_74,_75);
},filters:function(_76,_77){
dd.register._any("filters",_76,_77);
}};
var _78=/&/g;
var _79=/</g;
var _7a=/>/g;
var _7b=/'/g;
var _7c=/"/g;
dd._base.escape=function(_7d){
return dd.mark_safe(_7d.replace(_78,"&amp;").replace(_79,"&lt;").replace(_7a,"&gt;").replace(_7c,"&quot;").replace(_7b,"&#39;"));
};
dd._base.safe=function(_7e){
if(typeof _7e=="string"){
_7e=new String(_7e);
}
if(typeof _7e=="object"){
_7e.safe=true;
}
return _7e;
};
dd.mark_safe=dd._base.safe;
dd.register.tags("dojox.dtl.tag",{"date":["now"],"logic":["if","for","ifequal","ifnotequal"],"loader":["extends","block","include","load","ssi"],"misc":["comment","debug","filter","firstof","spaceless","templatetag","widthratio","with"],"loop":["cycle","ifchanged","regroup"]});
dd.register.filters("dojox.dtl.filter",{"dates":["date","time","timesince","timeuntil"],"htmlstrings":["linebreaks","linebreaksbr","removetags","striptags"],"integers":["add","get_digit"],"lists":["dictsort","dictsortreversed","first","join","length","length_is","random","slice","unordered_list"],"logic":["default","default_if_none","divisibleby","yesno"],"misc":["filesizeformat","pluralize","phone2numeric","pprint"],"strings":["addslashes","capfirst","center","cut","fix_ampersands","floatformat","iriencode","linenumbers","ljust","lower","make_list","rjust","slugify","stringformat","title","truncatewords","truncatewords_html","upper","urlencode","urlize","urlizetrunc","wordcount","wordwrap"]});
dd.register.filters("dojox.dtl",{"_base":["escape","safe"]});
})();
return dojox.dtl;
});
