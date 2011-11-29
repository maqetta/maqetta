dojo.provide("davinci.ui.ModelEditor");
 
dojo.require("davinci.ui.TextEditor");

dojo.declare("davinci.ui.ModelEditor", davinci.ui.TextEditor, {

    constructor : function (element) {
		this.model=null;
		this.subscribe("/davinci/ui/selectionChanged", this.selectModel);

	},
	
	colorize : function (text) {
	    return null;
	},
	
	setContent : function (filename, content) {
		this.inherited(arguments);
		this.model.fileName=filename;
		
		this.model.setText(content);
	
	},
		
    getHoverText : function(x,y) {
			var lineColPos=this.convertMouseToLine(x,y);
			var childModel=this.model.findChildAtPosition(
					{startOffset:lineColPos.row,endOffset:lineColPos.col});
			return childModel.getLabel();
	        
	},
	
	handleChange: function(text) {
        this.inherited(arguments);
        
        var oldLabel = this.model.getLabel();
        this.model.setText(text);
        
	},
	
	selectModel: function (selection, editor) {
		if (this.publishingSelect || (editor && this != editor)) {
			return;
		}
		if (selection.length && selection[0].model) {
			var model=selection[0].model;
			if (model.elementType) {
				this.select({ startOffset:model.startOffset, endOffset:model.endOffset});
			}
		}
	},

	selectionChange : function (selection) {
       var childModel = this.model.findChildAtPosition(selection);
       selection.model = childModel;
       if (childModel != this._selectedModel) {
    	   this.publishingSelect = true;
           dojo.publish("/davinci/ui/selectionChanged", [[selection], this]);
           this.publishingSelect = false;
       }
       this._selectedModel = childModel;
	},

	getSyntaxPositions : function (text,lineNumber) {
		
		this.model.setText(text);
		
		if (this.model.getSyntaxPositions)
		{
			var positions=this.model.getSyntaxPositions(lineNumber);
		
			function sortPositions(a,b)
			{
				if (a.line!=b.line)
					return a.line-b.line;
				return a.col-b.col;
			}
			positions=positions.sort(sortPositions);
			return positions;
		}
	},
	
	save : function () {
		var text= this.getText();
		this.model.setText(text);
		this.inherited(arguments);
		
	},
	
	getErrors : function () {
	    if ( this.model.errors ) {
	        return this.model.errors;	        
	    } else {
	        return []; // return empty array to be kind to iterators.
	    }
	}

});

 