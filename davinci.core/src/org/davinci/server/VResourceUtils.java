package org.davinci.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;

public class VResourceUtils {
	public static void copyDirectory(IVResource source, IVResource destination, boolean recurse){ //FIXME: should throw IOException?
		IVResource[] list = source.listFiles();
		
		for(int i=0;i<list.length;i++){
			destination.mkdir();
			IVResource r = destination.create(list[i].getName());
			if(list[i].isDirectory()){
				r.mkdir();
				if(recurse)
					copyDirectory(list[i], r, recurse);
			}else{
				try {
					if(!r.exists()){
						r.createNewInstance();
						VResourceUtils.copyFile(list[i], r);
						r.flushWorkingCopy();
					}
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			
			
		}
	}
	
	public static void copyFile (IVResource src, IVResource dest) throws IOException{
		 InputStream in = new BufferedInputStream(src.getInputStreem());
		 OutputStream out = new BufferedOutputStream(dest.getOutputStreem());
		 
		 try {
			 byte[] buf = new byte[1024];
			 int len;
			 while ((len = in.read(buf)) > 0){
			    out.write(buf, 0, len);
			 }
		 } finally {
			 in.close();
			 out.close();
		 }
		 dest.flushWorkingCopy();
	}
	
}
