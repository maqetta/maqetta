/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/ColorPalette.html"]="<div class=\"dijitInline dijitColorPalette\">\n\t<table class=\"dijitPaletteTable\" cellSpacing=\"0\" cellPadding=\"0\">\n\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n\t</table>\n</div>\n";
define("dijit/ColorPalette",["require","dojo/_base/kernel",".","dojo/text!./templates/ColorPalette.html","./_Widget","./_TemplatedMixin","dojo/colors","dojo/i18n","./_PaletteMixin","dojo/i18n!dojo/nls/colors","dojo/_base/Color","dojo/_base/declare","dojo/_base/html","dojo/_base/window","dojo/string"],function(_1,_2,_3,_4){
_2.declare("dijit.ColorPalette",[_3._Widget,_3._TemplatedMixin,_3._PaletteMixin],{palette:"7x10",_palettes:{"7x10":[["white","seashell","cornsilk","lemonchiffon","lightyellow","palegreen","paleturquoise","lightcyan","lavender","plum"],["lightgray","pink","bisque","moccasin","khaki","lightgreen","lightseagreen","lightskyblue","cornflowerblue","violet"],["silver","lightcoral","sandybrown","orange","palegoldenrod","chartreuse","mediumturquoise","skyblue","mediumslateblue","orchid"],["gray","red","orangered","darkorange","yellow","limegreen","darkseagreen","royalblue","slateblue","mediumorchid"],["dimgray","crimson","chocolate","coral","gold","forestgreen","seagreen","blue","blueviolet","darkorchid"],["darkslategray","firebrick","saddlebrown","sienna","olive","green","darkcyan","mediumblue","darkslateblue","darkmagenta"],["black","darkred","maroon","brown","darkolivegreen","darkgreen","midnightblue","navy","indigo","purple"]],"3x4":[["white","lime","green","blue"],["silver","yellow","fuchsia","navy"],["gray","red","purple","black"]]},templateString:_4,baseClass:"dijitColorPalette",buildRendering:function(){
this.inherited(arguments);
this._preparePalette(this._palettes[this.palette],_2.i18n.getLocalization("dojo","colors",this.lang),_2.declare(_3._Color,{hc:_2.hasClass(_2.body(),"dijit_a11y"),palette:this.palette}));
}});
_2.declare("dijit._Color",_2.Color,{template:"<span class='dijitInline dijitPaletteImg'>"+"<img src='${blankGif}' alt='${alt}' class='dijitColorPaletteSwatch' style='background-color: ${color}'/>"+"</span>",hcTemplate:"<span class='dijitInline dijitPaletteImg' style='position: relative; overflow: hidden; height: 12px; width: 14px;'>"+"<img src='${image}' alt='${alt}' style='position: absolute; left: ${left}px; top: ${top}px; ${size}'/>"+"</span>",_imagePaths:{"7x10":_1.toUrl("./themes/a11y/colors7x10.png"),"3x4":_1.toUrl("./themes/a11y/colors3x4.png")},constructor:function(_5,_6,_7){
this._alias=_5;
this._row=_6;
this._col=_7;
this.setColor(_2.Color.named[_5]);
},getValue:function(){
return this.toHex();
},fillCell:function(_8,_9){
var _a=_2.string.substitute(this.hc?this.hcTemplate:this.template,{color:this.toHex(),blankGif:_9,alt:this._alias,image:this._imagePaths[this.palette].toString(),left:this._col*-20-5,top:this._row*-20-5,size:this.palette=="7x10"?"height: 145px; width: 206px":"height: 64px; width: 86px"});
_2.place(_a,_8);
}});
return _3.ColorPalette;
});
