/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/Calendar.html"]="<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" aria-labelledby=\"${id}_year\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"decrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div dojoAttachPoint=\"monthNode\">\n\t\t\t\t</div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"incrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t${!dayCellsHtml}\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachPoint=\"dateRowsNode\" dojoAttachEvent=\"onclick: _onDayClick\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t\t${!dateRowsHtml}\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\" id=\"${id}_year\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>";
define("dijit/CalendarLite",["dojo/_base/kernel",".","dojo/text!./templates/Calendar.html","dojo/string","dojo/cldr/supplemental","dojo/date","dojo/date/locale","./_WidgetBase","./_TemplatedMixin","dojo/_base/array","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,_3){
_1.declare("dijit.CalendarLite",[_2._WidgetBase,_2._TemplatedMixin],{templateString:_3,dowTemplateString:"<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\"><span class=\"dijitCalendarDayLabel\">${d}</span></th>",dateTemplateString:"<td class=\"dijitReset\" role=\"gridcell\" dojoAttachPoint=\"dateCells\"><span class=\"dijitCalendarDateLabel\" dojoAttachPoint=\"dateLabels\"></span></td>",weekTemplateString:"<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">${d}${d}${d}${d}${d}${d}${d}</tr>",value:new Date(""),datePackage:"dojo.date",dayWidth:"narrow",tabIndex:"0",currentFocus:new Date(),baseClass:"dijitCalendar",_isValidDate:function(_4){
return _4&&!isNaN(_4)&&typeof _4=="object"&&_4.toString()!=this.constructor.prototype.value.toString();
},_getValueAttr:function(){
var _5=new this.dateClassObj(this.value);
_5.setHours(0,0,0,0);
if(_5.getDate()<this.value.getDate()){
_5=this.dateFuncObj.add(_5,"hour",1);
}
return _5;
},_setValueAttr:function(_6,_7){
if(_6){
_6=new this.dateClassObj(_6);
}
if(this._isValidDate(_6)){
if(!this._isValidDate(this.value)||this.dateFuncObj.compare(_6,this.value)){
_6.setHours(1,0,0,0);
if(!this.isDisabledDate(_6,this.lang)){
this._set("value",_6);
this.set("currentFocus",_6);
if(_7||typeof _7=="undefined"){
this.onChange(this.get("value"));
}
}
}
}else{
this._set("value",new Date(""));
this.set("currentFocus",this.currentFocus);
}
},_setText:function(_8,_9){
while(_8.firstChild){
_8.removeChild(_8.firstChild);
}
_8.appendChild(_1.doc.createTextNode(_9));
},_populateGrid:function(){
var _a=new this.dateClassObj(this.currentFocus);
_a.setDate(1);
var _b=_a.getDay(),_c=this.dateFuncObj.getDaysInMonth(_a),_d=this.dateFuncObj.getDaysInMonth(this.dateFuncObj.add(_a,"month",-1)),_e=new this.dateClassObj(),_f=_1.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_f>_b){
_f-=7;
}
this._date2cell={};
_1.forEach(this.dateCells,function(_10,idx){
var i=idx+_f;
var _11=new this.dateClassObj(_a),_12,_13="dijitCalendar",adj=0;
if(i<_b){
_12=_d-_b+i+1;
adj=-1;
_13+="Previous";
}else{
if(i>=(_b+_c)){
_12=i-_b-_c+1;
adj=1;
_13+="Next";
}else{
_12=i-_b+1;
_13+="Current";
}
}
if(adj){
_11=this.dateFuncObj.add(_11,"month",adj);
}
_11.setDate(_12);
if(!this.dateFuncObj.compare(_11,_e,"date")){
_13="dijitCalendarCurrentDate "+_13;
}
if(this._isSelectedDate(_11,this.lang)){
_13="dijitCalendarSelectedDate "+_13;
}
if(this.isDisabledDate(_11,this.lang)){
_13="dijitCalendarDisabledDate "+_13;
}
var _14=this.getClassForDate(_11,this.lang);
if(_14){
_13=_14+" "+_13;
}
_10.className=_13+"Month dijitCalendarDateTemplate";
var _15=_11.valueOf();
this._date2cell[_15]=_10;
_10.dijitDateValue=_15;
this._setText(this.dateLabels[idx],_11.getDateLocalized?_11.getDateLocalized(this.lang):_11.getDate());
},this);
this.monthWidget.set("month",_a);
var y=_a.getFullYear()-1;
var d=new this.dateClassObj();
_1.forEach(["previous","current","next"],function(_16){
d.setFullYear(y++);
this._setText(this[_16+"YearLabelNode"],this.dateLocaleModule.format(d,{selector:"year",locale:this.lang}));
},this);
},goToToday:function(){
this.set("value",new this.dateClassObj());
},constructor:function(_17){
var _18=(_17.datePackage&&(_17.datePackage!="dojo.date"))?_17.datePackage+".Date":"Date";
this.dateClassObj=_1.getObject(_18,false);
this.datePackage=_17.datePackage||this.datePackage;
this.dateFuncObj=_1.getObject(this.datePackage,false);
this.dateLocaleModule=_1.getObject(this.datePackage+".locale",false);
},_createMonthWidget:function(){
return _2.CalendarLite._MonthWidget({id:this.id+"_mw",lang:this.lang,dateLocaleModule:this.dateLocaleModule},this.monthNode);
},buildRendering:function(){
var d=this.dowTemplateString,_19=this.dateLocaleModule.getNames("days",this.dayWidth,"standAlone",this.lang),_1a=_1.cldr.supplemental.getFirstDayOfWeek(this.lang);
this.dayCellsHtml=_1.string.substitute([d,d,d,d,d,d,d].join(""),{d:""},function(val,key){
return _19[_1a++%7];
});
var r=_1.string.substitute(this.weekTemplateString,{d:this.dateTemplateString});
this.dateRowsHtml=[r,r,r,r,r,r].join("");
this.dateCells=[];
this.dateLabels=[];
this.inherited(arguments);
_1.setSelectable(this.domNode,false);
var _1b=new this.dateClassObj(this.currentFocus);
this._supportingWidgets.push(this.monthWidget=this._createMonthWidget());
this.set("currentFocus",_1b,false);
var _1c=_1.hitch(this,function(_1d,_1e,_1f){
this.connect(this[_1d],"onclick",function(evt){
this._setCurrentFocusAttr(this.dateFuncObj.add(this.currentFocus,_1e,_1f));
});
});
_1c("incrementMonth","month",1);
_1c("decrementMonth","month",-1);
_1c("nextYearLabelNode","year",1);
_1c("previousYearLabelNode","year",-1);
},_setCurrentFocusAttr:function(_20,_21){
var _22=this.currentFocus,_23=_22&&this._date2cell?this._date2cell[_22.valueOf()]:null;
_20=new this.dateClassObj(_20);
_20.setHours(1,0,0,0);
this._set("currentFocus",_20);
this._populateGrid();
var _24=this._date2cell[_20.valueOf()];
_24.setAttribute("tabIndex",this.tabIndex);
if(this.focused||_21){
_24.focus();
}
if(_23&&_23!=_24){
if(_1.isWebKit){
_23.setAttribute("tabIndex","-1");
}else{
_23.removeAttribute("tabIndex");
}
}
},focus:function(){
this._setCurrentFocusAttr(this.currentFocus,true);
},_onDayClick:function(evt){
_1.stopEvent(evt);
for(var _25=evt.target;_25&&!_25.dijitDateValue;_25=_25.parentNode){
}
if(_25&&!_1.hasClass(_25,"dijitCalendarDisabledDate")){
this.set("value",_25.dijitDateValue);
}
},onChange:function(_26){
},_isSelectedDate:function(_27,_28){
return this._isValidDate(this.value)&&!this.dateFuncObj.compare(_27,this.value,"date");
},isDisabledDate:function(_29,_2a){
},getClassForDate:function(_2b,_2c){
}});
_1.declare("dijit.CalendarLite._MonthWidget",_2._WidgetBase,{_setMonthAttr:function(_2d){
var _2e=this.dateLocaleModule.getNames("months","wide","standAlone",this.lang,_2d),_2f=(_1.isIE==6?"":"<div class='dijitSpacer'>"+_1.map(_2e,function(s){
return "<div>"+s+"</div>";
}).join("")+"</div>");
this.domNode.innerHTML=_2f+"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>"+_2e[_2d.getMonth()]+"</div>";
}});
return _2.CalendarLite;
});
