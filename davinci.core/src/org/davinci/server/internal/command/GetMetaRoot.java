package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class GetMetaRoot extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {
		Library[] libs = ServerManager.getServerManger().getLibraryManager().getAllLibraries();
		String libraryID=req.getParameter("id");
		String libraryVersion=req.getParameter("version");
		
		for(int i =0;i<libs.length;i++)
			if(libs[i].getID().equals(libraryID) && libs[i].getVersion().equals(libraryVersion)){
				this.responseString= libs[i].getMetadataPath();
				return;
			}
		
		

	}

}
