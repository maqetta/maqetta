//>>built
require({cache:{"url:dijit/form/templates/DropDownButton.html":"<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdata-dojo-attach-event=\"ondijitclick:_onClick\" data-dojo-attach-point=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdata-dojo-attach-point=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdata-dojo-attach-point=\"containerNode,_popupStateNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdata-dojo-attach-point=\"valueNode\"\n/></span>\n"}});
define("dijit/form/DropDownButton",["dojo/_base/declare","dojo/query","../registry","../popup","./Button","../_Container","../_HasDropDown","dojo/text!./templates/DropDownButton.html"],function(_1,_2,_3,_4,_5,_6,_7,_8){
return _1("dijit.form.DropDownButton",[_5,_6,_7],{baseClass:"dijitDropDownButton",templateString:_8,_fillContent:function(){
if(this.srcNodeRef){
var _9=_2("*",this.srcNodeRef);
this.inherited(arguments,[_9[0]]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown&&this.dropDownContainer){
var _a=_2("[widgetId]",this.dropDownContainer)[0];
this.dropDown=_3.byNode(_a);
delete this.dropDownContainer;
}
if(this.dropDown){
_4.hide(this.dropDown);
}
this.inherited(arguments);
},isLoaded:function(){
var _b=this.dropDown;
return (!!_b&&(!_b.href||_b.isLoaded));
},loadDropDown:function(){
var _c=this.dropDown;
if(!_c){
return;
}
if(!this.isLoaded()){
var _d=_c.on("load",this,function(){
_d.remove();
this.openDropDown();
});
_c.refresh();
}else{
this.openDropDown();
}
},isFocusable:function(){
return this.inherited(arguments)&&!this._mouseDown;
}});
});
