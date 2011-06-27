/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/atom/widget/FeedEntryEditor",["dojo","dijit","dojox","dojox/atom/widget/FeedEntryViewer","dijit/_Widget","dijit/_Templated","dijit/_Container","dijit/Editor","dijit/form/TextBox","dijit/form/SimpleTextarea","dojo/i18n","dojox/atom/widget/nls/FeedEntryEditor","dojo/i18n","dojox/atom/widget/nls/PeopleEditor"],function(_1,_2,_3){
_1.getObject("dojox.atom.widget.FeedEntryEditor",1);
_1.requireLocalization("dojox.atom.widget","FeedEntryEditor");
_1.requireLocalization("dojox.atom.widget","PeopleEditor");
_1.experimental("dojox.atom.widget.FeedEntryEditor");
_1.declare("dojox.atom.widget.FeedEntryEditor",_3.atom.widget.FeedEntryViewer,{_contentEditor:null,_oldContent:null,_setObject:null,enableEdit:false,_contentEditorCreator:null,_editors:{},entryNewButton:null,_editable:false,templateString:_1.cache("dojox.atom","widget/templates/FeedEntryEditor.html","<div class=\"feedEntryViewer\">\n    <table border=\"0\" width=\"100%\" class=\"feedEntryViewerMenuTable\" dojoAttachPoint=\"feedEntryViewerMenu\" style=\"display: none;\">\n        <tr width=\"100%\"  dojoAttachPoint=\"entryCheckBoxDisplayOptions\">\n        \t<td align=\"left\" dojoAttachPoint=\"entryNewButton\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"doNew\" dojoAttachEvent=\"onclick:_toggleNew\"></span>\n        \t</td>\n            <td align=\"left\" dojoAttachPoint=\"entryEditButton\" style=\"display: none;\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"edit\" dojoAttachEvent=\"onclick:_toggleEdit\"></span>\n            </td>\n            <td align=\"left\" dojoAttachPoint=\"entrySaveCancelButtons\" style=\"display: none;\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"save\" dojoAttachEvent=\"onclick:saveEdits\"></span>\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"cancel\" dojoAttachEvent=\"onclick:cancelEdits\"></span>\n            </td>\n            <td align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"displayOptions\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n        </tr>\n        <tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCelltitle\">\n                <input type=\"checkbox\" name=\"title\" value=\"Title\" dojoAttachPoint=\"feedEntryCheckBoxTitle\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelTitle\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellauthors\">\n                <input type=\"checkbox\" name=\"authors\" value=\"Authors\" dojoAttachPoint=\"feedEntryCheckBoxAuthors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelAuthors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontributors\">\n                <input type=\"checkbox\" name=\"contributors\" value=\"Contributors\" dojoAttachPoint=\"feedEntryCheckBoxContributors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContributors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellid\">\n                <input type=\"checkbox\" name=\"id\" value=\"Id\" dojoAttachPoint=\"feedEntryCheckBoxId\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelId\"></label>\n            </td>\n            <td rowspan=\"2\" align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"close\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n\t\t</tr>\n\t\t<tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow2\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCellupdated\">\n                <input type=\"checkbox\" name=\"updated\" value=\"Updated\" dojoAttachPoint=\"feedEntryCheckBoxUpdated\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelUpdated\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellsummary\">\n                <input type=\"checkbox\" name=\"summary\" value=\"Summary\" dojoAttachPoint=\"feedEntryCheckBoxSummary\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelSummary\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontent\">\n                <input type=\"checkbox\" name=\"content\" value=\"Content\" dojoAttachPoint=\"feedEntryCheckBoxContent\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContent\"></label>\n            </td>\n        </tr>\n    </table>\n    \n    <table class=\"feedEntryViewerContainer\" border=\"0\" width=\"100%\">\n        <tr class=\"feedEntryViewerTitle\" dojoAttachPoint=\"entryTitleRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryTitleHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td>\n                        \t<select dojoAttachPoint=\"entryTitleSelect\" dojoAttachEvent=\"onchange:_switchEditor\" style=\"display: none\">\n                        \t\t<option value=\"text\">Text</option>\n\t\t\t\t\t\t\t\t<option value=\"html\">HTML</option>\n\t\t\t\t\t\t\t\t<option value=\"xhtml\">XHTML</option>\n                        \t</select>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td colspan=\"2\" dojoAttachPoint=\"entryTitleNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerAuthor\" dojoAttachPoint=\"entryAuthorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryAuthorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryAuthorNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerContributor\" dojoAttachPoint=\"entryContributorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContributorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContributorNode\" class=\"feedEntryViewerContributorNames\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n        \n        <tr class=\"feedEntryViewerId\" dojoAttachPoint=\"entryIdRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryIdHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryIdNode\" class=\"feedEntryViewerIdText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerUpdated\" dojoAttachPoint=\"entryUpdatedRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryUpdatedHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryUpdatedNode\" class=\"feedEntryViewerUpdatedText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerSummary\" dojoAttachPoint=\"entrySummaryRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\" colspan=\"2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entrySummaryHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td>\n                        \t<select dojoAttachPoint=\"entrySummarySelect\" dojoAttachEvent=\"onchange:_switchEditor\" style=\"display: none\">\n                        \t\t<option value=\"text\">Text</option>\n\t\t\t\t\t\t\t\t<option value=\"html\">HTML</option>\n\t\t\t\t\t\t\t\t<option value=\"xhtml\">XHTML</option>\n                        \t</select>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entrySummaryNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerContent\" dojoAttachPoint=\"entryContentRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContentHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td>\n                        \t<select dojoAttachPoint=\"entryContentSelect\" dojoAttachEvent=\"onchange:_switchEditor\" style=\"display: none\">\n                        \t\t<option value=\"text\">Text</option>\n\t\t\t\t\t\t\t\t<option value=\"html\">HTML</option>\n\t\t\t\t\t\t\t\t<option value=\"xhtml\">XHTML</option>\n                        \t</select>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContentNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</div>\n"),postCreate:function(){
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
_4=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryEditor");
this.doNew.innerHTML=_4.doNew;
this.edit.innerHTML=_4.edit;
this.save.innerHTML=_4.save;
this.cancel.innerHTML=_4.cancel;
},setEntry:function(_5,_6,_7){
if(this._entry!==_5){
this._editMode=false;
_7=false;
}else{
_7=true;
}
_3.atom.widget.FeedEntryEditor.superclass.setEntry.call(this,_5,_6);
this._editable=this._isEditable(_5);
if(!_7&&!this._editable){
_1.style(this.entryEditButton,"display","none");
_1.style(this.entrySaveCancelButtons,"display","none");
}
if(this._editable&&this.enableEdit){
if(!_7){
_1.style(this.entryEditButton,"display","");
if(this.enableMenuFade&&this.entrySaveCancelButton){
_1.fadeOut({node:this.entrySaveCancelButton,duration:250}).play();
}
}
}
},_toggleEdit:function(){
if(this._editable&&this.enableEdit){
_1.style(this.entryEditButton,"display","none");
_1.style(this.entrySaveCancelButtons,"display","");
this._editMode=true;
this.setEntry(this._entry,this._feed,true);
}
},_handleEvent:function(_8){
if(_8.source!=this&&_8.action=="delete"&&_8.entry&&_8.entry==this._entry){
_1.style(this.entryEditButton,"display","none");
}
_3.atom.widget.FeedEntryEditor.superclass._handleEvent.call(this,_8);
},_isEditable:function(_9){
var _a=false;
if(_9&&_9!==null&&_9.links&&_9.links!==null){
for(var x in _9.links){
if(_9.links[x].rel&&_9.links[x].rel=="edit"){
_a=true;
break;
}
}
}
return _a;
},setTitle:function(_b,_c,_d){
if(!_c){
_3.atom.widget.FeedEntryEditor.superclass.setTitle.call(this,_b,_c,_d);
if(_d.title&&_d.title.value&&_d.title.value!==null){
this.setFieldValidity("title",true);
}
}else{
if(_d.title&&_d.title.value&&_d.title.value!==null){
if(!this._toLoad){
this._toLoad=[];
}
this.entryTitleSelect.value=_d.title.type;
var _e=this._createEditor(_b,_d.title,true,_d.title.type==="html"||_d.title.type==="xhtml");
_e.name="title";
this._toLoad.push(_e);
this.setFieldValidity("titleedit",true);
this.setFieldValidity("title",true);
}
}
},setAuthors:function(_f,_10,_11){
if(!_10){
_3.atom.widget.FeedEntryEditor.superclass.setAuthors.call(this,_f,_10,_11);
if(_11.authors&&_11.authors.length>0){
this.setFieldValidity("authors",true);
}
}else{
if(_11.authors&&_11.authors.length>0){
this._editors.authors=this._createPeopleEditor(this.entryAuthorNode,{data:_11.authors,name:"Author"});
this.setFieldValidity("authors",true);
}
}
},setContributors:function(_12,_13,_14){
if(!_13){
_3.atom.widget.FeedEntryEditor.superclass.setContributors.call(this,_12,_13,_14);
if(_14.contributors&&_14.contributors.length>0){
this.setFieldValidity("contributors",true);
}
}else{
if(_14.contributors&&_14.contributors.length>0){
this._editors.contributors=this._createPeopleEditor(this.entryContributorNode,{data:_14.contributors,name:"Contributor"});
this.setFieldValidity("contributors",true);
}
}
},setId:function(_15,_16,_17){
if(!_16){
_3.atom.widget.FeedEntryEditor.superclass.setId.call(this,_15,_16,_17);
if(_17.id&&_17.id!==null){
this.setFieldValidity("id",true);
}
}else{
if(_17.id&&_17.id!==null){
this._editors.id=this._createEditor(_15,_17.id);
this.setFieldValidity("id",true);
}
}
},setUpdated:function(_18,_19,_1a){
if(!_19){
_3.atom.widget.FeedEntryEditor.superclass.setUpdated.call(this,_18,_19,_1a);
if(_1a.updated&&_1a.updated!==null){
this.setFieldValidity("updated",true);
}
}else{
if(_1a.updated&&_1a.updated!==null){
this._editors.updated=this._createEditor(_18,_1a.updated);
this.setFieldValidity("updated",true);
}
}
},setSummary:function(_1b,_1c,_1d){
if(!_1c){
_3.atom.widget.FeedEntryEditor.superclass.setSummary.call(this,_1b,_1c,_1d);
if(_1d.summary&&_1d.summary.value&&_1d.summary.value!==null){
this.setFieldValidity("summary",true);
}
}else{
if(_1d.summary&&_1d.summary.value&&_1d.summary.value!==null){
if(!this._toLoad){
this._toLoad=[];
}
this.entrySummarySelect.value=_1d.summary.type;
var _1e=this._createEditor(_1b,_1d.summary,true,_1d.summary.type==="html"||_1d.summary.type==="xhtml");
_1e.name="summary";
this._toLoad.push(_1e);
this.setFieldValidity("summaryedit",true);
this.setFieldValidity("summary",true);
}
}
},setContent:function(_1f,_20,_21){
if(!_20){
_3.atom.widget.FeedEntryEditor.superclass.setContent.call(this,_1f,_20,_21);
if(_21.content&&_21.content.value&&_21.content.value!==null){
this.setFieldValidity("content",true);
}
}else{
if(_21.content&&_21.content.value&&_21.content.value!==null){
if(!this._toLoad){
this._toLoad=[];
}
this.entryContentSelect.value=_21.content.type;
var _22=this._createEditor(_1f,_21.content,true,_21.content.type==="html"||_21.content.type==="xhtml");
_22.name="content";
this._toLoad.push(_22);
this.setFieldValidity("contentedit",true);
this.setFieldValidity("content",true);
}
}
},_createEditor:function(_23,_24,_25,rte){
var _26;
var box;
if(!_24){
if(rte){
return {anchorNode:_23,entryValue:"",editor:null,generateEditor:function(){
var _27=document.createElement("div");
_27.innerHTML=this.entryValue;
this.anchorNode.appendChild(_27);
var _28=new _2.Editor({},_27);
this.editor=_28;
return _28;
}};
}
if(_25){
_26=document.createElement("textarea");
_23.appendChild(_26);
_1.style(_26,"width","90%");
box=new _2.form.SimpleTextarea({},_26);
}else{
_26=document.createElement("input");
_23.appendChild(_26);
_1.style(_26,"width","95%");
box=new _2.form.TextBox({},_26);
}
box.attr("value","");
return box;
}
var _29;
if(_24.value!==undefined){
_29=_24.value;
}else{
if(_24.attr){
_29=_24.attr("value");
}else{
_29=_24;
}
}
if(rte){
if(_29.indexOf("<")!=-1){
_29=_29.replace(/</g,"&lt;");
}
return {anchorNode:_23,entryValue:_29,editor:null,generateEditor:function(){
var _2a=document.createElement("div");
_2a.innerHTML=this.entryValue;
this.anchorNode.appendChild(_2a);
var _2b=new _2.Editor({},_2a);
this.editor=_2b;
return _2b;
}};
}
if(_25){
_26=document.createElement("textarea");
_23.appendChild(_26);
_1.style(_26,"width","90%");
box=new _2.form.SimpleTextarea({},_26);
}else{
_26=document.createElement("input");
_23.appendChild(_26);
_1.style(_26,"width","95%");
box=new _2.form.TextBox({},_26);
}
box.attr("value",_29);
return box;
},_switchEditor:function(_2c){
var _2d=null;
var _2e=null;
var _2f=null;
if(_1.isIE){
_2e=_2c.srcElement;
}else{
_2e=_2c.target;
}
if(_2e===this.entryTitleSelect){
_2f=this.entryTitleNode;
_2d="title";
}else{
if(_2e===this.entrySummarySelect){
_2f=this.entrySummaryNode;
_2d="summary";
}else{
_2f=this.entryContentNode;
_2d="content";
}
}
var _30=this._editors[_2d];
var _31;
var _32;
if(_2e.value==="text"){
if(_30.declaredClass==="dijit.Editor"){
_32=_30.attr("value",false);
_30.close(false,true);
_30.destroy();
while(_2f.firstChild){
_1.destroy(_2f.firstChild);
}
_31=this._createEditor(_2f,{value:_32},true,false);
this._editors[_2d]=_31;
}
}else{
if(_30.declaredClass!="dijit.Editor"){
_32=_30.attr("value");
_30.destroy();
while(_2f.firstChild){
_1.destroy(_2f.firstChild);
}
_31=this._createEditor(_2f,{value:_32},true,true);
_31=_1.hitch(_31,_31.generateEditor)();
this._editors[_2d]=_31;
}
}
},_createPeopleEditor:function(_33,_34){
var _35=document.createElement("div");
_33.appendChild(_35);
return new _3.atom.widget.PeopleEditor(_34,_35);
},saveEdits:function(){
_1.style(this.entrySaveCancelButtons,"display","none");
_1.style(this.entryEditButton,"display","");
_1.style(this.entryNewButton,"display","");
var _36=false;
var _37;
var i;
var _38;
var _39;
var _3a;
var _3b;
if(!this._new){
_39=this.getEntry();
if(this._editors.title&&(this._editors.title.attr("value")!=_39.title.value||this.entryTitleSelect.value!=_39.title.type)){
_37=this._editors.title.attr("value");
if(this.entryTitleSelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
if(_37.indexOf("<div xmlns=\"http://www.w3.org/1999/xhtml\">")!==0){
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
}
_39.title=new _3.atom.io.model.Content("title",_37,null,this.entryTitleSelect.value);
_36=true;
}
if(this._editors.id.attr("value")!=_39.id){
_39.id=this._editors.id.attr("value");
_36=true;
}
if(this._editors.summary&&(this._editors.summary.attr("value")!=_39.summary.value||this.entrySummarySelect.value!=_39.summary.type)){
_37=this._editors.summary.attr("value");
if(this.entrySummarySelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
if(_37.indexOf("<div xmlns=\"http://www.w3.org/1999/xhtml\">")!==0){
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
}
_39.summary=new _3.atom.io.model.Content("summary",_37,null,this.entrySummarySelect.value);
_36=true;
}
if(this._editors.content&&(this._editors.content.attr("value")!=_39.content.value||this.entryContentSelect.value!=_39.content.type)){
_37=this._editors.content.attr("value");
if(this.entryContentSelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
if(_37.indexOf("<div xmlns=\"http://www.w3.org/1999/xhtml\">")!==0){
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
}
_39.content=new _3.atom.io.model.Content("content",_37,null,this.entryContentSelect.value);
_36=true;
}
if(this._editors.authors){
if(_36){
_39.authors=[];
_3a=this._editors.authors.getValues();
for(i in _3a){
if(_3a[i].name||_3a[i].email||_3a[i].uri){
_39.addAuthor(_3a[i].name,_3a[i].email,_3a[i].uri);
}
}
}else{
var _3c=_39.authors;
var _3d=function(_3e,_3f,uri){
for(i in _3c){
if(_3c[i].name===_3e&&_3c[i].email===_3f&&_3c[i].uri===uri){
return true;
}
}
return false;
};
_3a=this._editors.authors.getValues();
_38=false;
for(i in _3a){
if(!_3d(_3a[i].name,_3a[i].email,_3a[i].uri)){
_38=true;
break;
}
}
if(_38){
_39.authors=[];
for(i in _3a){
if(_3a[i].name||_3a[i].email||_3a[i].uri){
_39.addAuthor(_3a[i].name,_3a[i].email,_3a[i].uri);
}
}
_36=true;
}
}
}
if(this._editors.contributors){
if(_36){
_39.contributors=[];
_3b=this._editors.contributors.getValues();
for(i in _3b){
if(_3b[i].name||_3b[i].email||_3b[i].uri){
_39.addAuthor(_3b[i].name,_3b[i].email,_3b[i].uri);
}
}
}else{
var _40=_39.contributors;
var _41=function(_42,_43,uri){
for(i in _40){
if(_40[i].name===_42&&_40[i].email===_43&&_40[i].uri===uri){
return true;
}
}
return false;
};
_3b=this._editors.contributors.getValues();
_38=false;
for(i in _3b){
if(_41(_3b[i].name,_3b[i].email,_3b[i].uri)){
_38=true;
break;
}
}
if(_38){
_39.contributors=[];
for(i in _3b){
if(_3b[i].name||_3b[i].email||_3b[i].uri){
_39.addContributor(_3b[i].name,_3b[i].email,_3b[i].uri);
}
}
_36=true;
}
}
}
if(_36){
_1.publish(this.entrySelectionTopic,[{action:"update",source:this,entry:_39,callback:this._handleSave}]);
}
}else{
this._new=false;
_39=new _3.atom.io.model.Entry();
_37=this._editors.title.attr("value");
if(this.entryTitleSelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
_39.setTitle(_37,this.entryTitleSelect.value);
_39.id=this._editors.id.attr("value");
_3a=this._editors.authors.getValues();
for(i in _3a){
if(_3a[i].name||_3a[i].email||_3a[i].uri){
_39.addAuthor(_3a[i].name,_3a[i].email,_3a[i].uri);
}
}
_3b=this._editors.contributors.getValues();
for(i in _3b){
if(_3b[i].name||_3b[i].email||_3b[i].uri){
_39.addContributor(_3b[i].name,_3b[i].email,_3b[i].uri);
}
}
_37=this._editors.summary.attr("value");
if(this.entrySummarySelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
_39.summary=new _3.atom.io.model.Content("summary",_37,null,this.entrySummarySelect.value);
_37=this._editors.content.attr("value");
if(this.entryContentSelect.value==="xhtml"){
_37=this._enforceXhtml(_37);
_37="<div xmlns=\"http://www.w3.org/1999/xhtml\">"+_37+"</div>";
}
_39.content=new _3.atom.io.model.Content("content",_37,null,this.entryContentSelect.value);
_1.style(this.entryNewButton,"display","");
_1.publish(this.entrySelectionTopic,[{action:"post",source:this,entry:_39}]);
}
this._editMode=false;
this.setEntry(_39,this._feed,true);
},_handleSave:function(_44,_45){
this._editMode=false;
this.clear();
this.setEntry(_44,this.getFeed(),true);
},cancelEdits:function(){
this._new=false;
_1.style(this.entrySaveCancelButtons,"display","none");
if(this._editable){
_1.style(this.entryEditButton,"display","");
}
_1.style(this.entryNewButton,"display","");
this._editMode=false;
this.clearEditors();
this.setEntry(this.getEntry(),this.getFeed(),true);
},clear:function(){
this._editable=false;
this.clearEditors();
_3.atom.widget.FeedEntryEditor.superclass.clear.apply(this);
if(this._contentEditor){
this._contentEditor=this._setObject=this._oldContent=this._contentEditorCreator=null;
this._editors={};
}
},clearEditors:function(){
for(var key in this._editors){
if(this._editors[key].declaredClass==="dijit.Editor"){
this._editors[key].close(false,true);
}
this._editors[key].destroy();
}
this._editors={};
},_enforceXhtml:function(_46){
var _47=null;
if(_46){
var _48=/<br>/g;
_47=_46.replace(_48,"<br/>");
_47=this._closeTag(_47,"hr");
_47=this._closeTag(_47,"img");
}
return _47;
},_closeTag:function(_49,tag){
var _4a="<"+tag;
var _4b=_49.indexOf(_4a);
if(_4b!==-1){
while(_4b!==-1){
var _4c="";
var _4d=false;
for(var i=0;i<_49.length;i++){
var c=_49.charAt(i);
if(i<=_4b||_4d){
_4c+=c;
}else{
if(c===">"){
_4c+="/";
_4d=true;
}
_4c+=c;
}
}
_49=_4c;
_4b=_49.indexOf(_4a,_4b+1);
}
}
return _49;
},_toggleNew:function(){
_1.style(this.entryNewButton,"display","none");
_1.style(this.entryEditButton,"display","none");
_1.style(this.entrySaveCancelButtons,"display","");
this.entrySummarySelect.value="text";
this.entryContentSelect.value="text";
this.entryTitleSelect.value="text";
this.clearNodes();
this._new=true;
var _4e=_1.i18n.getLocalization("dojox.atom.widget","FeedEntryViewer");
var _4f=new _3.atom.widget.EntryHeader({title:_4e.title});
this.entryTitleHeader.appendChild(_4f.domNode);
this._editors.title=this._createEditor(this.entryTitleNode,null);
this.setFieldValidity("title",true);
var _50=new _3.atom.widget.EntryHeader({title:_4e.authors});
this.entryAuthorHeader.appendChild(_50.domNode);
this._editors.authors=this._createPeopleEditor(this.entryAuthorNode,{name:"Author"});
this.setFieldValidity("authors",true);
var _51=new _3.atom.widget.EntryHeader({title:_4e.contributors});
this.entryContributorHeader.appendChild(_51.domNode);
this._editors.contributors=this._createPeopleEditor(this.entryContributorNode,{name:"Contributor"});
this.setFieldValidity("contributors",true);
var _52=new _3.atom.widget.EntryHeader({title:_4e.id});
this.entryIdHeader.appendChild(_52.domNode);
this._editors.id=this._createEditor(this.entryIdNode,null);
this.setFieldValidity("id",true);
var _53=new _3.atom.widget.EntryHeader({title:_4e.updated});
this.entryUpdatedHeader.appendChild(_53.domNode);
this._editors.updated=this._createEditor(this.entryUpdatedNode,null);
this.setFieldValidity("updated",true);
var _54=new _3.atom.widget.EntryHeader({title:_4e.summary});
this.entrySummaryHeader.appendChild(_54.domNode);
this._editors.summary=this._createEditor(this.entrySummaryNode,null,true);
this.setFieldValidity("summaryedit",true);
this.setFieldValidity("summary",true);
var _55=new _3.atom.widget.EntryHeader({title:_4e.content});
this.entryContentHeader.appendChild(_55.domNode);
this._editors.content=this._createEditor(this.entryContentNode,null,true);
this.setFieldValidity("contentedit",true);
this.setFieldValidity("content",true);
this._displaySections();
},_displaySections:function(){
_1.style(this.entrySummarySelect,"display","none");
_1.style(this.entryContentSelect,"display","none");
_1.style(this.entryTitleSelect,"display","none");
if(this.isFieldValid("contentedit")){
_1.style(this.entryContentSelect,"display","");
}
if(this.isFieldValid("summaryedit")){
_1.style(this.entrySummarySelect,"display","");
}
if(this.isFieldValid("titleedit")){
_1.style(this.entryTitleSelect,"display","");
}
_3.atom.widget.FeedEntryEditor.superclass._displaySections.apply(this);
if(this._toLoad){
for(var i in this._toLoad){
var _56;
if(this._toLoad[i].generateEditor){
_56=_1.hitch(this._toLoad[i],this._toLoad[i].generateEditor)();
}else{
_56=this._toLoad[i];
}
this._editors[this._toLoad[i].name]=_56;
this._toLoad[i]=null;
}
this._toLoad=null;
}
}});
_1.declare("dojox.atom.widget.PeopleEditor",[_2._Widget,_2._Templated,_2._Container],{templateString:_1.cache("dojox.atom","widget/templates/PeopleEditor.html","<div class=\"peopleEditor\">\n\t<table style=\"width: 100%\">\n\t\t<tbody dojoAttachPoint=\"peopleEditorEditors\"></tbody>\n\t</table>\n\t<span class=\"peopleEditorButton\" dojoAttachPoint=\"peopleEditorButton\" dojoAttachEvent=\"onclick:_add\"></span>\n</div>"),_rows:[],_editors:[],_index:0,_numRows:0,postCreate:function(){
var _57=_1.i18n.getLocalization("dojox.atom.widget","PeopleEditor");
if(this.name){
if(this.name=="Author"){
this.peopleEditorButton.appendChild(document.createTextNode("["+_57.addAuthor+"]"));
}else{
if(this.name=="Contributor"){
this.peopleEditorButton.appendChild(document.createTextNode("["+_57.addContributor+"]"));
}
}
}else{
this.peopleEditorButton.appendChild(document.createTextNode("["+_57.add+"]"));
}
this._editors=[];
if(!this.data||this.data.length===0){
this._createEditors(null,null,null,0,this.name);
this._index=1;
}else{
for(var i in this.data){
this._createEditors(this.data[i].name,this.data[i].email,this.data[i].uri,i);
this._index++;
this._numRows++;
}
}
},destroy:function(){
for(var key in this._editors){
for(var _58 in this._editors[key]){
this._editors[key][_58].destroy();
}
}
this._editors=[];
},_createEditors:function(_59,_5a,uri,_5b,_5c){
var row=document.createElement("tr");
this.peopleEditorEditors.appendChild(row);
row.id="removeRow"+_5b;
var _5d=document.createElement("td");
_5d.setAttribute("align","right");
row.appendChild(_5d);
_5d.colSpan=2;
if(this._numRows>0){
var hr=document.createElement("hr");
_5d.appendChild(hr);
hr.id="hr"+_5b;
}
row=document.createElement("span");
_5d.appendChild(row);
row.className="peopleEditorButton";
_1.style(row,"font-size","x-small");
_1.connect(row,"onclick",this,"_removeEditor");
row.id="remove"+_5b;
_5d=document.createTextNode("[X]");
row.appendChild(_5d);
row=document.createElement("tr");
this.peopleEditorEditors.appendChild(row);
row.id="editorsRow"+_5b;
var _5e=document.createElement("td");
row.appendChild(_5e);
_1.style(_5e,"width","20%");
_5d=document.createElement("td");
row.appendChild(_5d);
row=document.createElement("table");
_5e.appendChild(row);
_1.style(row,"width","100%");
_5e=document.createElement("tbody");
row.appendChild(_5e);
row=document.createElement("table");
_5d.appendChild(row);
_1.style(row,"width","100%");
_5d=document.createElement("tbody");
row.appendChild(_5d);
this._editors[_5b]=[];
this._editors[_5b].push(this._createEditor(_59,_5c+"name"+_5b,"Name:",_5e,_5d));
this._editors[_5b].push(this._createEditor(_5a,_5c+"email"+_5b,"Email:",_5e,_5d));
this._editors[_5b].push(this._createEditor(uri,_5c+"uri"+_5b,"URI:",_5e,_5d));
},_createEditor:function(_5f,id,_60,_61,_62){
var row=document.createElement("tr");
_61.appendChild(row);
var _63=document.createElement("label");
_63.setAttribute("for",id);
_63.appendChild(document.createTextNode(_60));
_61=document.createElement("td");
_61.appendChild(_63);
row.appendChild(_61);
row=document.createElement("tr");
_62.appendChild(row);
_62=document.createElement("td");
row.appendChild(_62);
var _64=document.createElement("input");
_64.setAttribute("id",id);
_62.appendChild(_64);
_1.style(_64,"width","95%");
var box=new _2.form.TextBox({},_64);
box.attr("value",_5f);
return box;
},_removeEditor:function(_65){
var _66=null;
if(_1.isIE){
_66=_65.srcElement;
}else{
_66=_65.target;
}
var id=_66.id;
id=id.substring(6);
for(var key in this._editors[id]){
this._editors[id][key].destroy();
}
var _67=_1.byId("editorsRow"+id);
var _68=_67.parentNode;
_68.removeChild(_67);
_67=_1.byId("removeRow"+id);
_68=_67.parentNode;
_68.removeChild(_67);
this._numRows--;
if(this._numRows===1&&_68.firstChild.firstChild.firstChild.tagName.toLowerCase()==="hr"){
_67=_68.firstChild.firstChild;
_67.removeChild(_67.firstChild);
}
this._editors[id]=null;
},_add:function(){
this._createEditors(null,null,null,this._index);
this._index++;
this._numRows++;
},getValues:function(){
var _69=[];
for(var i in this._editors){
if(this._editors[i]){
_69.push({name:this._editors[i][0].attr("value"),email:this._editors[i][1].attr("value"),uri:this._editors[i][2].attr("value")});
}
}
return _69;
}});
return _1.getObject("dojox.atom.widget.FeedEntryEditor");
});
require(["dojox/atom/widget/FeedEntryEditor"]);
