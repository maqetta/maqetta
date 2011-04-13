dojo.provide("davinci.js.Format");
dojo.require("davinci.js.JSModel");
dojo.require("davinci.workbench.Preferences");

davinci.js.format = function(model, opt) {
    var options = opt || 
    	davinci.workbench.Preferences.getPreferences("davinci.js.format");
    var indentLevel = 0;
    var output=[];
    var newline = "\n";
    var linepos=0;
    
    function addWhitespace(count)
    {
    	if (count==0)
    		return;
    	output.push("                                                                                                                         ".substring(0,count));
    	linepos+=count;
    }
    
    function addStrings()
    {
    	if (arguments)
    		for (var i=0;i<arguments.length;i++)
    		{
    			if (typeof arguments[i]=='string')
    			{
    				output.push(arguments[i]);
    				linepos+=arguments[i].length;
    			}
    			else
    			{
    				addWhitespace(arguments[i]);
    			}
    		}
    	
    }

    function addString(s)
    {
		output.push(s);
		linepos+=s.length;
    }

    function newLine(ch)
    {
    	if (output.length>0)
    		output.push(newline);
    	addWhitespace(indentLevel);
    	linepos=indentLevel;
    	if (ch)
    		addString(ch);
    }

    function formatStatement(node,visitor){
    	newLine();
    	node.visit(visitor);
    	if (!node.nosemicolon)
    		addString(";");
    }

    function formatStmtOrBlock(node,visitor){
	  if(node.elementType!="Block"){ 
	    indentLevel+=2;
    	newLine();
	  }
	  else
		  addString(" ");
      node.visit(visitor);
	  if(node.elementType!="Block"){ 
    	if (!node.nosemicolon)
    		addString(";");
		indentLevel-=2;
	  }
    }
    

    function escapeChars(str, escapequote)
    {
    	return str.replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").   replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); ;
    }
    
    
    var visitor={
    	visit : function (node)
    	{
    
    	var dontVisitChildren=true;
    	if(node.comment){
    		var comment=node.comment;
    		for(var i = 0;i<comment.comments.length;i++){
    			if(i>0)
    				addWhitespace(indentLevel);
    			if(comment.comments[i].commentType=="line"){
    				addStrings("//" , comment.comments[i].s ,newline);
    			}else if(comment.comments[i].commentType=="block"){
    				addStrings( "/*" , comment.comments[i].s , "*/",newline);
    			}	
    		}
    		addWhitespace(indentLevel);
    	}
    	if(node.label)
    	{
    		addStrings(node.label.s,options['labelSpace'],":",options['labelSpace'] );
    		if(options['breakOnLabel']) 
    			addStrings(this.newline,indentLevel);

    	}
   
    	switch(node.elementType){
		case "While":
			   addString("while (");
			   this.visit(node.expr);
			   addString(")");
			   formatStmtOrBlock(node.action,this);
			break;
		case "Expression":
			break;
		case "NameReference":
			addString(node.name);
			break;
		case "Function":
		{
			addString("function");
			if (node.name!=null){
				addString(" " + node.name);
			}
			
			addString(" (");
			for (var i=0;i<node.parms.length; i++){
				if (i>0){
					addStrings(",",options['functionParamSpaceing']);
				}
				addString(node.parms[i].name);
			}
			addString(")");
			if(options['functionNewLine']){
				newLine('{');
			}else{
				addString(' {');
			}
			
			indentLevel +=  options['functionIndent'];
		    for (var i=0;i<node.children.length;i++){
		   	 	 formatStatement(node.children[i], this);
		    }
		    indentLevel -=  options['functionIndent'];
			newLine('}');
			if(node.name!=null){
				addString(newline);
			}
	    	 dontVisitChildren=true;
		}
			break;
		case "FieldReference":
			this.visit(node.receiver)
			addString("."+node.name);

			break;
		case "FunctionCall":
			 this.visit(node.receiver)
			 addString("(");
			 	for (var i=0;i<node.parms.length;i++){
			    	if (i>0){
			    		addStrings(",",options['functionParamSpaceing']);
			    	}
			    	this.visit(node.parms[i]);
			    }
			 	addString(")");
			break;
		case "BinaryOperation":
			this.visit(node.left);
			addString(node.operator);
			this.visit(node.right);

			break;
		case "Literal":
			switch (node.type){
			case "char":
				addString( "'"+escapeChars(node.value,"'")+"'");
				break;
			case "string":
				addString( '"'+escapeChars(node.value,'"')+'"');
				break;
			case "number":
				addString(node.value);
				break;
			case "null":
			case "this":
			case "undefined":
			case "true":
			case "false":
			default:
				addString( node.type);
			}
			break;
		case "ParenExpression":
			addString("(");
			this.visit(node.expression);
			addString(")");
			break;
		case "AllocationExpression":
			addString("new ");
			this.visit(node.expression);
			if (node.arguments!=null){
				addString("(");
				for (var i=0;i<node.arguments.length;i++){
					if (i>0){
						addString(", ");
					}
					this.visit(node.arguments[i]);
				}
				addString(")");
			}
			break;
		case "FunctionExpression":
			this.visit(node.func);
			break;
		case "UnaryExpression":
			addString(node.operator);
			this.visit(node.expr);
			break;
		case "ObjectLiteral":
			addString("{");
			var storeindent = indentLevel;
			indentLevel = linepos;
			for (var i=0;i<node.children.length;i++){
		    	if(i>0){
		    		newLine();
		    	}
		    	this.visit(node.children[i]);
		    	if(i<node.children.length-1){
		    		addString(",") ;
		    	}
		    }
			indentLevel--;
			if (node.children.length>0)
				newLine();
			indentLevel = storeindent;
			addString("}");
			break;
		case "ObjectLiteralField":
			if (node.nameType=='(string)'){
				addString("'"+node.name+"'");
			}else{ 
				addString(node.name);
			}
			addStrings(options['objectLitFieldSpace'],":",options['objectLitFieldSpace']);
			this.visit(node.initializer);
			break;
		case "ArrayAccess":
			this.visit(node.array);
			addString("[");
			this.visit(node.index);
			addString("]");
			break;
		case "ArrayInitializer":
			addString("[");
			for (var i=0;i<node.children.length; i++){
				if (i>0){
					addString(", ");
				}
				this.visit(node.children[i]);
			}
			addString("]");
			break;
		case "PrefixPostfixExpression":

			if (node.isPrefix)
				addString(node.operator);
			this.visit(node.expr);
			if (!node.isPrefix)
				addString(node.operator);
			break;
		case "ConditionalExpression":
			this.visit(node.condition);
			addString(" ? ");
			 this.visit(node.trueValue) ;
			 addString(" : ");
			 this.visit(node.falseValue);
			break;
		case "EmptyExpression":
			break;
		case "VariableDeclaration":
			 addString("var ");
			 indentLevel+=4;
		    for (var i=0;i<node.children.length;i++){
		    	if (i>0){
		    		addString(",");
		    		if (node.children.length>3)
		    			newLine();
		    		else
		    			addString(" ");
		    	}
		    	this.visit(node.children[i]);
		    }
		    indentLevel-=4;	
		    break;
		case "VariableFragment":
			addString(node.name);
			if (node.init!=null){
				addStrings(options['varAssignmentSpaceing'], "=", options['varAssignmentSpaceing']);
				this.visit(node.init);
			}
			break;
		case "Block":
			if(options['blockNewLine'])
				newLine();
			addString("{");
			indentLevel+=options['blockIndent'];
			for (var i=0;i<node.children.length;i++){
		    	formatStatement(node.children[i],this);
		    }
		    
			indentLevel-=options['blockIndent'];
			newLine('}');
			break;
		case "If":
			  var addSemi = true;
			  var pushIndent = indentLevel;
			  addStrings("if ",options['ifStmtSpacing'],"(");
			  this.visit(node.expr);
			  addString(")");
			  if(node.trueStmt.elementType!="Block"){
				  indentLevel+=2;
				  newLine();
				  this.visit(node.trueStmt);
				  if  (!node.trueStmt.nosemicolon)
					  addString(";");
				  indentLevel-=2;
				  addSemi = false;
			  }else{
				  addString(" ");
				  this.visit(node.trueStmt) ;
			  }
			  if (node.elseStmt!=null){
				  newLine();
				  addStrings(options['ifStmtSpacing'] , "else" ,options['ifStmtSpacing']);
				  if(node.elseStmt.elementType!="Block"){
					  indentLevel+=2;
					  newLine();
					  this.visit(node.elseStmt);
					  if  (!node.elseStmt.nosemicolon)
						  addString(";");
					  indentLevel-=2;
					  addSemi = false;
				  }else{
					  addString(" ");
					  this.visit(node.elseStmt) ;
				  }
			  }
			break;
		case "Try":
			  addString("try");
			  formatStatement(node.stmt,this);
			  if (node.catchBlock){
				  newLine("catch(");
				  addString(node.catchArgument+")");
			 	  formatStatement(node.catchBlock,this);
			  }
			  if (node.finallyBlock){
			  	  newLine("finally");
			 	  formatStatement(node.finallyBlock, this);
			  }
			break;
		case "For":
			addString("for (");
			if (node.initializations!=null)
			  for ( var i = 0; i < node.initializations.length; i++) {
				  	if (i>0)
				  		addStrings("," ,options['forParamSpacing']);
					this.visit(node.initializations[i]);
				}
			  addString(";");
			  if (node.condition!=null)
				  this.visit(node.condition);
			  addString(";");
			  if (node.increments!=null)
				  for ( var i = 0; i < node.increments.length; i++) {
					if (i>0) 
						addStrings("," ,options['forParamSpacing']);
					this.visit(node.increments[i]);
				}
			   addString(")");
			   formatStmtOrBlock(node.action,this);
			break;
		case "ForIn":
		    addString("for (");
		    this.visit(node.iterationVar);
		    addString(" in ");
		    this.visit(node.collection);
		     addString(")");
			 formatStmtOrBlock(node.action,this);
			break;
		case "With":
			addString("with (");
			this.visit(node.expr)
			context.indent+=2;
		     addString(")");
			 formatStmtOrBlock(node.action,this);
		 			break;
		case "Debugger":
		     addString("debugger");
			break;
		case "Branch":
		    addString(node.statement);
			if (node.targetLabel)
				  addString(" "+node.targetLabel);
			break;
		case "Exit":
		    addString(node.statement);
			if (node.expr)
				  addString(" "+node.expr);
			break;
		case "Do":
			 addString("do");
			 formatStmtOrBlock(node.action,this);
		 	 newLine("while(");
		 	 this.visit(node.expr);
		 	 addString(")");
			break;
		case "Switch":
			
			  addString("switch (");
			  this.visit(node.expr);
			  addString(")");
			  if (options['blockNewLine'])
				  newLine();
			  else
				  addString(" ");
			  addString("{");
			  
			  indentLevel+= options['switchSpacing'];
			  for (var i=0;i<node.children.length;i++){
				  if(node.children[i].elementType!="Case"){
					  indentLevel+= options['switchSpacing'];
					  formatStatement(node.children[i],this);
					  indentLevel-=options['switchSpacing'];
					  
				  }else{
					  newLine();
					  this.visit(node.children[i]);
				  }
				  
				  
			  }
			  indentLevel-=options['switchSpacing'];
			  newLine("}");
			break;
		case "Case":
			if (node.expr)
			{
				addString("case ");
			    this.visit(node.expr);
			}
			else
				addString("default");
			addString(":");
			break;
		case "JSFile":
			for (var i=0;i<node.children.length;i++)
				formatStatement(node.children[i],this);
	    	 dontVisitChildren=true;

			break;
		default:
			break;	
	}
		return dontVisitChildren;

    	}
    }
    
    model.visit(visitor);
    
    return output.join("");
}

 
