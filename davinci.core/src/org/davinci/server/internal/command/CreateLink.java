package org.davinci.server.internal.command;

import java.io.File;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.internal.Links;
import org.davinci.server.user.User;

public class CreateLink extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String path=req.getParameter("path");
		String localPath=req.getParameter("localPath");
		IVResource newFile = user.getResource(path);
		if (newFile.exists())
		{
			responseString="File or Folder already exists";
			return;
		}
        if (path.startsWith("./"))
        	path=path.substring(2);
		Links links=user.getLinks();
		if (!links.addLink(path, localPath, Links.SYSTEM_PATH))
			responseString="Link already exists";
		else
			responseString="OK";
			
	}

}
