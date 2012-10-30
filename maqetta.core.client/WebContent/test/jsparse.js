dojo.provide("test.jsparse");

dojo.require("davinci.js.JSModel");
dojo.require("test.utils");


 

function doParseTest(str,test)
{
	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var jsFile = new davinci.js.JSFile();
 jsFile.setText(str);
 if (jsFile.errors.length>0)
 {
	throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }
 var result=jsFile.getText();
 test.assertEqualIgnoreWS(str,result);
}

function doJSErrorParseTest(str,errors,test) 
{ 
	davinci.model.parser.defaultParseOptions.ignoreError=false; 
 
	 var jsFile = new davinci.js.JSFile(); 
	 jsFile.setText(str); 
 if (jsFile.errors.length !=errors.length) 
 { 
	throw new doh._AssertFailure("wrong number of parse errors on: "+str+"\n\n"); 
 } 
 for (var i=0;i<jsFile.errors.length;i++) 
 { 
	 if (jsFile.errors[i].reason != errors[i]) 
			throw new doh._AssertFailure("expected error '"+errors[i]+"' on :"+str+"\n\n"); 
 } 
 
} 

tests.register("test.jsparse", 
		[
			function test(t){
				   doParseTest("\"ddd\"+1;\n",t);
				   doParseTest("i=null;\n",t);
				   doParseTest(" function ff(abc) { var a=cc()+1;}",t);
				   doParseTest("i=this.v1+4;",t);
				   doParseTest("i=dd.cc.funccall(c,b);",t);
				    doParseTest("i=funccall().methCall();",t);
				    doParseTest("i= function (c,b) {i=2;};",t);
				    doParseTest("  i= 1+(z-v);    ",t);
				    doParseTest("   i= new abc(dd);   ",t);
				    doParseTest("   i= new dojo.uri.Uri(1,2);   ",t);
				    doParseTest("   i= new SomeClass;   ",t);
				    doParseTest(" normalizeNewlines = function (text,newlineChar) {i=1;} ;     ",t);
				     doParseTest("  i= typeof objpath != \"string\";    ",t);
				    doParseTest(" i= ar instanceof Error;     ",t);
				    doParseTest(" i= anArg.name != null ;     ",t);
				    doParseTest("  i= anArg.name != undefined ;    ",t);
				    doParseTest("   i= { a: 2 , b: 3+4};   ",t);
				    doParseTest("   i= { 'a': 2 , 'b': 3+4};   ",t);
				    doParseTest("  i= { a: function(){ var ar={c:3,d:4,e:4}; } , b: function(cc){ var c=1;} , d:function(){}};    ",t);
				      doParseTest("   i= arr[4];   ",t);
				    doParseTest("   arr[4]=1;  ",t);
				     doParseTest("  i= [a,b];   ",t);
				    doParseTest("    i= [,a];  ",t);
				    doParseTest("  i= [a,];    ",t);
				    doParseTest("   i= [,];   ",t);
				    doParseTest("  i= [];    ",t);
				    doParseTest("  i= [a,,b];    ",t);
				    doParseTest(" i= [,,];    ",t);
				    doParseTest(" i= [a,b,,c];     ",t);
				    doParseTest(" i= f++;     ",t);
				    doParseTest(" i= f++ * --f;     ",t);
				    doParseTest(" i= /([\"\\\\])/g ;",t);
				      doParseTest("     (!options) ? options = {} : '';   ",t);
				    doParseTest("abc();debugger;      ",t);
			},
			function test2(t){
				     doParseTest("    if (a>1) this.c=f+5;  ",t);
				    doParseTest("   if (a>1) {} else c=4;   ",t);
				    doParseTest("   if (a>1) {} else if (b>a) a=2;    ",t);
				    doParseTest("   try { a=2;} catch (ex) {a=3;};   ",t);
				     doParseTest("   for (i=1;i<3;i++)  f++ ;",t);
				    doParseTest("    for (var a in this.vars)   f++ ;",t);
				    doParseTest("  with (foo)\n bar;    ",t);
				    doParseTest("    while (a>0)\n a++;  ",t);
				    doParseTest("  do {f++;} while (f>1);    ",t);
				    doParseTest(" switch (a) { case '1': return 1; default: a=1;}     ",t);
				 // NOT IMPLEMENTED YET	doParseTest("label: for (var i = 0; i < 10; i++)  \n" +
				 	doParseTest("	     continue label;\n" );
			},
		
			
			function test3(t){
				doParseTest("/* comment */ alert('hello');",t);
				doParseTest("/* comment */ var k = 50;",t);
				doParseTest("for( ; ; ){/* comment2 */\n}",t);
				doParseTest("// line comment \n\nvar k = 50;",t);
				doParseTest("// line comment \n\nfor(var i = 0;i<5;i++){/*comment*/}",t);
				doParseTest("for(var i = 0;i<5;i++){/* comment2 */\nalert('hello');\n/* comment */}",t);
				doParseTest("/* comment */ alert('hello');",t);
				doParseTest("start : for(var i=0;i<5;i++){continue start;\n}",t);
				doParseTest("// TODO: unnecessary?\n var someobject = {getOpenEditorId: function (){}, anything:'sometext'};" ,t);
			},
			function testError(t){ 
				doJSErrorParseTest(" /*   \n ", 
						["Unclosed comment."],t); 
			}	
		]
	);
