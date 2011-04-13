package org.davinci.server.internal.command;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.Resource;
import org.davinci.server.VResourceUtils;
import org.davinci.server.user.User;

public class Copy extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		String src=req.getParameter("source");
		String des = req.getParameter("dest");
		boolean recurse = Boolean.parseBoolean(req.getParameter("recurse"));
		
		IVResource source = user.getResource((String)src);
		IVResource newResource = user.createUserFile(des);
		
		if(source.isDirectory()){
			newResource.mkdir();
			VResourceUtils.copyDirectory(source,newResource, recurse);
		}else{
			InputStream in = source.getInputStreem();
			OutputStream out = source.getOutputStreem();
			VResourceUtils.copyFile(source,newResource);
		}
		this.responseString="ok";
	}
	
}
