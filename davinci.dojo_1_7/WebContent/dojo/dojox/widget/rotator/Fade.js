/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/rotator/Fade",["dojo","dijit","dojox","dojo/fx"],function(_1,_2,_3){
_1.getObject("dojox.widget.rotator.Fade",1);
(function(d){
function _4(_5,_6){
var n=_5.next.node;
d.style(n,{display:"",opacity:0});
_5.node=_5.current.node;
return d.fx[_6]([d.fadeOut(_5),d.fadeIn(d.mixin(_5,{node:n}))]);
};
d.mixin(_3.widget.rotator,{fade:function(_7){
return _4(_7,"chain");
},crossFade:function(_8){
return _4(_8,"combine");
}});
})(_1);
return _1.getObject("dojox.widget.rotator.Fade");
});
require(["dojox/widget/rotator/Fade"]);
