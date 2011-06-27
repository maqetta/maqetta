/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/HorizontalRule",["dojo/_base/kernel","..","../_Widget","../_TemplatedMixin"],function(_1,_2){
_1.declare("dijit.form.HorizontalRule",[_2._Widget,_2._TemplatedMixin],{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",count:3,container:"containerNode",ruleStyle:"",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:",_positionSuffix:"%;",_suffix:"\"></div>",_genHTML:function(_3,_4){
return this._positionPrefix+_3+this._positionSuffix+this.ruleStyle+this._suffix;
},_isHorizontal:true,buildRendering:function(){
this.inherited(arguments);
var _5;
if(this.count==1){
_5=this._genHTML(50,0);
}else{
var i;
var _6=100/(this.count-1);
if(!this._isHorizontal||this.isLeftToRight()){
_5=this._genHTML(0,0);
for(i=1;i<this.count-1;i++){
_5+=this._genHTML(_6*i,i);
}
_5+=this._genHTML(100,this.count-1);
}else{
_5=this._genHTML(100,0);
for(i=1;i<this.count-1;i++){
_5+=this._genHTML(100-_6*i,i);
}
_5+=this._genHTML(0,this.count-1);
}
}
this.domNode.innerHTML=_5;
}});
return _2.form.HorizontalRule;
});
