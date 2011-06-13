/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dijit/templates/ColorPalette.html"]="<div class=\"dijitInline dijitColorPalette\">\n\t<table class=\"dijitPaletteTable\" cellSpacing=\"0\" cellPadding=\"0\">\n\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n\t</table>\n</div>\n";
define("dijit/ColorPalette",["dojo/_base/kernel",".","dojo/text!./templates/ColorPalette.html","./_Widget","./_TemplatedMixin","dojo/colors","dojo/i18n","./_PaletteMixin","dojo/i18n!dojo/nls/colors","dojo/_base/Color","dojo/_base/declare","dojo/_base/html","dojo/_base/url","dojo/_base/window","dojo/string"],function(_1,_2,_3){
_1.declare("dijit.ColorPalette",[_2._Widget,_2._TemplatedMixin,_2._PaletteMixin],{palette:"7x10",_palettes:{"7x10":[["white","seashell","cornsilk","lemonchiffon","lightyellow","palegreen","paleturquoise","lightcyan","lavender","plum"],["lightgray","pink","bisque","moccasin","khaki","lightgreen","lightseagreen","lightskyblue","cornflowerblue","violet"],["silver","lightcoral","sandybrown","orange","palegoldenrod","chartreuse","mediumturquoise","skyblue","mediumslateblue","orchid"],["gray","red","orangered","darkorange","yellow","limegreen","darkseagreen","royalblue","slateblue","mediumorchid"],["dimgray","crimson","chocolate","coral","gold","forestgreen","seagreen","blue","blueviolet","darkorchid"],["darkslategray","firebrick","saddlebrown","sienna","olive","green","darkcyan","mediumblue","darkslateblue","darkmagenta"],["black","darkred","maroon","brown","darkolivegreen","darkgreen","midnightblue","navy","indigo","purple"]],"3x4":[["white","lime","green","blue"],["silver","yellow","fuchsia","navy"],["gray","red","purple","black"]]},templateString:_3,baseClass:"dijitColorPalette",buildRendering:function(){
this.inherited(arguments);
this._preparePalette(this._palettes[this.palette],_1.i18n.getLocalization("dojo","colors",this.lang),_1.declare(_2._Color,{hc:_1.hasClass(_1.body(),"dijit_a11y"),palette:this.palette}));
}});
_1.declare("dijit._Color",_1.Color,{template:"<span class='dijitInline dijitPaletteImg'>"+"<img src='${blankGif}' alt='${alt}' class='dijitColorPaletteSwatch' style='background-color: ${color}'/>"+"</span>",hcTemplate:"<span class='dijitInline dijitPaletteImg' style='position: relative; overflow: hidden; height: 12px; width: 14px;'>"+"<img src='${image}' alt='${alt}' style='position: absolute; left: ${left}px; top: ${top}px; ${size}'/>"+"</span>",_imagePaths:{"7x10":_1.moduleUrl("dijit.themes","a11y/colors7x10.png"),"3x4":_1.moduleUrl("dijit.themes","a11y/colors3x4.png")},constructor:function(_4,_5,_6){
this._alias=_4;
this._row=_5;
this._col=_6;
this.setColor(_1.Color.named[_4]);
},getValue:function(){
return this.toHex();
},fillCell:function(_7,_8){
var _9=_1.string.substitute(this.hc?this.hcTemplate:this.template,{color:this.toHex(),blankGif:_8,alt:this._alias,image:this._imagePaths[this.palette].toString(),left:this._col*-20-5,top:this._row*-20-5,size:this.palette=="7x10"?"height: 145px; width: 206px":"height: 64px; width: 86px"});
_1.place(_9,_7);
}});
return _2.ColorPalette;
});
