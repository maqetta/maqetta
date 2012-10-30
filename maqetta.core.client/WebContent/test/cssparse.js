dojo.provide("test.cssparse");

dojo.require("davinci.js.JSModel");
dojo.require("davinci.html.CSSModel");
dojo.require("test.utils");

function doCSSParseTest(str,test,ignoreError, resultStr)
{
	resultStr = resultStr || str;
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var cssFile = new davinci.html.CSSFile();
 cssFile.setText(str);
 if (cssFile.errors.length>0)
 {
	 if (!ignoreError)
		 throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }
 else if (ignoreError)
	 throw new doh._AssertFailure("should have been errors on: "+str+"\n\n");
 var result=cssFile.getText();
 test.assertEqualIgnoreWS(resultStr,result);
}

function doCSSRuleSearchTest(str,selector,test,ignoreError){
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var cssFile = new davinci.html.CSSFile();
 cssFile.setText(str);
 if (cssFile.errors.length>0) {
	 if (!ignoreError)
		 throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }else if (ignoreError)
	 throw new doh._AssertFailure("should have been errors on: "+str+"\n\n");
 
 
 for(var i = 0;i<cssFile.children.length;i++){
	 var rule =cssFile.children[i];
	 var ruleFullSelector = rule.getSelectorText();
	 
	 if(ruleFullSelector!=selector) throw new doh._AssertFailure("should have found selector: "+selector+"\n\n in \ninstead:\n" + ruleFullSelector);
	 
 }
 
}



function doCSSSelectorSearchTest(str,selector,test,wrongSelector, ignoreError){
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var cssFile = new davinci.html.CSSFile();
 cssFile.setText(str);
 if (cssFile.errors.length>0) {
	 if (!ignoreError)
		 throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }else if (ignoreError)
	 throw new doh._AssertFailure("should have been errors on: "+str+"\n\n");
 

 var result=cssFile.getRule(selector);
 if(!result && !wrongSelector) 
	 throw new doh._AssertFailure("should have found selector: "+selector+"\n\n in \n\n" + str);
 else if(result && wrongSelector)
	 throw new doh._AssertFailure("getRule(: "+selector+") returned \n\n in \ninstead:\n" +  result.getText());
}
function doCSSErrorParseTest(str,errors,test)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

	 var cssFile = new davinci.html.CSSFile();
	 cssFile.setText(str);
 if (cssFile.errors.length !=errors.length)
 {
	throw new doh._AssertFailure("wrong number of parse errors on: "+str+"\n\n");
 }
 for (var i=0;i<cssFile.errors.length;i++)
 {
	 if (cssFile.errors[i].reason != errors[i])
			throw new doh._AssertFailure("expected error '"+errors[i]+"' on : "+str+"\n\n");
 }
 
}


tests.register("test.cssparse", 
		[
			function test(t){
				
				doCSSParseTest(" table {  font-size:100%; }",t);
				doCSSParseTest(" table ,h1 {  font-size:100%; }",t);
				doCSSParseTest(" table.cls {  font-size:100%; }",t);
				doCSSParseTest(" #myid {  font-size:100%; }",t);
				doCSSParseTest(" .cls {  font-size:100%; }",t);
				doCSSParseTest(" h1 table {  font-size:100%; }",t);
				doCSSParseTest(" .cls .cc {  font-size:100%; }",t);
				doCSSParseTest(" table {  font-size:100%;  background-position: center center; }",t);
				doCSSParseTest(" table { border-color: transparent #ACA899 #919191 transparent; }",t);
				doCSSParseTest(" table { border-color: #919191 transparent; }",t);
				doCSSParseTest(" table { border-bottom: 1px solid #ccc; }",t);
				doCSSParseTest(" table {background-image: url('../../../dijit/themes/architect/images/loading.gif'); }",t);
				doCSSParseTest("@import url(\"Common.css\");\n table {  font-size:100%; }",t);
				doCSSParseTest("@import \"Common.css\";",t);
				doCSSParseTest("  /*comment*/ table {  font-size:100%; }  ",t);
				doCSSParseTest(" table {  /*cmt*/ font-size:100%; } ",t);
				doCSSParseTest(" table { -moz-opacity: 0.6; } ",t);
				doCSSParseTest(" .dijitButtonNode::-moz-focus-inner {  font-size:100%; }",t);
				doCSSParseTest(" .dijitInputField INPUT {  font-size:100%; }",t);
				doCSSParseTest(" .dijit_a11y * {  font-size:100%; }",t);
				doCSSParseTest("  div:focus  {  font-size:100%; }",t);
				doCSSParseTest("  td[colspan=\"2\"]{  font-size:100%; }",t);
				doCSSParseTest("  .dijitBorderContainer > .dijitTextArea {  font-size:100%; }",t);
				doCSSParseTest("  table .dijitButton .dijitButtonNode {  #overflow:hidden; }",t);
				doCSSParseTest("   .dijitButtonNode {  #display:inline; }",t);
				doCSSParseTest("  div:focus  {  font-size:100% !important; }",t);
				doCSSParseTest(" .dijitTextArea[cols] {	width:auto; /* SimpleTextArea cols */}",t);
				doCSSParseTest(" table {		#zoom: 1; /* set hasLayout:true to mimic inline-block */	#display:inline; /* don't use .dj_ie since that increases the priority */	border:0; }",t);
				doCSSParseTest(" table {	#vertical-align: auto; }",t);
				doCSSParseTest(" table {	top: expression(eval((document.documentElement||document.body).scrollTop)); }",t);
				doCSSParseTest(" table {  /* sdsd \n * font-size:100%; /*sdf */ text-align: left; }",t);
				doCSSParseTest(" table {   background-color : rgb(236, 236, 236);  }",t);
//				doCSSParseTest(" body.lotusui{margin:0;padding:0;font:75%/1.5em Arial, Helvetica, sans-serif;}",t);
				doCSSParseTest(" .myapp.claro .dijitButton .dijitButtonNode {background-color:#c02c2c;}",t);
				doCSSRuleSearchTest(".claro .dijitButton .dijitButtonNode,  .claro .dijitDropDownButton .dijitButtonNode,  .claro .dijitComboButton .dijitButtonNode,  .claro .dijitToggleButton .dijitButtonNode{background-color:#c02c2c;}",".claro .dijitButton .dijitButtonNode, .claro .dijitDropDownButton .dijitButtonNode, .claro .dijitComboButton .dijitButtonNode, .claro .dijitToggleButton .dijitButtonNode", t)
				doCSSSelectorSearchTest(".claro .dijitButton .dijitButtonNode,  .claro .dijitDropDownButton .dijitButtonNode,  .claro .dijitComboButton .dijitButtonNode,  .claro .dijitToggleButton .dijitButtonNode{background-color:#c02c2c;}",".claro .dijitToggleButton .dijitButtonNode", t)
//				/* search for the rule to ensure its selector is modeled correctly */
				doCSSParseTest("#hhhh.dijitButton .dijitButtonNode{background-color:#c02c2c;}", t)
//				doCSSParseTest("table {background-image:url;}", t,true)
//				doCSSParseTest(".foo { col", t,true)
				doCSSParseTest(".dijitButton #hhhh.dijitButtonNode{background-color:#c02c2c;}", t);
				doCSSSelectorSearchTest(".a .b .c{}", ".fff", t, true);
				doCSSSelectorSearchTest("#myapp.claro .myBCColor{}", "#myapp.claro .NEWmyBCColor", t, true);
				doCSSParseTest(".dijitButton{background-color:#c02c2c } .c{}", t, false, ".dijitButton{background-color:#c02c2c; } .c{}");
				doCSSParseTest("body {*font-size: 75%;	}", t, false, "body {*font-size: 75%;	}");
				doCSSParseTest("body {*font-size: 75%; //comment \n	}", t);
				doCSSParseTest("@CHARSET \"ISO-8859-1\";", t);
			},
			
			function testError(t){
				doCSSErrorParseTest(" table {background: #D8E8F9 url(../../../dijit/themes/architect/images/tabDisabled.png) #dddddd  no-repeat center; }",
						["background-color value specified more than once"],t);
				doCSSErrorParseTest(" .dijitTextArea[colsundefined\"undefined\"] {  width : auto;}",
						["Expected ']' and instead saw 'undefined'.","Expected a CSS selector, and instead saw ]."],t);
			}			
			
]);
