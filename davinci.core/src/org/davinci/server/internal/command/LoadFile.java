package org.davinci.server.internal.command;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;

public class LoadFile extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		String path=req.getParameter("path");
		
		IVResource file = user.getResource(path);
		
		if (file.exists()){
			InputStream is=file.getInputStreem();
			transferStreams(is, resp.getOutputStream(), true);
		}else{
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
		
	}



}
