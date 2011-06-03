package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.Resource;
import org.davinci.server.user.User;

public class ListFiles extends Command {
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String path = req.getParameter("path");
		IVResource[] listDir = user.listFiles(path);
		this.responseString = Resource.vRsourcesToJson(listDir, false);
	}
}
