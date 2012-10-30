dojo.provide("test.utils");


doh.assertEqualIgnoreWS = function (expecting, result)
{

 if (expecting!=result)
 {
		function isWhitespace(ch)
		{
		   switch (ch)
		   {
		      case ' ':
		      case '\t':
		      case '\r':
		      case '\n':
		      return true;
		   }
		   return false;
		}

 
    var len1=expecting.length;
    var len2=result.length;
    var inx1=0;inx2=0;
    var match=true;
    while (inx1<len1 && inx2<len2)
    {
       while(inx1<len1 && isWhitespace(expecting[inx1]))
         inx1++;
       while (inx2<len2 && isWhitespace(result[inx2]))
         inx2++;
       if (inx1<len1&& inx2<len2 && expecting[inx1]==result[inx2])
       {
          inx1++;
          inx2++;
       }
       else
       {
	          break;
       }
       
    }
    while(inx1<len1 && isWhitespace(expecting[inx1]))
         inx1++;
    while (inx2<len2 && isWhitespace(result[inx2]))
         inx2++;
    if (inx1!=len1 || inx2!=len2)
    {
	       var message="expected: \n"+expecting+"\n===============\n was:\n"+result;
 	  throw new doh._AssertFailure("assertEqual() failed:\n\texpected\n\t\t"+expecting+"\n\tbut got\n\t\t"+result+"\n\n");
    }
    
 }
}


