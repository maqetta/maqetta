package maqetta.core.server.command;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
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
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VLibraryResource;

public class Download extends Command {

	
	private Vector zippedEntries;
	private URL buildURL = null;
	
	//This should stay in sync with validation rules on the client
	public static final String DOWNLOAD_FILE_REPLACE_REGEXP = "[^a-zA-z0-9_.]";
	public static final String BUILD_BASE = "http://build.dojotoolkit.org"; // TODO: parameterize as a preference?

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
            if(lib!=null) zipLibs(lib, rootPath, zos);
            zos.close();
            // responseString="OK";

        } catch (IOException e) {
            responseString = "Error creating download file : " + e;
        } finally {
            resp.getOutputStream().close();
        }
    }

	private URL getBuildURL(IUser user, String requestURLString) {
		URL buildURL = null;
		try {
        	Map dependencies = analyzeWorkspace(user, requestURLString);
        	if (dependencies != null) {
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
        		}

        		System.out.println("build result: " + result);
        		buildURL = new URL(result);
        	}
        } catch (IOException ioe) {
        	ioe.printStackTrace();
        	// continue download without a build
        }
        return buildURL;
	}

	private Map analyzeWorkspace(IUser user, String requestURL) throws IOException {
    	IVResource[] files = user.findFiles("*.html", false, true);
        HttpClient client = new HttpClient();
        PostMethod method;
        Object result = null;
        String userID = user.getUserID();

        //FIXME: temporary for testing behind firewall, use Adam's public account.  Will only work if files match what's there (e.g. clean workspace)
		requestURL = "http://maqetta.org:55556/";
		userID = "apeller@us.ibm.com";

		for (int i = 0; i < files.length; i++) {
        	if (files[i].isVirtual()) continue;
			method = new PostMethod(BUILD_BASE + "/api/dependencies");
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
	                System.err.println("build.dojotoolkit.org: Analyse failed: " + method.getStatusLine() + " " + body);
	                return null;
	            }

	            int start = body.indexOf("<textarea>");
	            int end = body.indexOf("</textarea>");
	            if (start == -1 || end == -1) {
	            	System.err.println("Builder unable to parse output: " + body);
	            	return null;
	            }

	            String content = body.substring(start + 10, end);
	            System.out.println("build.dojotoolkit.org: Analyse result="+ content);
	            Object dependencies = JSONReader.read(content);
	            if (result == null) {
		            result = dependencies;           	
	            } else {
	            	//TODO mixin results
	            }
    		} finally {
    			method.releaseConnection();
    		}
    	}
        return (Map)result;
    }

    private String requestBuild(Map dependencies) throws IOException {
        JSONWriter jsonWriter = new JSONWriter(false);
        jsonWriter/*.startObject()*/
        	.addField("optimise", "shrinksafe")
        	.addField("cdn", "none")
        	.addField("platforms", "all")
        	.addField("themes", "claro")
        	.addField("cssOptimise", "comments");
        jsonWriter.addFieldName("packages").startArray();
        jsonWriter.startObject().addField("name", "dojo").addField("version","1.7.2").endObject();
        jsonWriter.startObject().addField("name", "dwb").addField("version","1.0.0").endObject();
//TODO: add supplemental packages like maqetta.*
//        jsonWriter.startObject().addField("name", supplemental).addField("version","1.0.0").endObject();
        jsonWriter.endArray();
        jsonWriter.addFieldName("layers").startArray();
        jsonWriter.startObject();
        jsonWriter.addField("name", "dojo.js");
        jsonWriter.addFieldName("modules");
        jsonWriter.startArray();
    	List requiredDojoModules = (List)dependencies.get("requiredDojoModules");
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
        PostMethod method = new PostMethod(BUILD_BASE + "/api/build");
        System.out.println("/api/build: " + content);
        try {
        	method.setRequestEntity(new StringRequestEntity(content, "application/json", "utf-8"));
            int statusCode = client.executeMethod(method);
        	//TODO: check statusCode
            String json = method.getResponseBodyAsString();
            System.out.println("/api/build response: " + json);
            Map status = (Map)JSONReader.read(json);
            return (String)status.get("buildStatusLink");
        } finally {
			method.releaseConnection();
		}
        /*
               	"packages":[{"name":"dojo","version":"1.7.2"},{"name":"dwb","version":"1.0.0"},{"name":"dojo_web_builder8869570927650621065.tmp","version":"1.0.0"}],
               	"layers":[{"name":"dojo.js","modules":[{"name":"dijit.form.Button","package":"dojo"},{"name":"dijit.form.ComboBox","package":"dojo"},{"name":"dijit.form.MultiSelect","package":"dojo"},{"name":"dijit.form.TextBox","package":"dojo"},{"name":"dijit.layout.ContentPane","package":"dojo"},{"name":"dijit.layout.TabContainer","package":"dojo"},{"name":"dojo.dom","package":"dojo"},{"name":"dojo.dom-style","package":"dojo"},{"name":"dojo.parser","package":"dojo"},{"name":"dojo.query","package":"dojo"},{"name":"dojo._base.connect","package":"dojo"},{"name":"dojo._base.lang","package":"dojo"},{"name":"dojo.domReady!","package":"dojo"},{"name":"maqetta.AppStates","package":"dojo_web_builder8869570927650621065.tmp"},{"name":"maqetta.space","package":"dojo_web_builder8869570927650621065.tmp"}]}]}
        */
    }

    /*
    private void transferBuildStream(URL resultURL, OutputStream os) throws IOException {
		ZipInputStream zis = new ZipInputStream(new BufferedInputStream(resultURL.openStream()));
		try {
    		ZipEntry entry;
    		while ((entry = zis.getNextEntry()) != null) {
    			if (entry.getName().equals("dojo.js")) {
                    int size;
                    byte[] buffer = new byte[2048];
     
                    BufferedOutputStream bos =
                            new BufferedOutputStream(os, buffer.length);
     
                    while ((size = zis.read(buffer, 0, buffer.length)) != -1) {
                        bos.write(buffer, 0, size);
                    }
                    os.flush();
       			}
    		}
		} finally {
			zis.close();
		}
    }
    */

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
