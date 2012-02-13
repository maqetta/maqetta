package maqetta.server.orion.command;

import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.LibraryServlet;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class ListLibs extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	Hashtable maps = LibraryServlet.getLibraryMaps();
    	Enumeration keys = maps.keys();
   	    JSONWriter jsonWriter = new JSONWriter(true);
	    jsonWriter.startObject().addFieldName("userLibs").startArray();
	    
    	while(keys.hasMoreElements()){
    		Object libElement = keys.nextElement();
    		String mapURL =  (String)maps.get(libElement);
    		Library lib = (Library)libElement;
    	    String id = lib.getID();
            String version = lib.getVersion();
            jsonWriter.startObject().addField("id", id);
            jsonWriter.addField("version", version);
            jsonWriter.addField("root", lib.getDefaultRoot());
            jsonWriter.addField("libUrl", mapURL);
            
           URL[] fileUrls = lib.find("*", true);
           
            String base = lib.getURL("").getPath();
            
            Vector urlStrings = new Vector();
            for(int i=0;i<fileUrls.length;i++){
            	String filePath = fileUrls[i].getPath();
            	String tPath = filePath.substring(filePath.indexOf(base));
            	String fullPath = mapURL + tPath;
            	urlStrings.add(fullPath);
            }
           
            jsonWriter.addField("files", (String[])urlStrings.toArray(new String[urlStrings.size()]));
            jsonWriter.endObject();
    	}
        jsonWriter.endArray().endObject();
        this.responseString = jsonWriter.getJSON();
    }

}
