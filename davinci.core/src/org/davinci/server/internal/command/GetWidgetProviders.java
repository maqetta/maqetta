package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;

public class GetWidgetProviders extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		LibraryManager libraryManager = ServerManager.getServerManger().getLibraryManager();
		
		//responseString=libraryManager.metadataJSON();
	}

}
