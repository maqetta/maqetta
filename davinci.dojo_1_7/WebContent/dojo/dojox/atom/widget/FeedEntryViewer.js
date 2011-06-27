/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/atom/widget/FeedEntryViewer",["dojo","dijit","dojox","dojo/fx","dijit/_Widget","dijit/_Templated","dijit/_Container","dijit/layout/ContentPane","dojox/atom/io/Connection","dojo/i18n","dojox/atom/widget/nls/FeedEntryViewer"],function(_1,_2,_3){
_1.getObject("dojox.atom.widget.FeedEntryViewer",1);
_1.requireLocalization("dojox.atom.widget","FeedEntryViewer");
_1.experimental("dojox.atom.widget.FeedEntryViewer");
_1.declare("dojox.atom.widget.FeedEntryViewer",[_2._Widget,_2._Templated,_2._Container],{entrySelectionTopic:"",_validEntryFields:{},displayEntrySections:"",_displayEntrySections:null,enableMenu:false,enableMenuFade:false,_optionButtonDisplayed:true,templateString:_1.cache("dojox.atom","widget/templates/FeedEntryViewer.html","<div class=\"feedEntryViewer\">\n    <table border=\"0\" width=\"100%\" class=\"feedEntryViewerMenuTable\" dojoAttachPoint=\"feedEntryViewerMenu\" style=\"display: none;\">\n        <tr width=\"100%\"  dojoAttachPoint=\"entryCheckBoxDisplayOptions\">\n            <td align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"displayOptions\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n        </tr>\n        <tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCelltitle\">\n                <input type=\"checkbox\" name=\"title\" value=\"Title\" dojoAttachPoint=\"feedEntryCheckBoxTitle\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelTitle\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellauthors\">\n                <input type=\"checkbox\" name=\"authors\" value=\"Authors\" dojoAttachPoint=\"feedEntryCheckBoxAuthors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelAuthors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontributors\">\n                <input type=\"checkbox\" name=\"contributors\" value=\"Contributors\" dojoAttachPoint=\"feedEntryCheckBoxContributors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContributors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellid\">\n                <input type=\"checkbox\" name=\"id\" value=\"Id\" dojoAttachPoint=\"feedEntryCheckBoxId\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelId\"></label>\n            </td>\n            <td rowspan=\"2\" align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"close\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n\t\t</tr>\n\t\t<tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow2\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCellupdated\">\n                <input type=\"checkbox\" name=\"updated\" value=\"Updated\" dojoAttachPoint=\"feedEntryCheckBoxUpdated\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelUpdated\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellsummary\">\n                <input type=\"checkbox\" name=\"summary\" value=\"Summary\" dojoAttachPoint=\"feedEntryCheckBoxSummary\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelSummary\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontent\">\n                <input type=\"checkbox\" name=\"content\" value=\"Content\" dojoAttachPoint=\"feedEntryCheckBoxContent\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContent\"></label>\n            </td>\n        </tr>\n    </table>\n    \n    <table class=\"feedEntryViewerContainer\" border=\"0\" width=\"100%\">\n        <tr class=\"feedEntryViewerTitle\" dojoAttachPoint=\"entryTitleRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryTitleHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryTitleNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerAuthor\" dojoAttachPoint=\"entryAuthorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryAuthorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryAuthorNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerContributor\" dojoAttachPoint=\"entryContributorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContributorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContributorNode\" class=\"feedEntryViewerContributorNames\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n        \n        <tr class=\"feedEntryViewerId\" dojoAttachPoint=\"entryIdRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryIdHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryIdNode\" class=\"feedEntryViewerIdText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerUpdated\" dojoAttachPoint=\"entryUpdatedRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryUpdatedHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryUpdatedNode\" class=\"feedEntryViewerUpdatedText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerSummary\" dojoAttachPoint=\"entrySummaryRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entrySummaryHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entrySummaryNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerContent\" dojoAttachPoint=\"entryContentRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContentHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContentNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</div>\n"),_entry:null,_feed:null,_editMode:false,postCreate:function(){
if(this.entrySelectionTopic!==""){
this._subscriptions=[_1.subscribe(this.entrySelectionTopic,this,"_handleEvent")];
}
var _4=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
this.displayOptions.innerHTML=_4.displayOptions;
this.feedEntryCheckBoxLabelTitle.innerHTML=_4.title;
this.feedEntryCheckBoxLabelAuthors.innerHTML=_4.authors;
this.feedEntryCheckBoxLabelContributors.innerHTML=_4.contributors;
this.feedEntryCheckBoxLabelId.innerHTML=_4.id;
this.close.innerHTML=_4.close;
this.feedEntryCheckBoxLabelUpdated.innerHTML=_4.updated;
this.feedEntryCheckBoxLabelSummary.innerHTML=_4.summary;
this.feedEntryCheckBoxLabelContent.innerHTML=_4.content;
},startup:function(){
if(this.displayEntrySections===""){
this._displayEntrySections=["title","authors","contributors","summary","content","id","updated"];
}else{
this._displayEntrySections=this.displayEntrySections.split(",");
}
this._setDisplaySectionsCheckboxes();
if(this.enableMenu){
_1.style(this.feedEntryViewerMenu,"display","");
if(this.entryCheckBoxRow&&this.entryCheckBoxRow2){
if(this.enableMenuFade){
_1.fadeOut({node:this.entryCheckBoxRow,duration:250}).play();
_1.fadeOut({node:this.entryCheckBoxRow2,duration:250}).play();
}
}
}
},clear:function(){
this.destroyDescendants();
this._entry=null;
this._feed=null;
this.clearNodes();
},clearNodes:function(){
_1.forEach(["entryTitleRow","entryAuthorRow","entryContributorRow","entrySummaryRow","entryContentRow","entryIdRow","entryUpdatedRow"],function(_5){
_1.style(this[_5],"display","none");
},this);
_1.forEach(["entryTitleNode","entryTitleHeader","entryAuthorHeader","entryContributorHeader","entryContributorNode","entrySummaryHeader","entrySummaryNode","entryContentHeader","entryContentNode","entryIdNode","entryIdHeader","entryUpdatedHeader","entryUpdatedNode"],function(_6){
while(this[_6].firstChild){
_1.destroy(this[_6].firstChild);
}
},this);
},setEntry:function(_7,_8,_9){
this.clear();
this._validEntryFields={};
this._entry=_7;
this._feed=_8;
if(_7!==null){
if(this.entryTitleHeader){
this.setTitleHeader(this.entryTitleHeader,_7);
}
if(this.entryTitleNode){
this.setTitle(this.entryTitleNode,this._editMode,_7);
}
if(this.entryAuthorHeader){
this.setAuthorsHeader(this.entryAuthorHeader,_7);
}
if(this.entryAuthorNode){
this.setAuthors(this.entryAuthorNode,this._editMode,_7);
}
if(this.entryContributorHeader){
this.setContributorsHeader(this.entryContributorHeader,_7);
}
if(this.entryContributorNode){
this.setContributors(this.entryContributorNode,this._editMode,_7);
}
if(this.entryIdHeader){
this.setIdHeader(this.entryIdHeader,_7);
}
if(this.entryIdNode){
this.setId(this.entryIdNode,this._editMode,_7);
}
if(this.entryUpdatedHeader){
this.setUpdatedHeader(this.entryUpdatedHeader,_7);
}
if(this.entryUpdatedNode){
this.setUpdated(this.entryUpdatedNode,this._editMode,_7);
}
if(this.entrySummaryHeader){
this.setSummaryHeader(this.entrySummaryHeader,_7);
}
if(this.entrySummaryNode){
this.setSummary(this.entrySummaryNode,this._editMode,_7);
}
if(this.entryContentHeader){
this.setContentHeader(this.entryContentHeader,_7);
}
if(this.entryContentNode){
this.setContent(this.entryContentNode,this._editMode,_7);
}
}
this._displaySections();
},setTitleHeader:function(_a,_b){
if(_b.title&&_b.title.value&&_b.title.value!==null){
var _c=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _d=new _3.atom.widget.EntryHeader({title:_c.title});
_a.appendChild(_d.domNode);
}
},setTitle:function(_e,_f,_10){
if(_10.title&&_10.title.value&&_10.title.value!==null){
if(_10.title.type=="text"){
var _11=document.createTextNode(_10.title.value);
_e.appendChild(_11);
}else{
var _12=document.createElement("span");
var _13=new _2.layout.ContentPane({refreshOnShow:true,executeScripts:false},_12);
_13.attr("content",_10.title.value);
_e.appendChild(_13.domNode);
}
this.setFieldValidity("title",true);
}
},setAuthorsHeader:function(_14,_15){
if(_15.authors&&_15.authors.length>0){
var _16=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _17=new _3.atom.widget.EntryHeader({title:_16.authors});
_14.appendChild(_17.domNode);
}
},setAuthors:function(_18,_19,_1a){
_18.innerHTML="";
if(_1a.authors&&_1a.authors.length>0){
for(var i in _1a.authors){
if(_1a.authors[i].name){
var _1b=_18;
if(_1a.authors[i].uri){
var _1c=document.createElement("a");
_1b.appendChild(_1c);
_1c.href=_1a.authors[i].uri;
_1b=_1c;
}
var _1d=_1a.authors[i].name;
if(_1a.authors[i].email){
_1d=_1d+" ("+_1a.authors[i].email+")";
}
var _1e=document.createTextNode(_1d);
_1b.appendChild(_1e);
var _1f=document.createElement("br");
_18.appendChild(_1f);
this.setFieldValidity("authors",true);
}
}
}
},setContributorsHeader:function(_20,_21){
if(_21.contributors&&_21.contributors.length>0){
var _22=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _23=new _3.atom.widget.EntryHeader({title:_22.contributors});
_20.appendChild(_23.domNode);
}
},setContributors:function(_24,_25,_26){
if(_26.contributors&&_26.contributors.length>0){
for(var i in _26.contributors){
var _27=document.createTextNode(_26.contributors[i].name);
_24.appendChild(_27);
var _28=document.createElement("br");
_24.appendChild(_28);
this.setFieldValidity("contributors",true);
}
}
},setIdHeader:function(_29,_2a){
if(_2a.id&&_2a.id!==null){
var _2b=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _2c=new _3.atom.widget.EntryHeader({title:_2b.id});
_29.appendChild(_2c.domNode);
}
},setId:function(_2d,_2e,_2f){
if(_2f.id&&_2f.id!==null){
var _30=document.createTextNode(_2f.id);
_2d.appendChild(_30);
this.setFieldValidity("id",true);
}
},setUpdatedHeader:function(_31,_32){
if(_32.updated&&_32.updated!==null){
var _33=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _34=new _3.atom.widget.EntryHeader({title:_33.updated});
_31.appendChild(_34.domNode);
}
},setUpdated:function(_35,_36,_37){
if(_37.updated&&_37.updated!==null){
var _38=document.createTextNode(_37.updated);
_35.appendChild(_38);
this.setFieldValidity("updated",true);
}
},setSummaryHeader:function(_39,_3a){
if(_3a.summary&&_3a.summary.value&&_3a.summary.value!==null){
var _3b=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _3c=new _3.atom.widget.EntryHeader({title:_3b.summary});
_39.appendChild(_3c.domNode);
}
},setSummary:function(_3d,_3e,_3f){
if(_3f.summary&&_3f.summary.value&&_3f.summary.value!==null){
var _40=document.createElement("span");
var _41=new _2.layout.ContentPane({refreshOnShow:true,executeScripts:false},_40);
_41.attr("content",_3f.summary.value);
_3d.appendChild(_41.domNode);
this.setFieldValidity("summary",true);
}
},setContentHeader:function(_42,_43){
if(_43.content&&_43.content.value&&_43.content.value!==null){
var _44=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _45=new _3.atom.widget.EntryHeader({title:_44.content});
_42.appendChild(_45.domNode);
}
},setContent:function(_46,_47,_48){
if(_48.content&&_48.content.value&&_48.content.value!==null){
var _49=document.createElement("span");
var _4a=new _2.layout.ContentPane({refreshOnShow:true,executeScripts:false},_49);
_4a.attr("content",_48.content.value);
_46.appendChild(_4a.domNode);
this.setFieldValidity("content",true);
}
},_displaySections:function(){
_1.style(this.entryTitleRow,"display","none");
_1.style(this.entryAuthorRow,"display","none");
_1.style(this.entryContributorRow,"display","none");
_1.style(this.entrySummaryRow,"display","none");
_1.style(this.entryContentRow,"display","none");
_1.style(this.entryIdRow,"display","none");
_1.style(this.entryUpdatedRow,"display","none");
for(var i in this._displayEntrySections){
var _4b=this._displayEntrySections[i].toLowerCase();
if(_4b==="title"&&this.isFieldValid("title")){
_1.style(this.entryTitleRow,"display","");
}
if(_4b==="authors"&&this.isFieldValid("authors")){
_1.style(this.entryAuthorRow,"display","");
}
if(_4b==="contributors"&&this.isFieldValid("contributors")){
_1.style(this.entryContributorRow,"display","");
}
if(_4b==="summary"&&this.isFieldValid("summary")){
_1.style(this.entrySummaryRow,"display","");
}
if(_4b==="content"&&this.isFieldValid("content")){
_1.style(this.entryContentRow,"display","");
}
if(_4b==="id"&&this.isFieldValid("id")){
_1.style(this.entryIdRow,"display","");
}
if(_4b==="updated"&&this.isFieldValid("updated")){
_1.style(this.entryUpdatedRow,"display","");
}
}
},setDisplaySections:function(_4c){
if(_4c!==null){
this._displayEntrySections=_4c;
this._displaySections();
}else{
this._displayEntrySections=["title","authors","contributors","summary","content","id","updated"];
}
},_setDisplaySectionsCheckboxes:function(){
var _4d=["title","authors","contributors","summary","content","id","updated"];
for(var i in _4d){
if(_1.indexOf(this._displayEntrySections,_4d[i])==-1){
_1.style(this["feedEntryCell"+_4d[i]],"display","none");
}else{
this["feedEntryCheckBox"+_4d[i].substring(0,1).toUpperCase()+_4d[i].substring(1)].checked=true;
}
}
},_readDisplaySections:function(){
var _4e=[];
if(this.feedEntryCheckBoxTitle.checked){
_4e.push("title");
}
if(this.feedEntryCheckBoxAuthors.checked){
_4e.push("authors");
}
if(this.feedEntryCheckBoxContributors.checked){
_4e.push("contributors");
}
if(this.feedEntryCheckBoxSummary.checked){
_4e.push("summary");
}
if(this.feedEntryCheckBoxContent.checked){
_4e.push("content");
}
if(this.feedEntryCheckBoxId.checked){
_4e.push("id");
}
if(this.feedEntryCheckBoxUpdated.checked){
_4e.push("updated");
}
this._displayEntrySections=_4e;
},_toggleCheckbox:function(_4f){
if(_4f.checked){
_4f.checked=false;
}else{
_4f.checked=true;
}
this._readDisplaySections();
this._displaySections();
},_toggleOptions:function(_50){
if(this.enableMenu){
var _51=null;
var _52;
var _53;
if(this._optionButtonDisplayed){
if(this.enableMenuFade){
_52=_1.fadeOut({node:this.entryCheckBoxDisplayOptions,duration:250});
_1.connect(_52,"onEnd",this,function(){
_1.style(this.entryCheckBoxDisplayOptions,"display","none");
_1.style(this.entryCheckBoxRow,"display","");
_1.style(this.entryCheckBoxRow2,"display","");
_1.fadeIn({node:this.entryCheckBoxRow,duration:250}).play();
_1.fadeIn({node:this.entryCheckBoxRow2,duration:250}).play();
});
_52.play();
}else{
_1.style(this.entryCheckBoxDisplayOptions,"display","none");
_1.style(this.entryCheckBoxRow,"display","");
_1.style(this.entryCheckBoxRow2,"display","");
}
this._optionButtonDisplayed=false;
}else{
if(this.enableMenuFade){
_52=_1.fadeOut({node:this.entryCheckBoxRow,duration:250});
_53=_1.fadeOut({node:this.entryCheckBoxRow2,duration:250});
_1.connect(_52,"onEnd",this,function(){
_1.style(this.entryCheckBoxRow,"display","none");
_1.style(this.entryCheckBoxRow2,"display","none");
_1.style(this.entryCheckBoxDisplayOptions,"display","");
_1.fadeIn({node:this.entryCheckBoxDisplayOptions,duration:250}).play();
});
_52.play();
_53.play();
}else{
_1.style(this.entryCheckBoxRow,"display","none");
_1.style(this.entryCheckBoxRow2,"display","none");
_1.style(this.entryCheckBoxDisplayOptions,"display","");
}
this._optionButtonDisplayed=true;
}
}
},_handleEvent:function(_54){
if(_54.source!=this){
if(_54.action=="set"&&_54.entry){
this.setEntry(_54.entry,_54.feed);
}else{
if(_54.action=="delete"&&_54.entry&&_54.entry==this._entry){
this.clear();
}
}
}
},setFieldValidity:function(_55,_56){
if(_55){
var _57=_55.toLowerCase();
this._validEntryFields[_55]=_56;
}
},isFieldValid:function(_58){
return this._validEntryFields[_58.toLowerCase()];
},getEntry:function(){
return this._entry;
},getFeed:function(){
return this._feed;
},destroy:function(){
this.clear();
_1.forEach(this._subscriptions,_1.unsubscribe);
}});
_1.declare("dojox.atom.widget.EntryHeader",[_2._Widget,_2._Templated,_2._Container],{title:"",templateString:_1.cache("dojox.atom","widget/templates/EntryHeader.html","<span dojoAttachPoint=\"entryHeaderNode\" class=\"entryHeaderNode\"></span>\n"),postCreate:function(){
this.setListHeader();
},setListHeader:function(_59){
this.clear();
if(_59){
this.title=_59;
}
var _5a=document.createTextNode(this.title);
this.entryHeaderNode.appendChild(_5a);
},clear:function(){
this.destroyDescendants();
if(this.entryHeaderNode){
for(var i=0;i<this.entryHeaderNode.childNodes.length;i++){
this.entryHeaderNode.removeChild(this.entryHeaderNode.childNodes[i]);
}
}
},destroy:function(){
this.clear();
}});
return _1.getObject("dojox.atom.widget.FeedEntryViewer");
});
require(["dojox/atom/widget/FeedEntryViewer"]);
