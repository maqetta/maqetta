package maqetta.core.server.command;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONReader;
import org.davinci.server.util.JSONWriter;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VLibraryResource;

public class Download extends Command {

	static final private Logger theLogger = Logger.getLogger(Download.class.getName());
	
	private Vector<String> zippedEntries;
	private URL buildURL = null;
	
	//This should stay in sync with validation rules on the client
	public static final String DOWNLOAD_FILE_REPLACE_REGEXP = "[^a-zA-z0-9_.]";
	public static String buildBase = "http://build.dojotoolkit.org";

	{
		String builderProp = ServerManager.getServerManager().getDavinciProperty(IDavinciServerConstants.DOJO_WEB_BUILDER);
		if (builderProp != null) {
			buildBase = builderProp;
		}
	}

	@SuppressWarnings("unchecked")
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
        zippedEntries = new Vector<String>();
        
        String path = req.getParameter("fileName");
        path = sanitizeFileName(path);
        String res = req.getParameter("resources");
        String libs = req.getParameter("libs");
        String root = req.getParameter("root");
        String build = req.getParameter("build");
        boolean useFullSource = "1".equals(req.getParameter("fullsource"));
       
        
        if (build != null){
        	//TODO: should put this in a separate Thread
        	this.buildURL = getBuildURL(user, req.getRequestURL().toString());
        }

		ArrayList<String> o = (ArrayList<String>) JSONReader.read(res);
        List<Map<String, String>> lib = null;
        boolean includeLibs = true;
        if(libs!=null){
    	    lib = (List<Map<String, String>>) JSONReader.read(libs);
    	    includeLibs= false;
        }
        String[] resources = o.toArray(new String[o.size()]);

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
            if(lib!=null) zipLibs(lib, rootPath, zos, useFullSource);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } 
    }

	private URL getBuildURL(IUser user, String requestURLString) throws IOException {
		URL buildURL = new URL(buildBase);
		try {
        	Map<String, List<String>> dependencies = analyzeWorkspace(user, requestURLString);
        	if (dependencies == null) {
        		// nothing to build. Proceed to download zip without any build step.
        		return null;
        	}
    		String statusCookie = requestBuild(dependencies);
    		URL status = new URL(buildURL, statusCookie);
    		String result = null;
    		while (result == null) {
                // now poll for a response with a "result" property
    			InputStream is = status.openStream();
    			try {
                    int size;
                    byte[] buffer = new byte[2048];
     
                    ByteArrayOutputStream baos =
                            new ByteArrayOutputStream(buffer.length);
     
                    while ((size = is.read(buffer, 0, buffer.length)) != -1) {
                        baos.write(buffer, 0, size);
                    }        				
        			String content = baos.toString();
        			theLogger.finest("build status: " + content);
        			@SuppressWarnings("unchecked")
					Map<String, String> json = (Map<String, String>)JSONReader.read(content);
        			result = json.get("result");
    			} finally {
    				is.close();
    			}
    			Thread.sleep(1000);
    		}

    		theLogger.fine("build result: " + result);
    		buildURL = new URL(buildURL, result);
        } catch (InterruptedException ie) {
        	throw new IOException("Thread interrupted.  Did not obtain build result.");
        }
        return buildURL;
	}

	private Map<String, List<String>> analyzeWorkspace(IUser user, String requestURL) throws IOException {
    	IVResource[] files = user.findFiles("*.html", false, true);
        HttpClient client = new HttpClient();
        PostMethod method;
        Map<String, List<String>> result = null;
        String userID = user.getUserID();

        theLogger.finest("analyzeWorkspace: number of files: " + files.length);
		for (int i = 0; i < files.length; i++) {
        	if (files[i].isVirtual()) {
        		theLogger.finest("isVirtual name="+files[i].getPath());
        		continue;
        	}
			method = new PostMethod(buildBase + "/api/dependencies");
    		try {
	            String url = new URL(new URL(requestURL), "/maqetta/user/" + userID + "/ws/workspace/" + files[i].getPath()).toExternalForm();
	            theLogger.finest("DWB: Analyse url="+url);
	            Part[] parts = {
	            	new StringPart("value", url, "utf-8"),
	            	new StringPart("type", "URL")
	            };
	            method.setRequestEntity(new MultipartRequestEntity(parts, method.getParams()));
	            int statusCode = client.executeMethod(method);
	            String body = method.getResponseBodyAsString();
	            if (statusCode != HttpStatus.SC_OK) {
	                throw new IOException(buildBase + "/api/dependencies: Analyse failed: " + method.getStatusLine() + "\n" + body);
	            }

	            int start = body.indexOf("<textarea>");
	            int end = body.indexOf("</textarea>");
	            if (start == -1 || end == -1) {
	            	throw new IOException(buildBase + "/api/dependencies: unable to parse output: " + body);
	            }

	            String content = body.substring(start + 10, end);
	            theLogger.finest("DWB: Analyse result="+ content);
	            @SuppressWarnings("unchecked")
				Map<String, List<String>> dependencies = (Map<String, List<String>>)JSONReader.read(content);
	            if (result == null) {
		            result = dependencies;           	
	            } else {
	            	List<String> requiredDojoModules = result.get("requiredDojoModules");
	            	List<String> additionalModules = dependencies.get("requiredDojoModules");
	            	// TODO: Does Java provide a better way to merge lists?  Sets?  Use an Iterator here?
	                for(int j = 0; j < additionalModules.size(); j++) {
	                	String additionalModule = additionalModules.get(j);
	                	if (!requiredDojoModules.contains(additionalModule)) {
	                		requiredDojoModules.add(additionalModule);
	                		theLogger.finest("add "+additionalModule);
	                	}
	                }
	            }
    		} finally {
    			method.releaseConnection();
    		}
    	}
        return result;
    }

    private String requestBuild(Map<String, List<String>> dependencies) throws IOException {
        JSONWriter jsonWriter = new JSONWriter(false);
        jsonWriter/*.startObject()*/
        	.addField("optimise", "shrinksafe")
        	.addField("cdn", "none")
        	.addField("platforms", "all")
        	.addField("themes", "claro")
        	.addField("cssOptimise", "comments");
        jsonWriter.addFieldName("packages").startArray();
        jsonWriter.startObject().addField("name", "dojo").addField("version","1.8.0").endObject();
//TODO: add supplemental packages like maqetta.*
//        jsonWriter.startObject().addField("name", supplemental).addField("version","1.0.0").endObject();
        jsonWriter.endArray();
        jsonWriter.addFieldName("layers").startArray();
        jsonWriter.startObject();
        jsonWriter.addField("name", "dojo.js");
        jsonWriter.addFieldName("modules");
        jsonWriter.startArray();
    	List<String> requiredDojoModules = dependencies.get("requiredDojoModules");
        for(int i = 0; i < requiredDojoModules.size(); i++) {
            jsonWriter.startObject();
        	jsonWriter.addField("name", requiredDojoModules.get(i));
        	jsonWriter.addField("package", "dojo");
            jsonWriter.endObject();
        }
        jsonWriter.endArray();
        jsonWriter.endObject();
        jsonWriter.endArray();
//        jsonWriter.endObject();
        String content = jsonWriter.getJSON();

        HttpClient client = new HttpClient();
        PostMethod method = new PostMethod(buildBase + "/api/build");
        theLogger.finest("/api/build: " + content);
        try {
        	method.setRequestEntity(new StringRequestEntity(content, "application/json", "utf-8"));
            int statusCode = client.executeMethod(method);
            String json = method.getResponseBodyAsString();
            theLogger.finest("/api/build response: " + json);
        	if (statusCode != HttpStatus.SC_ACCEPTED && statusCode != HttpStatus.SC_OK) {
        		throw new IOException(buildBase + "/api/build failed with status: " + statusCode + "\n" + json);
        	}
            @SuppressWarnings("unchecked")
			Map<String, String> status = (Map<String, String>)JSONReader.read(json);
            String statusLink = status.get("buildStatusLink");
            if (statusLink == null) {
            	throw new IOException(buildBase + "/api/build failed with error: " + status.get("error"));
            }
            return statusLink;
        } finally {
			method.releaseConnection();
		}
    }

    private void transferBuildStream(URL resultURL, String dirString, ZipOutputStream zos) throws IOException {
		ZipInputStream zis = new ZipInputStream(new BufferedInputStream(resultURL.openStream()));
		ZipEntry entry;
        byte[] readBuffer = new byte[2156];
        int bytesIn;

        try {
	        while ((entry = zis.getNextEntry()) != null) {
	        	String pathString = dirString.concat(entry.getName());
				// place the zip entry in the ZipOutputStream object
				zos.putNextEntry(new ZipEntry(pathString));
	        	theLogger.finest("transferBuildStream:" + pathString);
	            // now write the content of the file to the ZipOutputStream
				while ((bytesIn = zis.read(readBuffer)) != -1) {
					zos.write(readBuffer, 0, bytesIn);
				}
			}
        } finally {
        	zis.close();
        }
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
    		String entry = zippedEntries.get(i);
    		if(entry.compareTo(path)==0) return false;
    	}
    	zippedEntries.add(path);
    	return true;
    }
    
    private void zipLibs(List<Map<String, String>> libs, IPath root, ZipOutputStream zos, boolean useSource) throws IOException{
        for (int i = 0; i < libs.size(); i++) {
            Map<String, String> libEntry = (Map<String, String>) libs.get(i);
            String id = libEntry.get("id");
            String version = libEntry.get("version");
            String path = libEntry.get("root");
            Library lib = ServerManager.getServerManager().getLibraryManager().getLibrary(id, version);
            
            boolean sourceLibrary = lib.getSourcePath() != null && useSource;
            
            IVResource libResource = new VLibraryResource(lib, lib.getURL("", sourceLibrary),path, "",sourceLibrary);
            zipDir(libResource,root, zos, true);
        }
    }
    

    private void zipDir(IVResource zipDir, IPath root, ZipOutputStream zos, boolean includeLibs) throws IOException {
        IVResource[] dirList = zipDir.listFiles();
        
        if(!includeLibs && zipDir instanceof VLibraryResource)
        	return;
        
        zipFiles(dirList, root, zos,includeLibs);
    }

    private void zipFiles(IVResource[] files, IPath root, ZipOutputStream zos, boolean includeLibs) throws IOException {
        byte[] readBuffer = new byte[2156];
        int bytesIn;
        // loop through dirList, and zip the files
        for (int i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) {
                zipDir(files[i], root, zos,includeLibs);
                continue;
            }
            if(!includeLibs && files[i] instanceof VLibraryResource)
            	continue;

        	IPath filePath = new Path(files[i].getPath());
            String pathString = filePath.removeFirstSegments(filePath.matchingFirstSegments(root)).toString();
            
            if(pathString==null) return;
            
            /* remove leading characters that confuse and anger windows built in archive util */
            if(pathString.length() > 1 && pathString.indexOf("./")==0)
        	   pathString = pathString.substring(2);

            if(!addEntry(pathString)) continue;

            String dirString = pathString.substring(0, pathString.lastIndexOf('/') + 1);
 
            if (this.buildURL != null && files[i].getPath().equals("lib/dojo/dojo/dojo.js")) {
        		// substitute built version of dojo.js provided by the webservice, along with associated generated layers like nls
        		transferBuildStream(this.buildURL, dirString, zos);
        	} else {
        		// copy stream to zip directly
                InputStream is = null;
                try {
            		is = files[i].getInputStreem();            

		            // place the zip entry in the ZipOutputStream object
		            zos.putNextEntry(new ZipEntry(pathString));
		            // now write the content of the file to the ZipOutputStream
		            while ((bytesIn = is.read(readBuffer)) != -1) {
		              zos.write(readBuffer, 0, bytesIn);
		            }
                } finally {
                    // close the Stream
                	if (is != null) is.close();
                	files[i].removeWorkingCopy();
                }
        	}
       }
    }
}
