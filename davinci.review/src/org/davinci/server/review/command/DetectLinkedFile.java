package org.davinci.server.review.command;

import java.io.File;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.User;

public class DetectLinkedFile extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		
		String base = System.getProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
		String filePath = base + "/" + req.getParameter("fileName");
		
		File file = new File(filePath);
		//System.out.println(filePath + ":" + file.exists());
		this.responseString = String.valueOf(file.exists());
	}

}
