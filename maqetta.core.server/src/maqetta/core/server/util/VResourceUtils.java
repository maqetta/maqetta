package maqetta.core.server.util;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Vector;

import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.osgi.framework.Bundle;

public class VResourceUtils {
	public static void copyDirectory(IVResource source, IVResource destination,
			boolean recurse) throws IOException {
		IVResource[] list = source.listFiles();

		for (int i = 0; i < list.length; i++) {
			if(list[i].isVirtual()) continue;
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

	public static boolean matches(String text, String pattern){
        String [] pieces = pattern.split("\\*");

        for (int i=0;i<pieces.length;i++){
            String chunk = pieces[i];
        	int idx = text.indexOf(chunk);
            if(idx == -1)
                return false;
            text = text.substring(idx + chunk.length());
        }
        
        return true;
    }
	
	/* adds second array to first dropping dupes */
	public static IVResource[] merge(IVResource first[], IVResource[] second){
	    Vector all = new Vector();
	    all.addAll(Arrays.asList(first));
	    for(int i=0;i<second.length;i++){
	        boolean found = false;
	        for(int j=0;!found && j<first.length;j++){
	            if(first[j].getPath().equals(second[i].getPath()))
	                found = true;
	        }
	        if(!found)
	            all.add(second[i]);
	            
	    }
	    return (IVResource[])all.toArray(new IVResource[all.size()]);
	}
	public static void copyDirectory(IStorage userDir, String bundleDirName, Bundle bundle) throws IOException {

        Enumeration files = bundle.findEntries(bundleDirName, "*", true);
        Vector elements = new Vector();
        if (files != null) {
            while (files.hasMoreElements()) {
                URL o = (URL) files.nextElement();
                if(!o.getPath().endsWith("/"))
                    elements.add(o);
            }
        }

        for (int i = 0; i < elements.size(); i++) {
            URL source = (URL) elements.get(i);
            try {
                URLConnection connection = source.openConnection();
                String path = source.getPath();
                String tail = path.substring(bundleDirName.length() + 1);
               
              //  File destination = new File("/Users/childsb/dev/workspaces/maqetta-workspace/childsb@us.ibm.com/project1/WebContent/app.css");
                IStorage destination = userDir.newInstance(userDir, tail);
                
                if (tail.indexOf(".svn") > -1) {
                    continue;
                }
                destination.getParentFile().mkdirs();
                InputStream in = null;
                OutputStream out = null;
                try {
	                in = connection.getInputStream();
	                out = new BufferedOutputStream(destination.getOutputStream());
	                byte[] buf = new byte[1024];
	                int len;
	                while ((len = in.read(buf)) > 0) {
	                    out.write(buf, 0, len);
	                }
                } finally {
                	if (in != null) in.close();
                	if (out != null) out.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
                //TODO: log or wrap exception so we know which file failed
                throw e;
            }
        }
    }

	public static void deleteDir(IStorage directory) throws IOException {
        deleteContents(directory);
        directory.delete();
    }

    public static void deleteContents(IStorage directory) throws IOException {
        IStorage[] theFiles = directory.listFiles();
        for (int i = 0; i < theFiles.length; i++) {
            if (theFiles[i].isDirectory()) {
                deleteContents(theFiles[i]);
            }
            theFiles[i].delete();
        }
    }
	
    public static void setText(IVResource resource, String text) throws IOException {
    	// sets text content to an IVResource
    	OutputStream out = null;
    	try{
			out = resource.getOutputStreem();
			out.write(text.getBytes());
		} finally {
			if (out != null) {
				out.close();
			}
		}
    	
		resource.flushWorkingCopy();
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
