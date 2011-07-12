/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

//>>built
require({cache:{"dojox*mobile/compat":function(){define(["dojo/_base/kernel","dojo/_base/sniff"],function(_1,_2){_1.getObject("mobile.compat",true,dojox);if(!_2.isWebKit){require(["dojox/mobile/_compat"]);}return dojox.mobile.compat;});}}});define("dojox/mobile/app/compat",["dojo","dijit","dojox","dojox/mobile/compat"],function(_3,_4,_5){_3.getObject("dojox.mobile.app.compat",1);_3.extend(_5.mobile.app.AlertDialog,{_doTransition:function(_6){var h=_3.marginBox(this.domNode.firstChild).h;var _7=this.controller.getWindowSize().h;var _8=_7-h;var _9=_7;var _a=_3.fx.slideTo({node:this.domNode,duration:400,top:{start:_6<0?_8:_9,end:_6<0?_9:_8}});var _b=_3[_6<0?"fadeOut":"fadeIn"]({node:this.mask,duration:400});var _c=_3.fx.combine([_a,_b]);var _d=this;_3.connect(_c,"onEnd",this,function(){if(_6<0){_d.domNode.style.display="none";_3.destroy(_d.domNode);_3.destroy(_d.mask);}});_c.play();}});_3.extend(_5.mobile.app.List,{deleteRow:function(){var _e=this._selectedRow;_3.style(_e,{visibility:"hidden",minHeight:"0px"});_3.removeClass(_e,"hold");var _f=_3.contentBox(_e).h;_3.animateProperty({node:_e,duration:800,properties:{height:{start:_f,end:1},paddingTop:{end:0},paddingBottom:{end:0}},onEnd:this._postDeleteAnim}).play();}});if(_5.mobile.app.ImageView&&!_3.create("canvas").getContext){_3.extend(_5.mobile.app.ImageView,{buildRendering:function(){this.domNode.innerHTML="ImageView widget is not supported on this browser."+"Please try again with a modern browser, e.g. "+"Safari, Chrome or Firefox";this.canvas={};},postCreate:function(){}});}if(_5.mobile.app.ImageThumbView){_3.extend(_5.mobile.app.ImageThumbView,{place:function(_10,x,y){_3.style(_10,{top:y+"px",left:x+"px",visibility:"visible"});}});}return _3.getObject("dojox.mobile.app.compat");});require(["dojox/mobile/app/compat"]);