dojo.provide("test.cssQuery");

dojo.require("davinci.js.JSModel");
dojo.require("davinci.html.CSSModel");
dojo.require("davinci.html.HTMLModel");
dojo.require("test.utils");

davinci.html.cssTestData =
{

		css1: " .cls1 {  font-size: 100%; }"
			 +" .cls2 {  font-size:75%; }"
			 +" .cls3 {  font-size:65%; }"
			 +" .cls1, .cls2  {  color:red; }"
			 +" p.cls1  {  color:green; }"
			 +" .div1cls .cls2  {  margin: 5px; }"
			 +" .cls3 {  font-size:55%; }"
			 +" .div1cls   {  margin: 10px; }"
			 ,
	    css2: " .c { border: 1px black solid; }" +
	          " .b .c { border-bottom: 2px red dashed; }"+
	          " .a .b .c { border-bottom-color: green; }",
	    css3:".myapp.claro .dijitButton .dijitButtonNode {background-color:#c02c2c;}",
	    
		html1: "<html><body>" +
			"<div id='div1' class='div1cls' >" +
			"<p id='p1' class='cls1'></p>" +
			"<p id='p2' class='cls2'></p>" +
			"<p id='p3' class='cls3'></p>" +
			"</div>" +
			"</body></html>"
			,
		html2: "<html><body class='claro'>" +
			"<div id='div1' class='dijitDialogTitleBar' ></div>" +
			"</body></html>"
			,
		html3:"<html><body class='a'>" +
			" <div class='b'><label id='p3' class='c'>LABEL</label></div>" +
			" </body></html>",	
		html4: "<html><body class='myapp claro'>" +
			"<div class='dijitButton' ><div class='dijitButtonNode' id='p4'></div></div>" +
			"</body></html>",	
		xx:0	
}

function __convertDOM(htmlFile,id)
{
     var idNode;
     
     function createNode(element, parent)
     {
    	 var domNode={ tagName:element.tag, parentNode:parent, childNodes:[], className:""};
    	 dojo.forEach(element.attributes, function (attribute){
    		 switch (attribute.name)
    		 {
    		 	case 'class' : domNode.className=attribute.value; break;
    		 	case 'id' :	 if (attribute.value==id)
    					 idNode=domNode;
    		 			 // fallthru
    		    default:
    				 domNode[attribute.name]=attribute.value;
    		 
    		 }
    	 });
    	 dojo.forEach(element.children, function (childElement){
    		 if (childElement.elementType=='HTMLElement')
    		 {
    			 domNode.childNodes.push(createNode(childElement,domNode));
    		 }
    	 });
    	 return domNode;
     }
     
     var topNode=createNode(htmlFile.children[0],null);
     return {
    	 dom:topNode,
    	 domNode: idNode
     }
}

function __loadCSS(url)
{
	var css= new davinci.html.CSSFile({
		url:url,
		includeImports : true,
		loader: function (url)
		{
				var result=dojo.xhrGet({
				url: url,
				handleAs: "text",
				sync: true
				});
				return result.results[0];
		}
	});
	return css;
}


function doCSSQueryTest(css,html,id,property,value,test)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var cssFile;
 if (css.elementType=='CSSFile')
	 cssFile=css;
 else
 {
	 cssFile= new davinci.html.CSSFile();
	 cssFile.setText(css);
	 if (cssFile.errors.length>0)
	 {
		throw new doh._AssertFailure("CSS parse errors on: "+css+"\n\n");
	 }
 }

 var htmlFile = new davinci.html.HTMLFile();
 htmlFile.setText(html);
 if (htmlFile.errors.length>0)
 {
	throw new doh._AssertFailure("HTML parse errors on: "+html+"\n\n");
 }
 var convertedDom=__convertDOM(htmlFile, id);
 
 var prop=cssFile.getStyleValue(property,convertedDom.domNode);
 if (prop)
 {
	 test.assertEqualIgnoreWS(value,prop.value);
 }
 else
 {
	 if (value)
			throw new doh._AssertFailure("NO Css property found");
		 
 }
 
}


tests.register("test.cssQuery", 
		[
 			
			function test(t){
				
				doCSSQueryTest(davinci.html.cssTestData.css1,davinci.html.cssTestData.html1,'p1',
						'font-size','100%',t);
				doCSSQueryTest(davinci.html.cssTestData.css1,davinci.html.cssTestData.html1,'p2',
						'color','red',t);
				doCSSQueryTest(davinci.html.cssTestData.css1,davinci.html.cssTestData.html1,'p3',
						'font-size','55%',t);
				doCSSQueryTest(davinci.html.cssTestData.css1,davinci.html.cssTestData.html1,'p1',
						'color','green',t);
				doCSSQueryTest(davinci.html.cssTestData.css1,davinci.html.cssTestData.html1,'p2',
						'margin','5px',t);
				
				doCSSQueryTest(davinci.html.cssTestData.css2,davinci.html.cssTestData.html3,'p3',
						'border-bottom-color','green',t);
				
				doCSSQueryTest(davinci.html.cssTestData.css3,davinci.html.cssTestData.html4,'p4',
						'background-color','#c02c2c',t);
			},
			
			function test2(t){
				
				var css= __loadCSS(	dojo.moduleUrl("davinci")+"davinci.css");
				doCSSQueryTest(css,davinci.html.cssTestData.html2,'div1',
						'background-color','#abd6ff',t);
			}
]);
