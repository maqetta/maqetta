/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/rotator/ThumbnailController",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.widget.rotator.ThumbnailController",1);
(function(d){
var _4="dojoxRotatorThumb",_5=_4+"Selected";
d.declare("dojox.widget.rotator.ThumbnailController",null,{rotator:null,constructor:function(_6,_7){
d.mixin(this,_6);
this._domNode=_7;
var r=this.rotator;
if(r){
while(_7.firstChild){
_7.removeChild(_7.firstChild);
}
for(var i=0;i<r.panes.length;i++){
var n=r.panes[i].node,s=d.attr(n,"thumbsrc")||d.attr(n,"src"),t=d.attr(n,"alt")||"";
if(/img/i.test(n.tagName)){
(function(j){
d.create("a",{classname:_4+" "+_4+j+" "+(j==r.idx?_5:""),href:s,onclick:function(e){
d.stopEvent(e);
if(r){
r.control.apply(r,["go",j]);
}
},title:t,innerHTML:"<img src=\""+s+"\" alt=\""+t+"\"/>"},_7);
})(i);
}
}
this._con=d.connect(r,"onUpdate",this,"_onUpdate");
}
},destroy:function(){
d.disconnect(this._con);
d.destroy(this._domNode);
},_onUpdate:function(_8){
var r=this.rotator;
if(_8=="onAfterTransition"){
var n=d.query("."+_4,this._domNode).removeClass(_5);
if(r.idx<n.length){
d.addClass(n[r.idx],_5);
}
}
}});
})(_1);
return _1.getObject("dojox.widget.rotator.ThumbnailController");
});
require(["dojox/widget/rotator/ThumbnailController"]);
