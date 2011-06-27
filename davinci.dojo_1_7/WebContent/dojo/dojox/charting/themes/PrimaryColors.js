/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/PrimaryColors",["../Theme","./gradientGenerator","./common"],function(_1,_2){
var _3=dojox.charting.themes,_4=["#f00","#0f0","#00f","#ff0","#0ff","#f0f","./common"],_5={type:"linear",space:"plot",x1:0,y1:0,x2:0,y2:100};
_3.PrimaryColors=new _1({seriesThemes:_2.generateMiniTheme(_4,_5,90,40,25)});
return _3.PrimaryColors;
});
