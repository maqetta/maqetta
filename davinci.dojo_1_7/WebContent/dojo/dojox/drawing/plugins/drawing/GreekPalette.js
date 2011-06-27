/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/drawing/GreekPalette",["dojo","dijit","dojox","dojo/i18n","dojox/editor/plugins/nls/latinEntities"],function(_1,_2,_3){
_1.getObject("dojox.drawing.plugins.drawing.GreekPalette",1);
define(["dojo","dijit","dijit/focus","dijit/_base/popup","../../library/greek","dijit/_Widget","dijit/_TemplatedMixin","dijit/_PaletteMixin","dojo/i18n"],function(_4,_5){
_4.getObject("drawing.plugins.drawing",true,_3);
_4.requireLocalization("dojox.editor.plugins","latinEntities");
_4.declare("dojox.drawing.plugins.drawing.GreekPalette",[_5._Widget,_5._TemplatedMixin,_5._PaletteMixin],{postMixInProperties:function(){
var _6=_3.drawing.library.greek;
var _7=0;
var _8;
for(_8 in _6){
_7++;
}
var _9=Math.floor(Math.sqrt(_7));
var _a=_9;
var _b=0;
var _c=[];
var _d=[];
for(_8 in _6){
_b++;
_d.push(_8);
if(_b%_a===0){
_c.push(_d);
_d=[];
}
}
if(_d.length>0){
_c.push(_d);
}
this._palette=_c;
},show:function(_e){
_4.mixin(_e,{popup:this});
_5.popup.open(_e);
},onChange:function(_f){
var _10=this._textBlock;
_5.popup.hide(this);
_10.insertText(this._pushChangeTo,_f);
_10._dropMode=false;
},onCancel:function(_11){
_5.popup.hide(this);
this._textBlock._dropMode=false;
},templateString:"<div class=\"dojoxEntityPalette\">\n"+"\t<table>\n"+"\t\t<tbody>\n"+"\t\t\t<tr>\n"+"\t\t\t\t<td>\n"+"\t\t\t\t\t<table class=\"dijitPaletteTable\">\n"+"\t\t\t\t\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n"+"\t\t\t\t   </table>\n"+"\t\t\t\t</td>\n"+"\t\t\t</tr>\n"+"\t\t\t<tr>\n"+"\t\t\t\t<td>\n"+"\t\t\t\t\t<table dojoAttachPoint=\"previewPane\" class=\"dojoxEntityPalettePreviewTable\">\n"+"\t\t\t\t\t\t<tbody>\n"+"\t\t\t\t\t\t\t<tr>\n"+"\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetailEntity\">Type: <span class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"previewNode\"></span></td>\n"+"\t\t\t\t\t\t\t</tr>\n"+"\t\t\t\t\t\t</tbody>\n"+"\t\t\t\t\t</table>\n"+"\t\t\t\t</td>\n"+"\t\t\t</tr>\n"+"\t\t</tbody>\n"+"\t</table>\n"+"</div>",baseClass:"dojoxEntityPalette",showPreview:true,dyeClass:"dojox.drawing.plugins.Greeks",paletteClass:"editorLatinEntityPalette",cellClass:"dojoxEntityPaletteCell",buildRendering:function(){
this.inherited(arguments);
var _12=_4.i18n.getLocalization("dojox.editor.plugins","latinEntities");
this._preparePalette(this._palette,_12);
var _13=_4.query(".dojoxEntityPaletteCell",this.gridNode);
_4.forEach(_13,function(_14){
this.connect(_14,"onmouseenter","_onCellMouseEnter");
},this);
},_onCellMouseEnter:function(e){
if(this.showPreview){
this._displayDetails(e.target);
}
},_onCellClick:function(evt){
var _15=evt.type=="click"?evt.currentTarget:this._currentFocus,_16=this._getDye(_15).getValue();
this._setCurrent(_15);
setTimeout(_4.hitch(this,function(){
_5.focus(_15);
this._setValueAttr(_16,true);
}));
_4.removeClass(_15,"dijitPaletteCellHover");
_4.stopEvent(evt);
},postCreate:function(){
this.inherited(arguments);
if(!this.showPreview){
_4.style(this.previewNode,"display","none");
}
_5.popup.moveOffScreen(this);
},_setCurrent:function(_17){
if("_currentFocus" in this){
_4.attr(this._currentFocus,"tabIndex","-1");
_4.removeClass(this._currentFocus,"dojoxEntityPaletteCellHover");
}
this._currentFocus=_17;
if(_17){
_4.attr(_17,"tabIndex",this.tabIndex);
_4.addClass(this._currentFocus,"dojoxEntityPaletteCellHover");
}
if(this.showPreview){
this._displayDetails(_17);
}
},_displayDetails:function(_18){
var dye=this._getDye(_18);
if(dye){
var _19=dye.getValue();
var _1a=dye._alias;
this.previewNode.innerHTML=_19;
}else{
this.previewNode.innerHTML="";
this.descNode.innerHTML="";
}
},_preparePalette:function(_1b,_1c){
this._cells=[];
var url=this._blankGif;
var _1d=_4.getObject(this.dyeClass);
for(var row=0;row<_1b.length;row++){
var _1e=_4.create("tr",{tabIndex:"-1"},this.gridNode);
for(var col=0;col<_1b[row].length;col++){
var _1f=_1b[row][col];
if(_1f){
var _20=new _1d(_1f);
var _21=_4.create("td",{"class":this.cellClass,tabIndex:"-1",title:_1c[_1f]});
_20.fillCell(_21,url);
this.connect(_21,"ondijitclick","_onCellClick");
this._trackMouseState(_21,this.cellClass);
_4.place(_21,_1e);
_21.index=this._cells.length;
this._cells.push({node:_21,dye:_20});
}
}
}
this._xDim=_1b[0].length;
this._yDim=_1b.length;
},_navigateByArrow:function(evt){
var _22={38:-this._xDim,40:this._xDim,39:this.isLeftToRight()?1:-1,37:this.isLeftToRight()?-1:1};
var _23=_22[evt.keyCode];
var _24=this._currentFocus.index+_23;
if(_24<this._cells.length&&_24>-1){
var _25=this._cells[_24].node;
this._setCurrent(_25);
}
}});
_4.declare("dojox.drawing.plugins.Greeks",null,{constructor:function(_26){
this._alias=_26;
},getValue:function(){
return this._alias;
},fillCell:function(_27){
_27.innerHTML="&"+this._alias+";";
}});
return _3.drawing.plugins.drawing.GreekPalette;
});
return _1.getObject("dojox.drawing.plugins.drawing.GreekPalette");
});
require(["dojox/drawing/plugins/drawing/GreekPalette"]);
