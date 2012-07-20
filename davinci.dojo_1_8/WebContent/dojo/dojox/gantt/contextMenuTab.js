//>>built
define("dojox/gantt/contextMenuTab",["dijit/Menu","dijit/Dialog","dijit/form/NumberSpinner","dijit/form/Button","dijit/form/CheckBox","dijit/form/DateTextBox","dijit/form/TimeTextBox","dijit/form/TextBox","dijit/form/Form","dijit/registry","dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/_base/html","dojo/date/locale","dojo/request","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-style","dojo/dom-attr","dojo/dom-geometry","dojo/keys","dojo/parser","dojo/domReady!"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_10,dom,_11,_12,_13,_14,_15,_16,_17){
return _b("dojox.gantt.contextMenuTab",[],{constructor:function(id,_18,_19,_1a,_1b,_1c){
this.id=id;
this.arrItems=[];
this.TabItemContainer=null;
this.Description=_18;
this.tabMenu=_1b;
this.type=_19;
this.object=null;
this.showObjectInfo=_1a;
this.withDefaultValue=_1c;
},preValueValidation:function(_1d){
for(var i=0;i<_1d.length;i++){
var _1e=_1d[i];
if(_1e.required&&!_1e.control.textbox.value){
return false;
}
}
return true;
},encodeDate:function(_1f){
return _1f.getFullYear()+"."+(_1f.getMonth()+1)+"."+_1f.getDate();
},decodeDate:function(_20){
var arr=_20.split(".");
return (arr.length<3)?"":(new Date(arr[0],parseInt(arr[1])-1,arr[2]));
},renameTaskAction:function(){
var _21=this.arrItems[0].control.textbox.value;
if(_d.trim(_21).length<=0){
return;
}
if(!this.preValueValidation(this.arrItems)){
return;
}
this.object.setName(_21);
this.hide();
},deleteAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
this.object.project.deleteTask(this.object.taskItem.id);
this.hide();
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},durationUpdateAction:function(){
var d=this.arrItems[0].control.textbox.value;
if(!this.preValueValidation(this.arrItems)){
return;
}
if(this.object.setDuration(d)){
this.hide();
}else{
alert("Duration out of Range");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.refresh();
},cpUpdateAction:function(){
var p=this.arrItems[0].control.textbox.value;
if(!this.preValueValidation(this.arrItems)){
return;
}
if(this.object.setPercentCompleted(p)){
this.hide();
}else{
alert("Complete Percentage out of Range");
return;
}
},ownerUpdateAction:function(){
var to=this.arrItems[0].control.textbox.value;
if(!this.preValueValidation(this.arrItems)){
return;
}
if(this.object.setTaskOwner(to)){
this.hide();
}else{
alert("Task owner not Valid");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},ptUpdateAction:function(){
var p=this.arrItems[0].control.textbox.value;
if(!this.preValueValidation(this.arrItems)){
return;
}
if(this.object.setPreviousTask(p)){
this.hide();
}else{
alert("Please verify the Previous Task ("+p+")  and adjust its Time Range");
return;
}
},renameProjectAction:function(){
var _22=this.arrItems[0].control.textbox.value;
if(_d.trim(_22).length<=0){
return;
}
if(!this.preValueValidation(this.arrItems)){
return;
}
this.object.setName(_22);
this.hide();
},deleteProjectAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
this.object.ganttChart.deleteProject(this.object.project.id);
this.hide();
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},cpProjectAction:function(){
var p=this.arrItems[0].control.textbox.value;
if(!this.preValueValidation(this.arrItems)){
return;
}
if(this.object.setPercentCompleted(p)){
this.hide();
}else{
alert("Percentage not Acceptable");
return;
}
},addTaskAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
var id=this.arrItems[0].control.textbox.value,_23=this.arrItems[1].control.textbox.value,_24=this.decodeDate(this.arrItems[2].control.textbox.value),_25=this.arrItems[3].control.textbox.value,pc=this.arrItems[4].control.textbox.value,_26=this.arrItems[5].control.textbox.value,_27=this.arrItems[6].control.textbox.value,_28=this.arrItems[7].control.textbox.value;
if(_d.trim(id).length<=0){
return;
}
if(this.object.insertTask(id,_23,_24,_25,pc,_28,_26,_27)){
this.hide();
}else{
alert("Please adjust your Customization");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},addSuccessorTaskAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
var pr=this.object.project,id=this.arrItems[0].control.textbox.value,_29=this.arrItems[1].control.textbox.value,_2a=this.decodeDate(this.arrItems[2].control.textbox.value),_2b=this.arrItems[3].control.textbox.value,pc=this.arrItems[4].control.textbox.value,_2c=this.arrItems[5].control.textbox.value;
if(_d.trim(id).length<=0){
return;
}
var _2d=!this.object.parentTask?"":this.object.parentTask.taskItem.id;
var _2e=this.object.taskItem.id;
if(pr.insertTask(id,_29,_2a,_2b,pc,_2e,_2c,_2d)){
this.hide();
}else{
alert("Please adjust your Customization");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},addChildTaskAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
var pr=this.object.project,id=this.arrItems[0].control.textbox.value,_2f=this.arrItems[1].control.textbox.value,_30=this.decodeDate(this.arrItems[2].control.textbox.value),_31=this.arrItems[3].control.textbox.value,pc=this.arrItems[4].control.textbox.value,_32=this.arrItems[5].control.textbox.value,_33=this.object.taskItem.id,_34="";
if(_d.trim(id).length<=0){
return;
}
if(pr.insertTask(id,_2f,_30,_31,pc,_34,_32,_33)){
this.hide();
}else{
alert("Please adjust your Customization");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},addProjectAction:function(){
if(!this.preValueValidation(this.arrItems)){
return;
}
var id=this.arrItems[0].control.textbox.value,_35=this.arrItems[1].control.textbox.value,_36=this.decodeDate(this.arrItems[2].control.textbox.value);
if(_d.trim(id).length<=0||_d.trim(_35).length<=0){
return;
}
if(this.tabMenu.ganttChart.insertProject(id,_35,_36)){
this.hide();
}else{
alert("Please adjust your Customization");
return;
}
this.tabMenu.ganttChart.resource&&this.tabMenu.ganttChart.resource.reConstruct();
},addAction:function(_37){
this.actionFunc=this[_37];
},addItem:function(id,_38,key,_39){
var _3a;
if(key=="startTime"||key=="startDate"){
_3a=new _6({type:"text",constraints:{datePattern:"yyyy.M.d",strict:true}});
}else{
if(key=="percentage"){
_3a=new _3({constraints:{max:100,min:0}});
}else{
if(key=="duration"){
_3a=new _3({constraints:{min:0}});
}else{
_3a=new _8();
}
}
}
this.arrItems.push({id:id,name:_38,control:_3a,tab:this,key:key,required:_39});
},show:function(){
this.tabMenu.tabPanelDlg=this.tabMenu.tabPanelDlg||_a.byId(this.tabMenu.tabPanelDlgId)||new _2({title:"Settings"});
try{
this.tabMenu.tabPanelDlg.show();
}
catch(e){
return;
}
this.tabMenu.tabPanelDlg.titleNode.innerHTML=this.Description;
var _3b=this.tabMenu.paneContentArea.firstChild.rows[1].cells[0].firstChild,_3c=this.tabMenu.paneActionBar;
var _3d,_3e,row=null;
if(this.showObjectInfo){
if(this.object){
if(this.object.constructor==GanttTaskControl){
this.insertData(_3b,"Id",this.object.taskItem.id);
this.insertData(_3b,"Name",this.object.taskItem.name);
this.insertData(_3b,"Start Time",this.encodeDate(this.object.taskItem.startTime));
this.insertData(_3b,"Duration (hours)",this.object.taskItem.duration+" hours");
this.insertData(_3b,"Percent Complete (%)",this.object.taskItem.percentage+"%");
this.insertData(_3b,"Task Assignee",this.object.taskItem.taskOwner);
this.insertData(_3b,"Previous Task Id",this.object.taskItem.previousTaskId);
}else{
this.insertData(_3b,"Id",this.object.project.id);
this.insertData(_3b,"Name",this.object.project.name);
this.insertData(_3b,"Start date",this.encodeDate(this.object.project.startDate));
}
}
}
row=_3b.insertRow(_3b.rows.length);
_3d=row.insertCell(row.cells.length);
_3d.colSpan=2;
_3d.innerHTML="<hr/>";
row=_3b.insertRow(_3b.rows.length);
_3d=row.insertCell(row.cells.length);
_3d.colSpan=2;
_11.add(_3d,"ganttMenuDialogInputCellHeader");
_3d.innerHTML="Customization: "+this.Description;
_c.forEach(this.arrItems,function(_3f){
row=_3b.insertRow(_3b.rows.length);
_3d=row.insertCell(row.cells.length);
_11.add(_3d,"ganttMenuDialogInputCell");
_3e=row.insertCell(row.cells.length);
_11.add(_3e,"ganttMenuDialogInputCellValue");
_3d.innerHTML=_3f.name;
_3e.appendChild(_3f.control.domNode);
if(this.withDefaultValue&&this.object){
if(this.object.constructor==GanttTaskControl){
if(_3f.key=="startTime"){
_3f.control.textbox.value=this.encodeDate(this.object.taskItem.startTime);
}else{
_3f.control.textbox.value=_3f.key?this.object.taskItem[_3f.key]:"";
}
}else{
if(_3f.key=="startDate"){
_3f.control.textbox.value=this.encodeDate(this.object.project.startDate);
}else{
_3f.control.textbox.value=_3f.key?(this.object.project[_3f.key]||this.object[_3f.key]||""):"";
}
}
}else{
_3f.control.textbox.placeholder=_3f.required?"---required---":"---optional---";
}
},this);
this.tabMenu.ok.onClick=_d.hitch(this,this.actionFunc);
this.tabMenu.cancel.onClick=_d.hitch(this,this.hide);
},hide:function(){
try{
this.tabMenu.tabPanelDlg.hide();
}
catch(e){
this.tabMenu.tabPanelDlg.destroy();
}
var _40=this.tabMenu.paneContentArea.firstChild.rows[1].cells[0];
_40.firstChild.parentNode.removeChild(_40.firstChild);
_40.innerHTML="<table></table>";
_11.add(_40.firstChild,"ganttDialogContentCell");
},insertData:function(_41,_42,_43){
var _44,_45,row=null;
row=_41.insertRow(_41.rows.length);
_44=row.insertCell(row.cells.length);
_11.add(_44,"ganttMenuDialogDescCell");
_44.innerHTML=_42;
_45=row.insertCell(row.cells.length);
_11.add(_45,"ganttMenuDialogDescCellValue");
_45.innerHTML=_43;
}});
});
