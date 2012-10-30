dojo.provide("test.htmlModify");

dojo.require("davinci.html.HTMLModel");
dojo.require("test.utils");



function doHTMLAddTest(test, str, newElem, afterTag, index, result, resultOffset, afterEndOffset)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var htmlFile =  new davinci.html.HTMLFile();
 htmlFile.setText(str);
 if (htmlFile.errors.length>0)
 {
	throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }
 var afterElem = htmlFile.getDocumentElement().getChildElement(afterTag);
 afterElem.addChild(newElem,index);
 var resultStr=htmlFile.getText({indent:0});
 if (result!=resultStr)
		throw new doh._AssertFailure("incorrect result: "+result+"\n\n");
 if (newElem.startOffset!=resultOffset )
		throw new doh._AssertFailure("bad position");
 if (afterElem.endOffset!=afterEndOffset)
		throw new doh._AssertFailure("bad after position");
	 
}


function doHTMLRemoveTest(test, str, removeTag, parentTag,  result,  afterEnd)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var htmlFile =  new davinci.html.HTMLFile();
 htmlFile.setText(str);
 if (htmlFile.errors.length>0)
 {
	throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }
 var afterElem = htmlFile.getDocumentElement().getChildElement(parentTag);
 var removeElem = afterElem.getChildElement(removeTag);
 afterElem.removeChild(removeElem);
 var resultStr=htmlFile.getText({indent:0});
 if (result!=resultStr)
		throw new doh._AssertFailure("incorrect result: "+result+"\n\n");
  if (afterElem.endOffset!=afterEnd)
		throw new doh._AssertFailure("bad after position");
	 
}



tests.register("test.htmlModify", 
		[
			function testAdd(t){
				 var newElem=new davinci.html.HTMLElement("div");

				doHTMLAddTest(t,
								"<html>\n"+
						        "  <body>\n" +
						        "  </body>\n" +
						        "</html>\n",
						        newElem,
						        "body",
						        undefined,
								"<html>\n"+
						        "  <body>\n" +
						        "    <div></div>\n"+
						        "  </body>\n" +
						        "</html>\n",
//       <html>\  <body>\    <div></div>\  </body>\</html>\n",
						        20,
						        40
				);
				  newElem=new davinci.html.HTMLElement("div");
			     newElem.addChild(new davinci.html.HTMLElement("input"));
			     doHTMLAddTest(t,
						"<html>\n"+
				        "  <body>\n" +
				        "  </body>\n" +
				        "</html>\n",
				        newElem,
				        "body",
				        undefined,
						"<html>\n"+
				        "  <body>\n" +
				        "    <div>\n"+
				        "      <input></input>\n"+
				        "    </div>\n"+
				        "  </body>\n" +
				        "</html>\n",
//      "<html>\  <body>\    <div>\      <input></input>\    </div>\  </body>\</html>\n",
				        20,
				        67
		);
				  newElem=new davinci.html.HTMLElement("div");
				  var e1=new davinci.html.HTMLElement("span");
				   e1.addText("abc\ndef");
				     newElem.addChild(e1);
				     doHTMLAddTest(t,
							"<html>\n"+
					        "  <body>\n" +
					        "  </body>\n" +
					        "</html>\n",
					        newElem,
					        "body",
					        undefined,
							"<html>\n"+
					        "  <body>\n" +
					        "    <div>\n"+
					        "      <span>abc\ndef</span>\n"+
					        "    </div>\n"+
					        "  </body>\n" +
					        "</html>\n",
//		"<html>\  <body>\    <div>\      <span>abc\def</span>\    </div>\  </body>\</html>\n",
					        20,
					        72
				     );	
					  newElem=new davinci.html.HTMLElement("input");
					     doHTMLAddTest(t,
								"<html>\n"+
						        "  <body>\n" +
						        "    <div></div>\n" +
						        "  </body>\n" +
						        "</html>\n",
						        newElem,
						        "body",
						        0,
								"<html>\n"+
						        "  <body>\n" +
						        "    <input></input>\n" +
						        "    <div></div>\n" +
						        "  </body>\n" +
						        "</html>\n",
						        20,
						        60
				);
						  newElem=new davinci.html.HTMLElement("input");
						     doHTMLAddTest(t,
									"<html>\n"+
							        "  <body>\n" +
							        "    <div></div>\n" +
							        "    <table></table>\n" +
							        "  </body>\n" +
							        "</html>\n",
							        newElem,
							        "body",
							        1,
									"<html>\n"+
							        "  <body>\n" +
							        "    <div></div>\n" +
							        "    <input></input>\n" +
							        "    <table></table>\n" +
							        "  </body>\n" +
							        "</html>\n",
							        36,
							        80
					);
			},
			function testRemove(t){
				 var newElem=new davinci.html.HTMLElement("div");

					doHTMLRemoveTest(t,
							"<html>\n"+
					        "  <body>\n" +
					        "    <div></div>\n"+
					        "  </body>\n" +
					        "</html>",
							        "div",
							        "body",
									"<html>\n"+
							        "  <body>\n" +
							        "  </body>\n" +
							        "</html>",
							        24
					);
					doHTMLRemoveTest(t,
							"<html>\n"+
					        "  <body>\n" +
					        "    <div></div>\n"+
					        "    <table></table>\n"+
					        "    <span></span>\n"+
					        "  </body>\n" +
					        "</html>",
							        "table",
							        "body",
									"<html>\n"+
							        "  <body>\n" +
							        "    <div></div>\n"+
							        "    <span></span>\n"+
							        "  </body>\n" +
							        "</html>",
							        58
					);
			},
			
			function LAST(){}

]);