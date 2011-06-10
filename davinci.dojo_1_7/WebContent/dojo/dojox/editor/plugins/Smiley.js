/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojox/editor/plugins/Smiley",["dojo","dijit","dojox","dijit/_editor/_Plugin","dijit/form/DropDownButton","dojox/editor/plugins/_SmileyPalette","dojo/i18n","dojox/html/format","dojo/i18n!dojox/editor/plugins/nls/Smiley"],function(_1,_2,_3){
_1.experimental("dojox.editor.plugins.Smiley");
_1.declare("dojox.editor.plugins.Smiley",_2._editor._Plugin,{iconClassPrefix:"dijitAdditionalEditorIcon",emoticonMarker:"[]",emoticonImageClass:"dojoEditorEmoticon",_initButton:function(){
this.dropDown=new _3.editor.plugins._SmileyPalette();
this.connect(this.dropDown,"onChange",function(_4){
this.button.closeDropDown();
this.editor.focus();
_4=this.emoticonMarker.charAt(0)+_4+this.emoticonMarker.charAt(1);
this.editor.execCommand("inserthtml",_4);
});
this.i18n=_1.i18n.getLocalization("dojox.editor.plugins","Smiley");
this.button=new _2.form.DropDownButton({label:this.i18n.smiley,showLabel:false,iconClass:this.iconClassPrefix+" "+this.iconClassPrefix+"Smiley",tabIndex:"-1",dropDown:this.dropDown});
this.emoticonImageRegexp=new RegExp("class=(\"|')"+this.emoticonImageClass+"(\"|')");
},updateState:function(){
this.button.set("disabled",this.get("disabled"));
},setEditor:function(_5){
this.editor=_5;
this._initButton();
this.editor.contentPreFilters.push(_1.hitch(this,this._preFilterEntities));
this.editor.contentPostFilters.push(_1.hitch(this,this._postFilterEntities));
},_preFilterEntities:function(_6){
return _6.replace(/\[([^\]]*)\]/g,_1.hitch(this,this._decode));
},_postFilterEntities:function(_7){
return _7.replace(/<img [^>]*>/gi,_1.hitch(this,this._encode));
},_decode:function(_8,_9){
var _a=_3.editor.plugins.Emoticon.fromAscii(_9);
return _a?_a.imgHtml(this.emoticonImageClass):_8;
},_encode:function(_b){
if(_b.search(this.emoticonImageRegexp)>-1){
return this.emoticonMarker.charAt(0)+_b.replace(/(<img [^>]*)alt="([^"]*)"([^>]*>)/,"$2")+this.emoticonMarker.charAt(1);
}else{
return _b;
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
if(o.args.name==="smiley"){
o.plugin=new _3.editor.plugins.Smiley();
}
});
return _3.editor.plugins.Smiley;
});
