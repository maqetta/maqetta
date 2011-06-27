/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/Urchin",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/window"],function(_1){
return _1.declare("dojox.analytics.Urchin",null,{acct:"",constructor:function(_2){
this.tracker=null;
_1.mixin(this,_2);
this.acct=this.acct||_1.config.urchin;
var re=/loaded|complete/,_3=("https:"==_1.doc.location.protocol)?"https://ssl.":"http://www.",h=_1.doc.getElementsByTagName("head")[0],n=_1.create("script",{src:_3+"google-analytics.com/ga.js"},h);
n.onload=n.onreadystatechange=_1.hitch(this,function(e){
if(e&&e.type=="load"||re.test(n.readyState)){
n.onload=n.onreadystatechange=null;
this._gotGA();
h.removeChild(n);
}
});
},_gotGA:function(){
this.tracker=_gat._getTracker(this.acct);
this.GAonLoad.apply(this,arguments);
},GAonLoad:function(){
this.trackPageView();
},trackPageView:function(_4){
this.tracker._trackPageview.apply(this,arguments);
}});
});
