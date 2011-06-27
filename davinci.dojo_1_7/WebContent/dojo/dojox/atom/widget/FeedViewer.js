/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/atom/widget/FeedViewer",["dojo","dijit","dojox","dijit/_Widget","dijit/_Templated","dijit/_Container","dojox/atom/io/Connection","dojo/i18n","dojox/atom/widget/nls/FeedViewerEntry"],function(_1,_2,_3){
_1.getObject("dojox.atom.widget.FeedViewer",1);
_1.requireLocalization("dojox.atom.widget","FeedViewerEntry");
_1.experimental("dojox.atom.widget.FeedViewer");
_1.declare("dojox.atom.widget.FeedViewer",[_2._Widget,_2._Templated,_2._Container],{feedViewerTableBody:null,feedViewerTable:null,entrySelectionTopic:"",url:"",xmethod:false,localSaveOnly:false,templateString:_1.cache("dojox.atom","widget/templates/FeedViewer.html","<div class=\"feedViewerContainer\" dojoAttachPoint=\"feedViewerContainerNode\">\n\t<table cellspacing=\"0\" cellpadding=\"0\" class=\"feedViewerTable\">\n\t\t<tbody dojoAttachPoint=\"feedViewerTableBody\" class=\"feedViewerTableBody\">\n\t\t</tbody>\n\t</table>\n</div>\n"),_feed:null,_currentSelection:null,_includeFilters:null,alertsEnabled:false,postCreate:function(){
this._includeFilters=[];
if(this.entrySelectionTopic!==""){
this._subscriptions=[_1.subscribe(this.entrySelectionTopic,this,"_handleEvent")];
}
this.atomIO=new _3.atom.io.Connection();
this.childWidgets=[];
},startup:function(){
this.containerNode=this.feedViewerTableBody;
var _4=this.getDescendants();
for(var i in _4){
var _5=_4[i];
if(_5&&_5.isFilter){
this._includeFilters.push(new _3.atom.widget.FeedViewer.CategoryIncludeFilter(_5.scheme,_5.term,_5.label));
_5.destroy();
}
}
if(this.url!==""){
this.setFeedFromUrl(this.url);
}
},clear:function(){
this.destroyDescendants();
},setFeedFromUrl:function(_6){
if(_6!==""){
if(this._isRelativeURL(_6)){
var _7="";
if(_6.charAt(0)!=="/"){
_7=this._calculateBaseURL(window.location.href,true);
}else{
_7=this._calculateBaseURL(window.location.href,false);
}
this.url=_7+_6;
}
this.atomIO.getFeed(_6,_1.hitch(this,this.setFeed));
}
},setFeed:function(_8){
this._feed=_8;
this.clear();
var _9=function(a,b){
var _a=this._displayDateForEntry(a);
var _b=this._displayDateForEntry(b);
if(_a>_b){
return -1;
}
if(_a<_b){
return 1;
}
return 0;
};
var _c=function(_d){
var _e=_d.split(",");
_e.pop();
return _e.join(",");
};
var _f=_8.entries.sort(_1.hitch(this,_9));
if(_8){
var _10=null;
for(var i=0;i<_f.length;i++){
var _11=_f[i];
if(this._isFilterAccepted(_11)){
var _12=this._displayDateForEntry(_11);
var _13="";
if(_12!==null){
_13=_c(_12.toLocaleString());
if(_13===""){
_13=""+(_12.getMonth()+1)+"/"+_12.getDate()+"/"+_12.getFullYear();
}
}
if((_10===null)||(_10!=_13)){
this.appendGrouping(_13);
_10=_13;
}
this.appendEntry(_11);
}
}
}
},_displayDateForEntry:function(_14){
if(_14.updated){
return _14.updated;
}
if(_14.modified){
return _14.modified;
}
if(_14.issued){
return _14.issued;
}
return new Date();
},appendGrouping:function(_15){
var _16=new _3.atom.widget.FeedViewerGrouping({});
_16.setText(_15);
this.addChild(_16);
this.childWidgets.push(_16);
},appendEntry:function(_17){
var _18=new _3.atom.widget.FeedViewerEntry({"xmethod":this.xmethod});
_18.setTitle(_17.title.value);
_18.setTime(this._displayDateForEntry(_17).toLocaleTimeString());
_18.entrySelectionTopic=this.entrySelectionTopic;
_18.feed=this;
this.addChild(_18);
this.childWidgets.push(_18);
this.connect(_18,"onClick","_rowSelected");
_17.domNode=_18.entryNode;
_17._entryWidget=_18;
_18.entry=_17;
},deleteEntry:function(_19){
if(!this.localSaveOnly){
this.atomIO.deleteEntry(_19.entry,_1.hitch(this,this._removeEntry,_19),null,this.xmethod);
}else{
this._removeEntry(_19,true);
}
_1.publish(this.entrySelectionTopic,[{action:"delete",source:this,entry:_19.entry}]);
},_removeEntry:function(_1a,_1b){
if(_1b){
var idx=_1.indexOf(this.childWidgets,_1a);
var _1c=this.childWidgets[idx-1];
var _1d=this.childWidgets[idx+1];
if(_1c.declaredClass==="dojox.atom.widget.FeedViewerGrouping"&&(_1d===undefined||_1d.declaredClass==="dojox.atom.widget.FeedViewerGrouping")){
_1c.destroy();
}
_1a.destroy();
}else{
}
},_rowSelected:function(evt){
var _1e=evt.target;
while(_1e){
if(_1e.attributes){
var _1f=_1e.attributes.getNamedItem("widgetid");
if(_1f&&_1f.value.indexOf("FeedViewerEntry")!=-1){
break;
}
}
_1e=_1e.parentNode;
}
for(var i=0;i<this._feed.entries.length;i++){
var _20=this._feed.entries[i];
if((_1e===_20.domNode)&&(this._currentSelection!==_20)){
_1.addClass(_20.domNode,"feedViewerEntrySelected");
_1.removeClass(_20._entryWidget.timeNode,"feedViewerEntryUpdated");
_1.addClass(_20._entryWidget.timeNode,"feedViewerEntryUpdatedSelected");
this.onEntrySelected(_20);
if(this.entrySelectionTopic!==""){
_1.publish(this.entrySelectionTopic,[{action:"set",source:this,feed:this._feed,entry:_20}]);
}
if(this._isEditable(_20)){
_20._entryWidget.enableDelete();
}
this._deselectCurrentSelection();
this._currentSelection=_20;
break;
}else{
if((_1e===_20.domNode)&&(this._currentSelection===_20)){
_1.publish(this.entrySelectionTopic,[{action:"delete",source:this,entry:_20}]);
this._deselectCurrentSelection();
break;
}
}
}
},_deselectCurrentSelection:function(){
if(this._currentSelection){
_1.addClass(this._currentSelection._entryWidget.timeNode,"feedViewerEntryUpdated");
_1.removeClass(this._currentSelection.domNode,"feedViewerEntrySelected");
_1.removeClass(this._currentSelection._entryWidget.timeNode,"feedViewerEntryUpdatedSelected");
this._currentSelection._entryWidget.disableDelete();
this._currentSelection=null;
}
},_isEditable:function(_21){
var _22=false;
if(_21&&_21!==null&&_21.links&&_21.links!==null){
for(var x in _21.links){
if(_21.links[x].rel&&_21.links[x].rel=="edit"){
_22=true;
break;
}
}
}
return _22;
},onEntrySelected:function(_23){
},_isRelativeURL:function(url){
var _24=function(url){
var _25=false;
if(url.indexOf("file://")===0){
_25=true;
}
return _25;
};
var _26=function(url){
var _27=false;
if(url.indexOf("http://")===0){
_27=true;
}
return _27;
};
var _28=false;
if(url!==null){
if(!_24(url)&&!_26(url)){
_28=true;
}
}
return _28;
},_calculateBaseURL:function(_29,_2a){
var _2b=null;
if(_29!==null){
var _2c=_29.indexOf("?");
if(_2c!=-1){
_29=_29.substring(0,_2c);
}
if(_2a){
_2c=_29.lastIndexOf("/");
if((_2c>0)&&(_2c<_29.length)&&(_2c!==(_29.length-1))){
_2b=_29.substring(0,(_2c+1));
}else{
_2b=_29;
}
}else{
_2c=_29.indexOf("://");
if(_2c>0){
_2c=_2c+3;
var _2d=_29.substring(0,_2c);
var _2e=_29.substring(_2c,_29.length);
_2c=_2e.indexOf("/");
if((_2c<_2e.length)&&(_2c>0)){
_2b=_2d+_2e.substring(0,_2c);
}else{
_2b=_2d+_2e;
}
}
}
}
return _2b;
},_isFilterAccepted:function(_2f){
var _30=false;
if(this._includeFilters&&(this._includeFilters.length>0)){
for(var i=0;i<this._includeFilters.length;i++){
var _31=this._includeFilters[i];
if(_31.match(_2f)){
_30=true;
break;
}
}
}else{
_30=true;
}
return _30;
},addCategoryIncludeFilter:function(_32){
if(_32){
var _33=_32.scheme;
var _34=_32.term;
var _35=_32.label;
var _36=true;
if(!_33){
_33=null;
}
if(!_34){
_33=null;
}
if(!_35){
_33=null;
}
if(this._includeFilters&&this._includeFilters.length>0){
for(var i=0;i<this._includeFilters.length;i++){
var _37=this._includeFilters[i];
if((_37.term===_34)&&(_37.scheme===_33)&&(_37.label===_35)){
_36=false;
break;
}
}
}
if(_36){
this._includeFilters.push(_3.atom.widget.FeedViewer.CategoryIncludeFilter(_33,_34,_35));
}
}
},removeCategoryIncludeFilter:function(_38){
if(_38){
var _39=_38.scheme;
var _3a=_38.term;
var _3b=_38.label;
if(!_39){
_39=null;
}
if(!_3a){
_39=null;
}
if(!_3b){
_39=null;
}
var _3c=[];
if(this._includeFilters&&this._includeFilters.length>0){
for(var i=0;i<this._includeFilters.length;i++){
var _3d=this._includeFilters[i];
if(!((_3d.term===_3a)&&(_3d.scheme===_39)&&(_3d.label===_3b))){
_3c.push(_3d);
}
}
this._includeFilters=_3c;
}
}
},_handleEvent:function(_3e){
if(_3e.source!=this){
if(_3e.action=="update"&&_3e.entry){
var evt=_3e;
if(!this.localSaveOnly){
this.atomIO.updateEntry(evt.entry,_1.hitch(evt.source,evt.callback),null,true);
}
this._currentSelection._entryWidget.setTime(this._displayDateForEntry(evt.entry).toLocaleTimeString());
this._currentSelection._entryWidget.setTitle(evt.entry.title.value);
}else{
if(_3e.action=="post"&&_3e.entry){
if(!this.localSaveOnly){
this.atomIO.addEntry(_3e.entry,this.url,_1.hitch(this,this._addEntry));
}else{
this._addEntry(_3e.entry);
}
}
}
}
},_addEntry:function(_3f){
this._feed.addEntry(_3f);
this.setFeed(this._feed);
_1.publish(this.entrySelectionTopic,[{action:"set",source:this,feed:this._feed,entry:_3f}]);
},destroy:function(){
this.clear();
_1.forEach(this._subscriptions,_1.unsubscribe);
}});
_1.declare("dojox.atom.widget.FeedViewerEntry",[_2._Widget,_2._Templated],{templateString:_1.cache("dojox.atom","widget/templates/FeedViewerEntry.html","<tr class=\"feedViewerEntry\" dojoAttachPoint=\"entryNode\" dojoAttachEvent=\"onclick:onClick\">\n    <td class=\"feedViewerEntryUpdated\" dojoAttachPoint=\"timeNode\">\n    </td>\n    <td>\n        <table border=\"0\" width=\"100%\" dojoAttachPoint=\"titleRow\">\n            <tr padding=\"0\" border=\"0\">\n                <td class=\"feedViewerEntryTitle\" dojoAttachPoint=\"titleNode\">\n                </td>\n                <td class=\"feedViewerEntryDelete\" align=\"right\">\n                    <span dojoAttachPoint=\"deleteButton\" dojoAttachEvent=\"onclick:deleteEntry\" class=\"feedViewerDeleteButton\" style=\"display:none;\">[delete]</span>\n                </td>\n            <tr>\n        </table>\n    </td>\n</tr>"),entryNode:null,timeNode:null,deleteButton:null,entry:null,feed:null,postCreate:function(){
var _40=_1.i18n.getLocalization("dojox.atom.widget","FeedViewerEntry");
this.deleteButton.innerHTML=_40.deleteButton;
},setTitle:function(_41){
if(this.titleNode.lastChild){
this.titleNode.removeChild(this.titleNode.lastChild);
}
var _42=document.createElement("div");
_42.innerHTML=_41;
this.titleNode.appendChild(_42);
},setTime:function(_43){
if(this.timeNode.lastChild){
this.timeNode.removeChild(this.timeNode.lastChild);
}
var _44=document.createTextNode(_43);
this.timeNode.appendChild(_44);
},enableDelete:function(){
if(this.deleteButton!==null){
this.deleteButton.style.display="inline";
}
},disableDelete:function(){
if(this.deleteButton!==null){
this.deleteButton.style.display="none";
}
},deleteEntry:function(_45){
_45.preventDefault();
_45.stopPropagation();
this.feed.deleteEntry(this);
},onClick:function(e){
}});
_1.declare("dojox.atom.widget.FeedViewerGrouping",[_2._Widget,_2._Templated],{templateString:_1.cache("dojox.atom","widget/templates/FeedViewerGrouping.html","<tr dojoAttachPoint=\"groupingNode\" class=\"feedViewerGrouping\">\n\t<td colspan=\"2\" dojoAttachPoint=\"titleNode\" class=\"feedViewerGroupingTitle\">\n\t</td>\n</tr>"),groupingNode:null,titleNode:null,setText:function(_46){
if(this.titleNode.lastChild){
this.titleNode.removeChild(this.titleNode.lastChild);
}
var _47=document.createTextNode(_46);
this.titleNode.appendChild(_47);
}});
_1.declare("dojox.atom.widget.AtomEntryCategoryFilter",[_2._Widget,_2._Templated],{scheme:"",term:"",label:"",isFilter:true});
_1.declare("dojox.atom.widget.FeedViewer.CategoryIncludeFilter",null,{constructor:function(_48,_49,_4a){
this.scheme=_48;
this.term=_49;
this.label=_4a;
},match:function(_4b){
var _4c=false;
if(_4b!==null){
var _4d=_4b.categories;
if(_4d!==null){
for(var i=0;i<_4d.length;i++){
var _4e=_4d[i];
if(this.scheme!==""){
if(this.scheme!==_4e.scheme){
break;
}
}
if(this.term!==""){
if(this.term!==_4e.term){
break;
}
}
if(this.label!==""){
if(this.label!==_4e.label){
break;
}
}
_4c=true;
}
}
}
return _4c;
}});
return _1.getObject("dojox.atom.widget.FeedViewer");
});
require(["dojox/atom/widget/FeedViewer"]);
