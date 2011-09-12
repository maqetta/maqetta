package org.davinci.server.internal.command;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Vector;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.ServerManager;
import org.davinci.server.VLibraryResource;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONReader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class Download extends Command {

	
	private Vector zipedEntries;
	
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
        if (user == null) {
            return;
        }
        
        /* keep track of things we've added */
        zipedEntries = new Vector();
        
        String path = req.getParameter("fileName");
        String res = req.getParameter("resources");
        String libs = req.getParameter("libs");
        String rootString = req.getParameter("root");
        IPath root = new Path(rootString);
        
        
        ArrayList o = (ArrayList) JSONReader.read(res);
        List lib = null;
        boolean includeLibs = true;
       if(libs!=null){
    	   lib = (List) JSONReader.read(libs);
    	   includeLibs= false;
       }
       String[] resources = (String[]) o.toArray(new String[o.size()]);

        IVResource[] files = new IVResource[resources.length];
        for (int i = 0; i < files.length; i++) {
            files[i] = user.getResource(resources[i]);
        }

        try {
            resp.setContentType("application/x-download");
            resp.setHeader("Content-Disposition", "attachment; filename=" + path);

            ZipOutputStream zos = new ZipOutputStream(resp.getOutputStream());
            zipFiles(files, root, zos, includeLibs);
            if(lib!=null) zipLibs(lib, root, zos);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } finally {
            resp.getOutputStream().close();
        }

    }
    
    private boolean addEntry(String path){
    	
    	for(int i=0;i<this.zipedEntries.size();i++){
    		String entry = (String)zipedEntries.get(i);
    		if(entry.compareTo(path)==0) return false;
    		
    	}
    	zipedEntries.add(path);
    	return true;
    }
    
    private  void zipLibs(List libs, IPath root, ZipOutputStream zos) throws IOException{
        for (int i = 0; i < libs.size(); i++) {
            HashMap libEntry = (HashMap) libs.get(i);
            String id = (String) libEntry.get("id");
            String version = (String) libEntry.get("version");
            String path = (String) libEntry.get("root");
            Library lib = ServerManager.getServerManger().getLibraryManager().getLibrary(id, version);
            IVResource libResource = new VLibraryResource(lib, lib.getURL(""),path, "");
            zipDir(libResource,root, zos, true);
            
        }
    }
    

    private  void zipDir(IVResource zipDir, IPath root, ZipOutputStream zos, boolean includeLibs) throws IOException {
        IVResource[] dirList = zipDir.listFiles();
        
        if(!includeLibs && zipDir instanceof VLibraryResource)
        	return;
        
        zipFiles(dirList, root, zos,includeLibs);
    }

    private  void zipFiles(IVResource[] files, IPath root, ZipOutputStream zos, boolean includeLibs) throws IOException {
        byte[] readBuffer = new byte[2156];
        int bytesIn = 0;
        // loop through dirList, and zip the files
        for (int i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) {
                zipDir(files[i], root, zos,includeLibs);
                continue;
            }
            if(!includeLibs && files[i] instanceof VLibraryResource)
            	continue;
            
            InputStream fis = files[i].getInputStreem();
            
            
            IPath filePath = new Path(files[i].getPath());
            String pathString = filePath.removeFirstSegments(filePath.matchingFirstSegments(root)).toString();
            
            
            if(pathString==null) return;
            
            /* remove leading characters that confuse and anger windows built in archive util */
           if(pathString.length() > 1 && pathString.indexOf("./")==0)
        	   pathString = pathString.substring(2);

            if(!addEntry(pathString)) continue;
            
            
            ZipEntry anEntry = new ZipEntry(pathString);
                // place the zip entry in the ZipOutputStream object
            zos.putNextEntry(anEntry);
                // now write the content of the file to the ZipOutputStream
            while ((bytesIn = fis.read(readBuffer)) != -1) {
              zos.write(readBuffer, 0, bytesIn);
            }
                // close the Stream
            fis.close();
            files[i].removeWorkingCopy();
       }
    }

}
