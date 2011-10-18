exampleJS = {};

exampleJS.textAtPosition = function(text, positionStart, positionEnd){
	/*
	 * position end is optional, if omitted, then act like "charAt" function
	 */
	
	var end = positionEnd ? positionEnd : {row:positionStart.row, col:positionStart.col+1};
	var byLine = text.split("\n");
	var result = "";
	
	for(var i = positionStart.row;i<end.row+1;i++){
		var row = byLine[i];
		if(i>positionStart.row && i>end.row){
			result +=row + "\n";
		}else if(i==positionStart.row && i==end.row){
			result+=row.substring(positionStart.col, end.col);
		}else if(i==positionStart.row){
			result+=row.substring(positionStart.col, row.length) + "\n";
		}else if(i==end.row){
			result+=row.substring(0, end.col) + "\n";
		}
	}
	return result;
	
}
exampleJS.findword = function (text, position){
	// offset = {row:1, col:1};
	var offset = exampleJS.positionToOffset(text,position)-1;
	var start = -1;
	var end = -1;

	try {
			var pos = offset;
			var c;
			while (pos >= 0) {
				c = text.charAt(pos); 
				if (!exampleJS.isJsIdentifier(c) && c!=".") {
					break;
				}
				--pos;
			}
			start = pos;
			end = offset;
		} catch (ex) {
			console.log(ex);
		}
		
		if (start > -1 && end > -1) {
			if (start == offset && end == offset) {
				return text.substring(start, end).split(".");
			} else if (start == offset) {
				return text.substring(start, end - start).split(".");
			} else {
				return  text.substring(start + 1, end + 1).split(".");
			}
		}
		
		return null; 

}
exampleJS.isJsIdentifier = function(a){
	/* ascii-- needs +unicode should add unicode */
	
	var chrcd = a.charCodeAt(0);
	return a == '_' || a=='$' || 
		   	(chrcd > 47 && chrcd < 58) || // 0-9
		   	(chrcd > 64 && chrcd < 91) || // A-Z 
			(chrcd > 96 && chrcd < 123) ; // a-z

}
exampleJS.offsetToPosition = function(text, offset){
	var contents = text.split("\n");

	var pos = 0, row = 0, col = 0;
	//debugger;
	for(var row = 0;row<contents.length;row++){
		if(pos+contents[row].length>=offset){
			col=offset-pos;
			break;
		}else{
			pos+=contents[row].length+1;
		}

	}
	return {row:row, col:col};
}

exampleJS.positionToOffset = function(text, position){
	var contents = text.split("\n");

	var offset = 0, row = position.row, col = position.col;
	//debugger;
	for(var i = 0;i< row+1 ;i++){
		
		if(i==row)
			offset +=col;
		else
			offset+=contents[i].length + 1;
	}
	
	return offset;
}