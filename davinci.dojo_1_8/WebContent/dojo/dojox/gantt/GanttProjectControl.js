//>>built
define("dojox/gantt/GanttProjectControl",["dojox/gantt/GanttTaskItem","dijit/focus","dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/date/locale","dojo/request","dojo/on","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-style","dojo/dom-attr","dojo/dom-geometry","dojo/keys","dojo/domReady!"],function(_1,_2,_3,_4,_5,_6,_7,on,_8,_9,_a,_b,_c,_d,_e){
return _3("dojox.gantt.GanttProjectControl",[],{constructor:function(_f,_10){
this.project=_10;
this.ganttChart=_f;
this.descrProject=null;
this.projectItem=null;
this.projectNameItem=null;
this.posY=0;
this.posX=0;
this.nextProject=null;
this.previousProject=null;
this.arrTasks=[];
this.percentage=0;
this.duration=0;
},checkWidthProjectNameItem:function(){
if(this.projectNameItem.offsetWidth+this.projectNameItem.offsetLeft>this.ganttChart.maxWidthTaskNames){
var _11=this.projectNameItem.offsetWidth+this.projectNameItem.offsetLeft-this.ganttChart.maxWidthTaskNames;
var _12=Math.round(_11/(this.projectNameItem.offsetWidth/this.projectNameItem.firstChild.length));
var _13=this.project.name.substring(0,this.projectNameItem.firstChild.length-_12-3);
_13+="...";
this.projectNameItem.innerHTML=_13;
}
},refreshProjectItem:function(_14){
this.percentage=this.getPercentCompleted();
_b.set(_14,{"left":this.posX+"px","width":this.duration*this.ganttChart.pixelsPerWorkHour+"px"});
var _15=_14.firstChild;
var _16=this.duration*this.ganttChart.pixelsPerWorkHour;
_15.width=((_16==0)?1:_16)+"px";
_15.style.width=((_16==0)?1:_16)+"px";
var _17=_15.rows[0];
if(this.percentage!=-1){
if(this.percentage!=0){
var _18=_17.firstChild;
_18.width=this.percentage+"%";
var _19=_18.firstChild;
_b.set(_19,{width:(!this.duration?1:(this.percentage*this.duration*this.ganttChart.pixelsPerWorkHour/100))+"px",height:this.ganttChart.heightTaskItem+"px"});
}
if(this.percentage!=100){
var _18=_17.lastChild;
_18.width=(100-this.percentage)+"%";
var _19=_18.firstChild;
_b.set(_19,{width:(!this.duration?1:((100-this.percentage)*this.duration*this.ganttChart.pixelsPerWorkHour/100))+"px",height:this.ganttChart.heightTaskItem+"px"});
}
}else{
var _18=_17.firstChild;
_18.width="1px";
var _19=_18.firstChild;
_b.set(_19,{width:"1px",height:this.ganttChart.heightTaskItem+"px"});
}
var _1a=_14.lastChild;
var _1b=_1a.firstChild;
_b.set(_1b,{height:this.ganttChart.heightTaskItem+"px",width:(!this.duration?1:(this.duration*this.ganttChart.pixelsPerWorkHour))+"px"});
var _1c=_1b.rows[0];
var _1d=_1c.firstChild;
_1d.height=this.ganttChart.heightTaskItem+"px";
if(this.project.parentTasks.length==0){
_14.style.display="none";
}
return _14;
},refreshDescrProject:function(_1e){
var _1f=(this.posX+this.duration*this.ganttChart.pixelsPerWorkHour+10);
_b.set(_1e,{"left":_1f+"px"});
if(this.project.parentTasks.length==0){
this.descrProject.style.visibility="hidden";
}
return _1e;
},postLoadData:function(){
},refresh:function(){
this.posX=(this.project.startDate-this.ganttChart.startDate)/(60*60*1000)*this.ganttChart.pixelsPerHour;
this.refreshProjectItem(this.projectItem[0]);
this.refreshDescrProject(this.projectItem[0].nextSibling);
return this;
},create:function(){
var _20=this.ganttChart.contentData.firstChild;
this.posX=(this.project.startDate-this.ganttChart.startDate)/(60*60*1000)*this.ganttChart.pixelsPerHour;
if(this.previousProject){
if(this.previousProject.arrTasks.length>0){
var _21=this.ganttChart.getLastChildTask(this.previousProject.arrTasks[this.previousProject.arrTasks.length-1]);
this.posY=parseInt(_21.cTaskItem[0].style.top)+this.ganttChart.heightTaskItem+this.ganttChart.heightTaskItemExtra;
}else{
this.posY=parseInt(this.previousProject.projectItem[0].style.top)+this.ganttChart.heightTaskItem+this.ganttChart.heightTaskItemExtra;
}
}else{
this.posY=6;
}
var _22=this.ganttChart.panelNames.firstChild;
this.projectNameItem=this.createProjectNameItem();
_22.appendChild(this.projectNameItem);
this.checkWidthProjectNameItem();
this.projectItem=[this.createProjectItem(),[]];
_20.appendChild(this.projectItem[0]);
_20.appendChild(this.createDescrProject());
this.adjustPanelTime();
},getTaskById:function(id){
for(var i=0;i<this.arrTasks.length;i++){
var _23=this.arrTasks[i];
var _24=this.searchTaskInTree(_23,id);
if(_24){
return _24;
}
}
return null;
},searchTaskInTree:function(_25,id){
if(_25.taskItem.id==id){
return _25;
}else{
for(var i=0;i<_25.childTask.length;i++){
var _26=_25.childTask[i];
if(_26.taskItem.id==id){
return _26;
}else{
if(_26.childTask.length>0){
var _26=this.searchTaskInTree(_26,id);
if(_26){
return _26;
}
}
}
}
}
return null;
},shiftProjectItem:function(){
var _27=null;
var _28=null;
var _29=parseInt(this.projectItem[0].style.left);
for(var i=0;i<this.arrTasks.length;i++){
var _2a=this.arrTasks[i];
var _2b=parseInt(_2a.cTaskItem[0].style.left);
var _2c=parseInt(_2a.cTaskItem[0].style.left)+parseInt(_2a.cTaskItem[0].firstChild.firstChild.width);
if(!_27){
_27=_2b;
}
if(!_28){
_28=_2c;
}
if(_27>_2b){
_27=_2b;
}
if(_28<_2c){
_28=_2c;
}
}
if(_27!=_29){
this.project.startDate=new Date(this.ganttChart.startDate);
this.project.startDate.setHours(this.project.startDate.getHours()+(_27/this.ganttChart.pixelsPerHour));
}
this.projectItem[0].style.left=_27+"px";
this.resizeProjectItem(_28-_27);
this.duration=Math.round(parseInt(this.projectItem[0].firstChild.width)/(this.ganttChart.pixelsPerWorkHour));
this.shiftDescrProject();
this.adjustPanelTime();
},adjustPanelTime:function(){
var _2d=this.projectItem[0];
var _2e=parseInt(_2d.style.left)+parseInt(_2d.firstChild.style.width)+this.ganttChart.panelTimeExpandDelta;
_2e+=this.descrProject.offsetWidth;
this.ganttChart.adjustPanelTime(_2e);
},resizeProjectItem:function(_2f){
var _30=this.percentage,_31=this.projectItem[0];
if(_30>0&&_30<100){
_31.firstChild.style.width=_2f+"px";
_31.firstChild.width=_2f+"px";
_31.style.width=_2f+"px";
var _32=_31.firstChild.rows[0];
_32.cells[0].firstChild.style.width=Math.round(_2f*_30/100)+"px";
_32.cells[0].firstChild.style.height=this.ganttChart.heightTaskItem+"px";
_32.cells[1].firstChild.style.width=Math.round(_2f*(100-_30)/100)+"px";
_32.cells[1].firstChild.style.height=this.ganttChart.heightTaskItem+"px";
_31.lastChild.firstChild.width=_2f+"px";
}else{
if(_30==0||_30==100){
_31.firstChild.style.width=_2f+"px";
_31.firstChild.width=_2f+"px";
_31.style.width=_2f+"px";
var _32=_31.firstChild.rows[0];
_32.cells[0].firstChild.style.width=_2f+"px";
_32.cells[0].firstChild.style.height=this.ganttChart.heightTaskItem+"px";
_31.lastChild.firstChild.width=_2f+"px";
}
}
},shiftDescrProject:function(){
var _33=(parseInt(this.projectItem[0].style.left)+this.duration*this.ganttChart.pixelsPerWorkHour+10);
this.descrProject.style.left=_33+"px";
this.descrProject.innerHTML=this.getDescStr();
},showDescrProject:function(){
var _34=(parseInt(this.projectItem[0].style.left)+this.duration*this.ganttChart.pixelsPerWorkHour+10);
this.descrProject.style.left=_34+"px";
this.descrProject.style.visibility="visible";
this.descrProject.innerHTML=this.getDescStr();
},hideDescrProject:function(){
this.descrProject.style.visibility="hidden";
},getDescStr:function(){
return this.duration/this.ganttChart.hsPerDay+" days,  "+this.duration+" hours";
},createDescrProject:function(){
var _35=(this.posX+this.duration*this.ganttChart.pixelsPerWorkHour+10);
var _36=_a.create("div",{innerHTML:this.getDescStr(),className:"ganttDescProject"});
_b.set(_36,{left:_35+"px",top:this.posY+"px"});
this.descrProject=_36;
if(this.project.parentTasks.length==0){
this.descrProject.style.visibility="hidden";
}
return _36;
},createProjectItem:function(){
this.percentage=this.getPercentCompleted();
this.duration=this.getDuration();
var _37=_a.create("div",{id:this.project.id,className:"ganttProjectItem"});
_b.set(_37,{left:this.posX+"px",top:this.posY+"px",width:this.duration*this.ganttChart.pixelsPerWorkHour+"px"});
var _38=_a.create("table",{cellPadding:"0",cellSpacing:"0",className:"ganttTblProjectItem"},_37);
var _39=this.duration*this.ganttChart.pixelsPerWorkHour;
_38.width=((_39==0)?1:_39)+"px";
_38.style.width=((_39==0)?1:_39)+"px";
var _3a=_38.insertRow(_38.rows.length);
if(this.percentage!=-1){
if(this.percentage!=0){
var _3b=_a.create("td",{width:this.percentage+"%"},_3a);
_3b.style.lineHeight="1px";
var _3c=_a.create("div",{className:"ganttImageProgressFilled"},_3b);
_b.set(_3c,{width:(this.percentage*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
}
if(this.percentage!=100){
var _3b=_a.create("td",{width:(100-this.percentage)+"%"},_3a);
_3b.style.lineHeight="1px";
var _3c=_a.create("div",{className:"ganttImageProgressBg"},_3b);
_b.set(_3c,{width:((100-this.percentage)*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
}
}else{
var _3b=_a.create("td",{width:"1px"},_3a);
_3b.style.lineHeight="1px";
var _3c=_a.create("div",{className:"ganttImageProgressBg"},_3b);
_b.set(_3c,{width:"1px",height:this.ganttChart.heightTaskItem+"px"});
}
var _3d=_a.create("div",{className:"ganttDivTaskInfo"});
var _3e=_a.create("table",{cellPadding:"0",cellSpacing:"0",height:this.ganttChart.heightTaskItem+"px",width:((this.duration*this.ganttChart.pixelsPerWorkHour==0)?1:this.duration*this.ganttChart.pixelsPerWorkHour)+"px"},_3d);
var _3f=_3e.insertRow(0);
_a.create("td",{align:"center",vAlign:"top",height:this.ganttChart.heightTaskItem+"px",className:"ganttMoveInfo"},_3f);
_37.appendChild(_3d);
if(this.project.parentTasks.length==0){
_37.style.display="none";
}
return _37;
},createProjectNameItem:function(){
var _40=_a.create("div",{className:"ganttProjectNameItem",innerHTML:this.project.name,title:this.project.name});
_b.set(_40,{left:"5px",top:this.posY+"px"});
_c.set(_40,"tabIndex",0);
if(this.ganttChart.isShowConMenu){
this.ganttChart._events.push(on(_40,"mouseover",_5.hitch(this,function(_41){
_9.add(_40,"ganttProjectNameItemHover");
clearTimeout(this.ganttChart.menuTimer);
this.ganttChart.tabMenu.clear();
this.ganttChart.tabMenu.show(_41.target,this);
})));
this.ganttChart._events.push(on(_40,"keydown",_5.hitch(this,function(_42){
if(_42.keyCode==_e.ENTER){
this.ganttChart.tabMenu.clear();
this.ganttChart.tabMenu.show(_42.target,this);
}
if(this.ganttChart.tabMenu.isShow&&(_42.keyCode==_e.LEFT_ARROW||_42.keyCode==_e.RIGHT_ARROW)){
_2(this.ganttChart.tabMenu.menuPanel.firstChild.rows[0].cells[0]);
}
if(this.ganttChart.tabMenu.isShow&&_42.keyCode==_e.ESCAPE){
this.ganttChart.tabMenu.hide();
}
})));
this.ganttChart._events.push(on(_40,"mouseout",_5.hitch(this,function(_43){
_9.remove(_40,"ganttProjectNameItemHover");
clearTimeout(this.ganttChart.menuTimer);
this.ganttChart.menuTimer=setTimeout(_5.hitch(this,function(){
this.ganttChart.tabMenu.hide();
}),200);
})));
this.ganttChart._events.push(on(this.ganttChart.tabMenu.menuPanel,"mouseover",_5.hitch(this,function(_44){
clearTimeout(this.ganttChart.menuTimer);
})));
this.ganttChart._events.push(on(this.ganttChart.tabMenu.menuPanel,"keydown",_5.hitch(this,function(_45){
if(this.ganttChart.tabMenu.isShow&&_45.keyCode==_e.ESCAPE){
this.ganttChart.tabMenu.hide();
}
})));
this.ganttChart._events.push(on(this.ganttChart.tabMenu.menuPanel,"mouseout",_5.hitch(this,function(_46){
clearTimeout(this.ganttChart.menuTimer);
this.ganttChart.menuTimer=setTimeout(_5.hitch(this,function(){
this.ganttChart.tabMenu.hide();
}),200);
})));
}
return _40;
},getPercentCompleted:function(){
var sum=0,_47=0;
_4.forEach(this.project.parentTasks,function(_48){
sum+=parseInt(_48.percentage);
},this);
if(this.project.parentTasks.length!=0){
return _47=Math.round(sum/this.project.parentTasks.length);
}else{
return _47=-1;
}
},getDuration:function(){
var _49=0,_4a=0;
if(this.project.parentTasks.length>0){
_4.forEach(this.project.parentTasks,function(_4b){
_4a=_4b.duration*24/this.ganttChart.hsPerDay+(_4b.startTime-this.ganttChart.startDate)/(60*60*1000);
if(_4a>_49){
_49=_4a;
}
},this);
return ((_49-this.posX)/24)*this.ganttChart.hsPerDay;
}else{
return 0;
}
},deleteTask:function(id){
var _4c=this.getTaskById(id);
if(_4c){
this.deleteChildTask(_4c);
this.ganttChart.checkPosition();
}
},setName:function(_4d){
if(_4d){
this.project.name=_4d;
this.projectNameItem.innerHTML=_4d;
this.projectNameItem.title=_4d;
this.checkWidthProjectNameItem();
this.descrProject.innerHTML=this.getDescStr();
this.adjustPanelTime();
}
},setPercentCompleted:function(_4e){
_4e=parseInt(_4e);
if(isNaN(_4e)||_4e>100||_4e<0){
return false;
}
var _4f=this.projectItem[0].firstChild.rows[0],rc0=_4f.cells[0],rc1=_4f.cells[1];
if((_4e>0)&&(_4e<100)&&(this.percentage>0)&&(this.percentage<100)){
rc0.width=parseInt(_4e)+"%";
rc0.firstChild.style.width=(_4e*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px";
rc1.width=(100-parseInt(_4e))+"%";
rc1.firstChild.style.width=((100-_4e)*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px";
}else{
if(((_4e==0)||(_4e==100))&&(this.percentage>0)&&(this.percentage<100)){
if(_4e==0){
rc0.parentNode.removeChild(rc0);
rc1.width=100+"%";
rc1.firstChild.style.width=this.duration*this.ganttChart.pixelsPerWorkHour+"px";
}else{
if(_4e==100){
rc1.parentNode.removeChild(rc1);
rc0.width=100+"%";
rc0.firstChild.style.width=this.duration*this.ganttChart.pixelsPerWorkHour+"px";
}
}
}else{
if(((_4e==0)||(_4e==100))&&((this.percentage==0)||(this.percentage==100))){
if((_4e==0)&&(this.percentage==100)){
_9.remove(rc0.firstChild,"ganttImageProgressFilled");
_9.add(rc0.firstChild,"ganttImageProgressBg");
}else{
if((_4e==100)&&(this.percentage==0)){
_9.remove(rc0.firstChild,"ganttImageProgressBg");
_9.add(rc0.firstChild,"ganttImageProgressFilled");
}
}
}else{
if(((_4e>0)||(_4e<100))&&((this.percentage==0)||(this.percentage==100))){
rc0.parentNode.removeChild(rc0);
var _50=_a.create("td",{width:_4e+"%"},_4f);
_50.style.lineHeight="1px";
var _51=_a.create("div",{className:"ganttImageProgressFilled"},_50);
_b.set(_51,{width:(_4e*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
_50=_a.create("td",{width:(100-_4e)+"%"},_4f);
_50.style.lineHeight="1px";
_51=_a.create("div",{className:"ganttImageProgressBg"},_50);
_b.set(_51,{width:((100-_4e)*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
}else{
if(this.percentage==-1){
if(_4e==100){
_9.remove(rc0.firstChild,"ganttImageProgressBg");
_9.add(rc0.firstChild,"ganttImageProgressFilled");
}else{
if(_4e<100&&_4e>0){
rc0.parentNode.removeChild(rc0);
var _50=_a.create("td",{width:_4e+"%"},_4f);
_50.style.lineHeight="1px";
_51=_a.create("div",{className:"ganttImageProgressFilled"},_50);
_b.set(_51,{width:(_4e*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
_50=_a.create("td",{width:(100-_4e)+"%"},_4f);
_50.style.lineHeight="1px";
_51=_a.create("div",{className:"ganttImageProgressBg"},_50);
_b.set(_51,{width:((100-_4e)*this.duration*this.ganttChart.pixelsPerWorkHour)/100+"px",height:this.ganttChart.heightTaskItem+"px"});
}
}
}
}
}
}
}
this.percentage=_4e;
this.descrProject.innerHTML=this.getDescStr();
return true;
},deleteChildTask:function(_52){
if(_52){
var _53=_52.cTaskItem[0],_54=_52.cTaskNameItem[0],_55=_52.cTaskItem[1],_56=_52.cTaskNameItem[1],_57=_52.cTaskNameItem[2];
if(_53.style.display=="none"){
this.ganttChart.openTree(_52.parentTask);
}
if(_52.childPredTask.length>0){
for(var i=0;i<_52.childPredTask.length;i++){
var _58=_52.childPredTask[i];
for(var t=0;t<_58.cTaskItem[1].length;t++){
_58.cTaskItem[1][t].parentNode.removeChild(_58.cTaskItem[1][t]);
}
_58.cTaskItem[1]=[];
_58.predTask=null;
}
}
if(_52.childTask.length>0){
while(_52.childTask.length>0){
this.deleteChildTask(_52.childTask[0]);
}
}
var _59=this.ganttChart.heightTaskItem+this.ganttChart.heightTaskItemExtra;
if(_53.style.display!="none"){
_52.shiftCurrentTasks(_52,-_59);
}
this.project.deleteTask(_52.taskItem.id);
if(_53){
_53.parentNode.removeChild(_53);
}
_52.descrTask.parentNode.removeChild(_52.descrTask);
if(_55.length>0){
for(var j=0;j<_55.length;j++){
_55[j].parentNode.removeChild(_55[j]);
}
}
if(_54){
_54.parentNode.removeChild(_54);
}
if(_52.cTaskNameItem[1]){
for(var j=0;j<_56.length;j++){
_56[j].parentNode.removeChild(_56[j]);
}
}
if(_57&&_57.parentNode){
_57.parentNode.removeChild(_57);
}
if(_52.taskIdentifier){
_52.taskIdentifier.parentNode.removeChild(_52.taskIdentifier);
_52.taskIdentifier=null;
}
if(_52.parentTask){
if(_52.previousChildTask){
if(_52.nextChildTask){
_52.previousChildTask.nextChildTask=_52.nextChildTask;
}else{
_52.previousChildTask.nextChildTask=null;
}
}
var _5a=_52.parentTask;
for(var i=0;i<_5a.childTask.length;i++){
if(_5a.childTask[i].taskItem.id==_52.taskItem.id){
_5a.childTask[i]=null;
_5a.childTask.splice(i,1);
break;
}
}
if(_5a.childTask.length==0){
if(_5a.cTaskNameItem[2]){
_5a.cTaskNameItem[2].parentNode.removeChild(_5a.cTaskNameItem[2]);
_5a.cTaskNameItem[2]=null;
}
}
}else{
if(_52.previousParentTask){
if(_52.nextParentTask){
_52.previousParentTask.nextParentTask=_52.nextParentTask;
}else{
_52.previousParentTask.nextParentTask=null;
}
}
var _5b=_52.project;
for(var i=0;i<_5b.arrTasks.length;i++){
if(_5b.arrTasks[i].taskItem.id==_52.taskItem.id){
_5b.arrTasks.splice(i,1);
}
}
}
if(_52.predTask){
var _5c=_52.predTask;
for(var i=0;i<_5c.childPredTask.length;i++){
if(_5c.childPredTask[i].taskItem.id==_52.taskItem.id){
_5c.childPredTask[i]=null;
_5c.childPredTask.splice(i,1);
}
}
}
if(_52.project.arrTasks.length!=0){
_52.project.shiftProjectItem();
}else{
_52.project.projectItem[0].style.display="none";
this.hideDescrProject();
}
this.ganttChart.contentDataHeight-=this.ganttChart.heightTaskItemExtra+this.ganttChart.heightTaskItem;
}
},insertTask:function(id,_5d,_5e,_5f,_60,_61,_62,_63){
var _64=null;
var _65=null;
if(this.project.getTaskById(id)){
return false;
}
if((!_5f)||(_5f<this.ganttChart.minWorkLength)){
_5f=this.ganttChart.minWorkLength;
}
if((!_5d)||(_5d=="")){
_5d=id;
}
if((!_60)||(_60=="")){
_60=0;
}else{
_60=parseInt(_60);
if(_60<0||_60>100){
return false;
}
}
var _66=false;
if((_63)&&(_63!="")){
var _67=this.project.getTaskById(_63);
if(!_67){
return false;
}
_5e=_5e||_67.startTime;
if(_5e<_67.startTime){
return false;
}
_64=new _1({id:id,name:_5d,startTime:_5e,duration:_5f,percentage:_60,previousTaskId:_61,taskOwner:_62});
if(!this.ganttChart.checkPosParentTask(_67,_64)){
return false;
}
_64.parentTask=_67;
var _68=this.getTaskById(_67.id);
var _69=false;
if(_68.cTaskItem[0].style.display=="none"){
_69=true;
}else{
if(_68.cTaskNameItem[2]){
if(!_68.isExpanded){
_69=true;
}
}
}
if(_69){
if(_68.childTask.length==0){
this.ganttChart.openTree(_68.parentTask);
}else{
this.ganttChart.openTree(_68);
}
}
if(_61!=""){
var _6a=this.project.getTaskById(_61);
if(!_6a){
return false;
}
if(_6a.parentTask){
if(_6a.parentTask.id!=_64.parentTask.id){
return false;
}
}else{
return false;
}
if(!this.ganttChart.checkPosPreviousTask(_6a,_64)){
this.ganttChart.correctPosPreviousTask(_6a,_64);
}
_64.previousTask=_6a;
}
var _6b=false;
if(_66){
for(var i=0;i<_67.cldTasks.length;i++){
if(_64.startTime<_67.cldTasks[i].startTime){
_67.cldTasks.splice(i,0,_64);
if(i>0){
_67.cldTasks[i-1].nextChildTask=_67.cldTasks[i];
_67.cldTasks[i].previousChildTask=_67.cldTasks[i-1];
}
if(_67.cldTasks[i+1]){
_67.cldTasks[i+1].previousChildTask=_67.cldTasks[i];
_67.cldTasks[i].nextChildTask=_67.cldTasks[i+1];
}
_6b=true;
break;
}
}
}
if(!_6b){
if(_67.cldTasks.length>0){
_67.cldTasks[_67.cldTasks.length-1].nextChildTask=_64;
_64.previousChildTask=_67.cldTasks[_67.cldTasks.length-1];
}
_67.cldTasks.push(_64);
}
if(_67.cldTasks.length==1){
_68.cTaskNameItem[2]=_68.createTreeImg();
}
_65=new GanttTaskControl(_64,this,this.ganttChart);
_65.create();
if(_64.nextChildTask){
_65.nextChildTask=_65.project.getTaskById(_64.nextChildTask.id);
}
_65.adjustPanelTime();
var _6c=this.ganttChart.heightTaskItem+this.ganttChart.heightTaskItemExtra;
_65.shiftCurrentTasks(_65,_6c);
}else{
_5e=_5e||this.project.startDate;
_64=new _1({id:id,name:_5d,startTime:_5e,duration:_5f,percentage:_60,previousTaskId:_61,taskOwner:_62});
if(_64.startTime<=this.ganttChart.startDate){
return false;
}
if(_61!=""){
var _6a=this.project.getTaskById(_61);
if(!_6a){
return false;
}
if(!this.ganttChart.checkPosPreviousTask(_6a,_64)){
this.ganttChart.correctPosPreviousTask(_6a,_64);
}
if(_6a.parentTask){
return false;
}
_64.previousTask=_6a;
}
var _6b=false;
if(_66){
for(var i=0;i<this.project.parentTasks.length;i++){
var _6d=this.project.parentTasks[i];
if(_5e<_6d.startTime){
this.project.parentTasks.splice(i,0,_64);
if(i>0){
this.project.parentTasks[i-1].nextParentTask=_64;
_64.previousParentTask=this.project.parentTasks[i-1];
}
if(this.project.parentTasks[i+1]){
this.project.parentTasks[i+1].previousParentTask=_64;
_64.nextParentTask=this.project.parentTasks[i+1];
}
_6b=true;
break;
}
}
}
if(!_6b){
if(this.project.parentTasks.length>0){
this.project.parentTasks[this.project.parentTasks.length-1].nextParentTask=_64;
_64.previousParentTask=this.project.parentTasks[this.project.parentTasks.length-1];
}
this.project.parentTasks.push(_64);
}
_65=new GanttTaskControl(_64,this,this.ganttChart);
_65.create();
if(_64.nextParentTask){
_65.nextParentTask=_65.project.getTaskById(_64.nextParentTask.id);
}
_65.adjustPanelTime();
this.arrTasks.push(_65);
var _6c=this.ganttChart.heightTaskItem+this.ganttChart.heightTaskItemExtra;
_65.shiftCurrentTasks(_65,_6c);
this.projectItem[0].style.display="inline";
this.setPercentCompleted(this.getPercentCompleted());
this.shiftProjectItem();
this.showDescrProject();
}
this.ganttChart.checkHeighPanelTasks();
this.ganttChart.checkPosition();
return _65;
},shiftNextProject:function(_6e,_6f){
if(_6e.nextProject){
_6e.nextProject.shiftProject(_6f);
this.shiftNextProject(_6e.nextProject,_6f);
}
},shiftProject:function(_70){
this.posY=this.posY+_70;
this.projectItem[0].style.top=parseInt(this.projectItem[0].style.top)+_70+"px";
this.descrProject.style.top=parseInt(this.descrProject.style.top)+_70+"px";
this.projectNameItem.style.top=parseInt(this.projectNameItem.style.top)+_70+"px";
if(this.arrTasks.length>0){
this.shiftNextParentTask(this.arrTasks[0],_70);
}
},shiftTask:function(_71,_72){
_71.posY=_71.posY+_72;
var _73=_71.cTaskNameItem[0],_74=_71.cTaskNameItem[1],_75=_71.cTaskNameItem[2],_76=_71.cTaskItem[1];
_73.style.top=parseInt(_73.style.top)+_72+"px";
if(_75){
_75.style.top=parseInt(_75.style.top)+_72+"px";
}
if(_71.parentTask){
_74[0].style.top=parseInt(_74[0].style.top)+_72+"px";
_74[1].style.top=parseInt(_74[1].style.top)+_72+"px";
}
_71.cTaskItem[0].style.top=parseInt(_71.cTaskItem[0].style.top)+_72+"px";
_71.descrTask.style.top=parseInt(_71.descrTask.style.top)+_72+"px";
if(_76[0]){
_76[0].style.top=parseInt(_76[0].style.top)+_72+"px";
_76[1].style.top=parseInt(_76[1].style.top)+_72+"px";
_76[2].style.top=parseInt(_76[2].style.top)+_72+"px";
}
},shiftNextParentTask:function(_77,_78){
this.shiftTask(_77,_78);
this.shiftChildTasks(_77,_78);
if(_77.nextParentTask){
this.shiftNextParentTask(_77.nextParentTask,_78);
}
},shiftChildTasks:function(_79,_7a){
_4.forEach(_79.childTask,function(_7b){
this.shiftTask(_7b,_7a);
if(_7b.childTask.length>0){
this.shiftChildTasks(_7b,_7a);
}
},this);
}});
});
