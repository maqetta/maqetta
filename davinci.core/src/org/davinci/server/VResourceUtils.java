package org.davinci.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.Vector;

public class VResourceUtils {
	public static void copyDirectory(IVResource source, IVResource destination,
			boolean recurse) {
		IVResource[] list = source.listFiles();

		for (int i = 0; i < list.length; i++) {
			destination.mkdir();
			IVResource r = destination.create(list[i].getName());
			if (list[i].isDirectory()) {
				r.mkdir();
				if (recurse) {
					VResourceUtils.copyDirectory(list[i], r, recurse);
				}
			} else {
				try {
					if (!r.exists()) {
						r.createNewInstance();
						VResourceUtils.copyFile(list[i], r);
						r.flushWorkingCopy();
					}
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
	}

	/* adds second array to first dropping dupes */
	public static IVResource[] merge(IVResource first[], IVResource[] second){
	    Vector all = new Vector();
	    all.addAll(Arrays.asList(first));
	    for(int i=0;i<second.length;i++){
	        boolean found = false;
	        for(int j=0;!found && j<first.length;j++){
	         //   System.out.println("FIrst: " + first[j].getPath() + " second " + second[i].getPath());
	            
	            if(first[j].getPath().equals(second[i].getPath()))
	                found = true;
	        }
	        if(!found)
	            all.add(second[i]);
	            
	    }
	    return (IVResource[])all.toArray(new IVResource[all.size()]);
	}
	
	
	public static void copyFile(IVResource src, IVResource dest)
			throws IOException {
		InputStream in = null;
		OutputStream out = null;
		try{
			in = src.getInputStreem();
			out = dest.getOutputStreem();

			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
			dest.flushWorkingCopy();
		}finally{
			if(in != null) in.close();
			if(out != null) out.close();
		}
	}

}
