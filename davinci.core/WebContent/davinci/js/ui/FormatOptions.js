dojo.provide("davinci.js.ui.FormatOptions");
dojo.require("davinci.ui.Panel");
dojo.require("davinci.js.JSModel");
dojo.require("davinci.js.Format");

dojo.require("davinci.workbench.PreferencePane");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.js", "js");
var langObj = dojo.i18n.getLocalization("davinci.js", "js");

dojo.declare("davinci.js.ui.FormatOptions",davinci.workbench.PanelPreferencePane, {
	getPanel : function (){
    var panel1 =
        [
      
         {
      	type:"layout",
      	left:[
          
          {
            type: "checkBox",
            label: langObj.newLineForBlocks,
            data: "blockNewLine",
            defaultValue:true
          }
          ,
          {
            type: "numberTextBox",
            label: langObj.blockIndention,
            data: "blockIndent",
            defaultValue:3,
            min:0, max:32
          }
          ,
          {
            type: "checkBox",
            label: langObj.newLineForFuncBodies,
            data: "functionNewLine",
            defaultValue:true
          }
          ,
          {
            type: "numberTextBox",
            label: langObj.functionIndention,
            data: "functionIndent",
            defaultValue:5,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.funcParameterListSpacing,
            data: "functionParamSpaceing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.labelSpacing,
            data: "labelSpace",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "checkBox",
            label: langObj.newLineAfterLabel,
            data: "breakOnLabel",
            defaultValue:true
          },
          {
            type: "numberTextBox",
            label: langObj.forStatementSpacing,
            data: "forParamSpacing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.ifStatementSpacing,
            data: "ifStmtSpacing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.varAssignmentSpacing,
            data: "varAssignmentSpaceing",
            defaultValue:1,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.switchSpacing,
            data: "switchSpacing",
            defaultValue:3,
            min:0, max:32
          },
          {
            type: "numberTextBox",
            label: langObj.objectLiteralFieldSpacing,
            data: "objectLitFieldSpace",
            defaultValue:1,
            min:0, max:32
          }
                 ],
        right:[
          
          {
            type: "dynamic",
            createNode : function (fieldData,parentNode,panel){
            
            var options=davinci.workbench.Preferences.getPreferences("davinci.js.format");
             var div = dojo.doc.createElement("div");

               dojo.connect(panel,"onChange",function(){
                  panel.saveData();
                  updateExample(panel.data);
               });

 		    function updateExample(options) {
 		    
               var exampleJS="function abc(def,jhk){ var a=1; var obj={a:2,b:'33'}; label: if (true) { return;} for (i;i<2;i++){} switch (a){case 1: a=1; case 2:a=2;}}";
 				var jsFile = new davinci.js.JSFile();
 				jsFile.setText(exampleJS);
 				var formatted_text = davinci.js.format(jsFile,options);
            
 	            div.innerHTML="<div border=\"3\"><pre>"+formatted_text+"</pre></div>";
 	            }
 	            
 	        updateExample(options);
 			return div;              
            }
          }
 	    ]
 	    }
        ];
    return panel1;
	}
});



