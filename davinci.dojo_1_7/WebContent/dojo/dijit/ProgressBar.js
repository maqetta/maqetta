/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/ProgressBar.html"]="<div class=\"dijitProgressBar dijitProgressBarEmpty\" role=\"progressbar\"\n\t><div  dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\" role=\"presentation\"></div\n\t\t><span style=\"visibility:hidden\">&nbsp;</span\n\t></div\n\t><div dojoAttachPoint=\"labelNode\" class=\"dijitProgressBarLabel\" id=\"${id}_label\"></div\n\t><img dojoAttachPoint=\"indeterminateHighContrastImage\" class=\"dijitProgressBarIndeterminateHighContrastImage\" alt=\"\"\n/></div>\n";
define("dijit/ProgressBar",["require","dojo/_base/kernel",".","dojo/text!./templates/ProgressBar.html","dojo/number","./_Widget","./_TemplatedMixin","dojo/_base/html"],function(_1,_2,_3,_4){
_2.declare("dijit.ProgressBar",[_3._Widget,_3._TemplatedMixin],{progress:"0",value:"",maximum:100,places:0,indeterminate:false,label:"",name:"",templateString:_4,_indeterminateHighContrastImagePath:_1.toUrl("./themes/a11y/indeterminate_progress.gif"),postMixInProperties:function(){
this.inherited(arguments);
if(!("value" in this.params)){
this.value=this.indeterminate?Infinity:this.progress;
}
},buildRendering:function(){
this.inherited(arguments);
this.indeterminateHighContrastImage.setAttribute("src",this._indeterminateHighContrastImagePath.toString());
this.update();
},update:function(_5){
_2.mixin(this,_5||{});
var _6=this.internalProgress,ap=this.domNode;
var _7=1;
if(this.indeterminate){
ap.removeAttribute("aria-valuenow");
ap.removeAttribute("aria-valuemin");
ap.removeAttribute("aria-valuemax");
}else{
if(String(this.progress).indexOf("%")!=-1){
_7=Math.min(parseFloat(this.progress)/100,1);
this.progress=_7*this.maximum;
}else{
this.progress=Math.min(this.progress,this.maximum);
_7=this.maximum?this.progress/this.maximum:0;
}
ap.setAttribute("aria-describedby",this.labelNode.id);
ap.setAttribute("aria-valuenow",this.progress);
ap.setAttribute("aria-valuemin",0);
ap.setAttribute("aria-valuemax",this.maximum);
}
this.labelNode.innerHTML=this.report(_7);
_2.toggleClass(this.domNode,"dijitProgressBarIndeterminate",this.indeterminate);
_6.style.width=(_7*100)+"%";
this.onChange();
},_setValueAttr:function(v){
this._set("value",v);
if(v==Infinity){
this.update({indeterminate:true});
}else{
this.update({indeterminate:false,progress:v});
}
},_setLabelAttr:function(_8){
this._set("label",_8);
this.update();
},_setIndeterminateAttr:function(_9){
this.indeterminate=_9;
this.update();
},report:function(_a){
return this.label?this.label:(this.indeterminate?"&nbsp;":_2.number.format(_a,{type:"percent",places:this.places,locale:this.lang}));
},onChange:function(){
}});
return _3.ProgressBar;
});
