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

	
	private Vector<String> zippedEntries;
	private URL buildURL = null;
	
	//This should stay in sync with validation rules on the client
	public static final String DOWNLOAD_FILE_REPLACE_REGEXP = "[^a-zA-z0-9_.]";
	public static String buildBase = "http://build.dojotoolkit.org";

	{
		String builderProp = ServerManager.getServerManger().getDavinciProperty(IDavinciServerConstants.DOJO_WEB_BUILDER);
		if (builderProp != null) {
			buildBase = builderProp;
		}
	}

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
            if(lib!=null) zipLibs(lib, rootPath, zos, useFullSource);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } finally {
            resp.getOutputStream().close();
        }
    }

	private URL getBuildURL(IUser user, String requestURLString) throws IOException {
		URL buildURL = null;
		try {
        	Map dependencies = analyzeWorkspace(user, requestURLString);
    		String statusCookie = requestBuild(dependencies);
    		String result = null;
    		while (result == null) {
                // now poll for a response with a "result" property
        		URL status = new URL(statusCookie);
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
        			System.out.println("build status: " + content);
        			Map json = (Map)JSONReader.read(content);
        			result = (String)json.get("result");
    			} finally {
    				is.close();
    			}
    			Thread.sleep(1000);
    		}

    		System.out.println("build result: " + result);
    		buildURL = new URL(result);
        } catch (InterruptedException ie) {
        	throw new IOException("Thread interrupted.  Did not obtain build result.");
        }
        return buildURL;
	}

	private Map<String,Object> analyzeWorkspace(IUser user, String requestURL) throws IOException {
    	IVResource[] files = user.findFiles("*.html", false, true);
        HttpClient client = new HttpClient();
        PostMethod method;
        Map<String,Object> result = null;
        String userID = user.getUserID();

        System.out.println("analyzeWorkspace: number of files: " + files.length);
		for (int i = 0; i < files.length; i++) {
        	if (files[i].isVirtual()) {
        		System.out.println("isVirtual name="+files[i].getPath());
        		continue;
        	}
			method = new PostMethod(buildBase + "/api/dependencies");
    		try {
	            String url = new URL(new URL(requestURL), "/maqetta/user/" + userID + "/ws/workspace/" + files[i].getPath()).toExternalForm();
	            System.out.println("build.dojotoolkit.org: Analyse url="+url);
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
	            System.out.println("build.dojotoolkit.org: Analyse result="+ content);
	            Map<String,Object> dependencies = (Map)JSONReader.read(content);
	            if (result == null) {
		            result = dependencies;           	
	            } else {
	            	List<String> requiredDojoModules = (List)result.get("requiredDojoModules");
	            	List<String> additionalModules = (List)dependencies.get("requiredDojoModules");
	            	// TODO: Does Java provide a better way to merge lists?  Sets?  Use an Iterator here?
	                for(int j = 0; j < additionalModules.size(); j++) {
	                	String additionalModule = additionalModules.get(j);
	                	if (!requiredDojoModules.contains(additionalModule)) {
	                		requiredDojoModules.add(additionalModule);
	                		System.out.println("add "+additionalModule);
	                	}
	                }
	            }
    		} finally {
    			method.releaseConnection();
    		}
    	}
        return result;
    }

    private String requestBuild(Map<String,Object> dependencies) throws IOException {
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
    	List<String> requiredDojoModules = (List)dependencies.get("requiredDojoModules");
        for(int i = 0; i < requiredDojoModules.size(); i++) {
            jsonWriter.startObject();
        	jsonWriter.addField("name", (String)requiredDojoModules.get(i));
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
        System.out.println("/api/build: " + content);
        try {
        	method.setRequestEntity(new StringRequestEntity(content, "application/json", "utf-8"));
            int statusCode = client.executeMethod(method);
            String json = method.getResponseBodyAsString();
            System.out.println("/api/build response: " + json);
        	if (statusCode != HttpStatus.SC_ACCEPTED && statusCode != HttpStatus.SC_OK) {
        		throw new IOException(buildBase + "/api/build failed with status: " + statusCode + "\n" + json);
        	}
            Map status = (Map)JSONReader.read(json);
            String statusLink = (String)status.get("buildStatusLink");
            if (statusLink == null) {
            	throw new IOException(buildBase + "/api/build failed with error: " + (String)status.get("error"));
            }
            return statusLink;
        } finally {
			method.releaseConnection();
		}
    }

    private InputStream getBuildStream(URL resultURL, String name) throws IOException {
		ZipInputStream zis = new ZipInputStream(new BufferedInputStream(resultURL.openStream()));
		ZipEntry entry;
		while ((entry = zis.getNextEntry()) != null) {
			if (entry.getName().equals(name)) {
				return zis;
   			}
		}
		return null;
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
    
    private  void zipLibs(List libs, IPath root, ZipOutputStream zos, boolean useSource) throws IOException{
        for (int i = 0; i < libs.size(); i++) {
            Map libEntry = (Map) libs.get(i);
            String id = (String) libEntry.get("id");
            String version = (String) libEntry.get("version");
            String path = (String) libEntry.get("root");
            Library lib = ServerManager.getServerManger().getLibraryManager().getLibrary(id, version);
            
            boolean sourceLibrary = (lib.getSourcePath()!=null && useSource);
            
            IVResource libResource = new VLibraryResource(lib, lib.getURL("", sourceLibrary),path, "",sourceLibrary);
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
            
            InputStream is = null;
            try {
            	if (this.buildURL != null && files[i].getPath().equals("lib/dojo/dojo/dojo.js")) {
            		is = getBuildStream(this.buildURL, "dojo.js");
            	} else {
            		is = files[i].getInputStreem();            
            	}

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
