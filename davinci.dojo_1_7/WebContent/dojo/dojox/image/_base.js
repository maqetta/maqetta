/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/image/_base",["dojo","dojox"],function(_1,_2){
_1.getObject("image",true,_2);
var d=_1;
var _3;
_2.image.preload=function(_4){
if(!_3){
_3=d.create("div",{style:{position:"absolute",top:"-9999px",height:"1px",overflow:"hidden"}},d.body());
}
return d.map(_4,function(_5){
return d.create("img",{src:_5},_3);
});
};
if(d.config.preloadImages){
d.addOnLoad(function(){
_2.image.preload(d.config.preloadImages);
});
}
});
