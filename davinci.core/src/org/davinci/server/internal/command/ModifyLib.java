package org.davinci.server.internal.command;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONReader;
import org.davinci.server.util.JSONWriter;

public class ModifyLib  extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
		
		String libJson = req.getParameter("libChanges");
		List list = (List)JSONReader.read(libJson);
		for(int i=0;i<list.size();i++){
			HashMap libEntry = (HashMap)list.get(i);
			String id = (String)libEntry.get("id");
			String version = (String)libEntry.get("version");
			Boolean installed = (Boolean)libEntry.get("installed");
			String path = (String)libEntry.get("path");
			String oldPath = (String)libEntry.get("oldPath");
			
			if(installed!=null){
				// add or remove the library
				this.updateLib(user, id, version,installed);// Boolean.parseBoolean(installedString));
			}
			if(path!=null){
				// update library root
				this.changeLibraryRoot(user,id, version, path);
			}
		}
	
		responseString="OK";
	}
	public void changeLibraryRoot(User user, String id, String version, String path){
		user.modifyLibrary(id, version, path);
	}
	
	public void updateLib(User user, String id, String version, boolean installed){
		user.modifyLibrary(id, version, installed);
	}
	
}
