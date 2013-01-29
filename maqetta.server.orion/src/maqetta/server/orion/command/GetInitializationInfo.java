package maqetta.server.orion.command;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.util.Scanner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.MaqettaOrionServerConstants;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;

public class GetInitializationInfo extends Command {
	private String siteConigJson = null;

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(user.getUserID());
    	String workbenchSettings = result.get(MaqettaOrionServerConstants.WORKBENCH_PREF, "{}");
    	String c = this.getSiteJson();
		this.responseString=
			"{\n"+
			"\t'workbenchState':"+workbenchSettings+",\n"+
			"\t'userInfo':{'userId': '"+user.getUserID()+"',"+
			"\t\t'isLocalInstall': '"+String.valueOf(ServerManager.LOCAL_INSTALL)+"',"+
			"\t\t'userFirstName': '"+String.valueOf(user.getPerson().getFirstName())+"',"+
			"\t\t'userLastName': '"+String.valueOf(user.getPerson().getLastName())+"',"+
			"\t\t'email': '"+user.getPerson().getEmail()+"'\n"+
			"\t}"+
			"\t"+c+"\n"+
			"}";

    }
    
    private String getSiteJson(){
    	
    	if (this.siteConigJson != null) {
    		return this.siteConigJson;
    	}
    	String ret = "";
    	String siteConfigDir =  ServerManager.getServerManger().getDavinciProperty(IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY);
    	try {
	    	 File folder = new File(siteConfigDir);
	    	 if (folder.exists()) {
	    		 File[] listOfFiles = folder.listFiles(); 
		    	 
		    	  for (int i = 0; i < listOfFiles.length; i++) 
		    	  {
		    	 
		    	   if (listOfFiles[i].isFile()) 
		    	   {
		    		   String file = listOfFiles[i].getName();
		    	       if (file.endsWith(".json") || file.endsWith(".JSON"))
		    	       {
		    	    	   try {
		    	    		   String fileNameWithOutExt = file.replaceFirst("[.][^.]+$", "");
		    	    		   String output = this.readFile(siteConfigDir+"/"+file);
		    	    		   JSONObject j = new JSONObject(output);
		    	    		   ret = ret + ",\n\t'"+fileNameWithOutExt+"': "+output;
		    	    		}
		    	    		catch(JSONException ex) {
		    	    			System.err.println("maqetta.server.orion.command.GetInitializationInfo "+siteConfigDir+"/"+file + " not valid json");
		    	    		} 
		    	    	   catch (IOException e) {
		    	    		   System.err.println("maqetta.server.orion.command.GetInitializationInfo "+siteConfigDir+"/"+file + " error reading file");
								e.printStackTrace();
							}
		    	        }
		    	     }
		    	  }
	
	    	 } else {
	    		 System.err.println("maqetta.server.orion.command.GetInitializationInfo " + IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY + " : " + siteConfigDir + " Does not exist");
	    	 }
    	}
    	catch (Exception e) {
    		System.err.println("maqetta.server.orion.command.GetInitializationInfo " + IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY + " : " + siteConfigDir + " Error accessing");
    		e.printStackTrace();
    	}
    	  this.siteConigJson = ret;
    	  return this.siteConigJson;
    }
    
    private String readFile(String path) throws IOException {
    	  FileInputStream stream = new FileInputStream(new File(path));
    	  try {
    	    FileChannel fc = stream.getChannel();
    	    MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size());
    	    /* Instead of using default, pass in a decoder. */
    	    return Charset.defaultCharset().decode(bb).toString();
    	  }
    	  finally {
    	    stream.close();
    	  }
    	}

}
