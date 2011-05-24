package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class DeleteResource extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String path=req.getParameter("path");
		IVResource file = user.getResource(path);
		if (file.isDirectory())
			responseString=deleteDir(file);
		else{
			if (file.delete())
				responseString="OK";
			else
				responseString="Problem deleting file";
			
		}
	}

	private String deleteDir(IVResource file) {
		String response="OK";
		IVResource[] files = file.listFiles();
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory())
			{
				response=deleteDir(files[i]);
				if (!response.equals("OK"))
					return response;
			}
			else
			{
				if (files[i].delete())
					responseString="OK";
				else
					return "Problem deleting file";
				
			}
			
		}
		if (file.delete())
			return "OK";
		else
			return "Problem deleting directory";
	
	}

}
