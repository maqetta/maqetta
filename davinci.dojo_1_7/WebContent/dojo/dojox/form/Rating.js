/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/Rating",["dojo","dijit","dojox","dijit/form/_FormWidget"],function(_1,_2,_3){
_1.getObject("dojox.form.Rating",1);
_1.declare("dojox.form.Rating",_2.form._FormWidget,{templateString:null,numStars:3,value:0,constructor:function(_4){
_1.mixin(this,_4);
var _5="<div dojoAttachPoint=\"domNode\" class=\"dojoxRating dijitInline\">"+"<input type=\"hidden\" value=\"0\" dojoAttachPoint=\"focusNode\" /><ul>${stars}</ul>"+"</div>";
var _6="<li class=\"dojoxRatingStar dijitInline\" dojoAttachEvent=\"onclick:onStarClick,onmouseover:_onMouse,onmouseout:_onMouse\" value=\"${value}\"></li>";
var _7="";
for(var i=0;i<this.numStars;i++){
_7+=_1.string.substitute(_6,{value:i+1});
}
this.templateString=_1.string.substitute(_5,{stars:_7});
},postCreate:function(){
this.inherited(arguments);
this._renderStars(this.value);
},_onMouse:function(_8){
if(this.hovering){
var _9=+_1.attr(_8.target,"value");
this.onMouseOver(_8,_9);
this._renderStars(_9,true);
}else{
this._renderStars(this.value);
}
},_renderStars:function(_a,_b){
_1.query(".dojoxRatingStar",this.domNode).forEach(function(_c,i){
if(i+1>_a){
_1.removeClass(_c,"dojoxRatingStarHover");
_1.removeClass(_c,"dojoxRatingStarChecked");
}else{
_1.removeClass(_c,"dojoxRatingStar"+(_b?"Checked":"Hover"));
_1.addClass(_c,"dojoxRatingStar"+(_b?"Hover":"Checked"));
}
});
},onStarClick:function(_d){
var _e=+_1.attr(_d.target,"value");
this.setAttribute("value",_e==this.value?0:_e);
this._renderStars(this.value);
this.onChange(this.value);
},onMouseOver:function(){
},setAttribute:function(_f,_10){
this.inherited("setAttribute",arguments);
if(_f=="value"){
this._renderStars(this.value);
this.onChange(this.value);
}
}});
return _1.getObject("dojox.form.Rating");
});
require(["dojox/form/Rating"]);
