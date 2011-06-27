/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/fx/Toggler",["../main"],function(_1){
_1.declare("dojo.fx.Toggler",null,{node:null,showFunc:_1.fadeIn,hideFunc:_1.fadeOut,showDuration:200,hideDuration:200,constructor:function(_2){
var _3=this;
_1.mixin(_3,_2);
_3.node=_2.node;
_3._showArgs=_1.mixin({},_2);
_3._showArgs.node=_3.node;
_3._showArgs.duration=_3.showDuration;
_3.showAnim=_3.showFunc(_3._showArgs);
_3._hideArgs=_1.mixin({},_2);
_3._hideArgs.node=_3.node;
_3._hideArgs.duration=_3.hideDuration;
_3.hideAnim=_3.hideFunc(_3._hideArgs);
_1.connect(_3.showAnim,"beforeBegin",_1.hitch(_3.hideAnim,"stop",true));
_1.connect(_3.hideAnim,"beforeBegin",_1.hitch(_3.showAnim,"stop",true));
},show:function(_4){
return this.showAnim.play(_4||0);
},hide:function(_5){
return this.hideAnim.play(_5||0);
}});
return _1.fx.Toggler;
});
