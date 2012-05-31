package maqetta.core.server.command;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Vector;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.ByteArrayPartSource;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONReader;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VLibraryResource;

public class Download extends Command {

	
	private Vector zippedEntries;
	
	//This should stay in sync with validation rules on the client
	public static final String DOWNLOAD_FILE_REPLACE_REGEXP = "[^a-zA-z0-9_.]";
	
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'fileName': XXX not validated
    	//   'resources': contents eventually checked by User.getResource()
    	//   'libs': XXX validated?
    	//   'root': XXX not validated

    	if (user == null) {
            return;
        }
        
        /* keep track of things we've added */
        zippedEntries = new Vector();
        
        String path = req.getParameter("fileName");
        path = sanitizeFileName(path);
        String res = req.getParameter("resources");
        String libs = req.getParameter("libs");
        String root = req.getParameter("root");
        String build = req.getParameter("build");

//        if(build!=null){
        	analyzeWorkspace(user);
//        }

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
            IPath rootPath = new Path(root);
            zipFiles(files, rootPath, zos, includeLibs);
            if(lib!=null) zipLibs(lib, rootPath, zos);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } finally {
            resp.getOutputStream().close();
        }
    }

    private Object analyzeWorkspace(IUser user) throws IOException {
    	IVResource[] files = user.findFiles("*.html", false, true);
        byte[] readBuffer = new byte[2156];
        int bytesIn = 0;
        InputStream fis = null;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        HttpClient client = new HttpClient();
        PostMethod method = new PostMethod("http://build.dojotoolkit.org/api/dependencies"); // TODO: location based on config
        
        for (int i = 0; i < files.length; i++) {
    		try {
        		fis = files[i].getInputStreem();
	            while ((bytesIn = fis.read(readBuffer)) != -1) {
	            	baos.write(readBuffer, 0, bytesIn);
		        }
	            String filename = files[i].getName();
	            Part[] parts = {
	            	new FilePart("value", new ByteArrayPartSource(filename, baos.toByteArray())),
	            	new StringPart("type", "WEB_PAGE")
	            };
	            method.setRequestEntity(new MultipartRequestEntity(parts, method.getParams()));
	            
	            ByteArrayPartSource baps;
	            int statusCode = client.executeMethod(method);
	            if (statusCode != HttpStatus.SC_OK) {
	                System.err.println("Method failed: " + method.getStatusLine());
	            }
	            byte[] body = method.getResponseBody();
	            //TODO...
    		} finally {
    			method.releaseConnection();
    			baos.reset();
    			if (fis != null) fis.close();
    		}
    	}
        return null; //FIXME
    }
    
    private String sanitizeFileName(String fileName) {
	    if (fileName == null || fileName.equals("")) {
	    	fileName = "workspace1.zip";
	    }
	    fileName = fileName.replaceAll(DOWNLOAD_FILE_REPLACE_REGEXP, "_");
	    return fileName;
    }
    
    private boolean addEntry(String path){
    	
    	for(int i=0;i<this.zippedEntries.size();i++){
    		String entry = (String)zippedEntries.get(i);
    		if(entry.compareTo(path)==0) return false;
    		
    	}
    	zippedEntries.add(path);
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
            
            InputStream fis = null;
            try {
	            fis = files[i].getInputStreem();            
	            
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
            } finally {
                // close the Stream
            	if (fis != null) fis.close();
            	files[i].removeWorkingCopy();
            }
       }
    }

}
