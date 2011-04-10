package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.user.UserException;

public class Register extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String name=req.getParameter("userName");
		String password=req.getParameter("password");
		String email=req.getParameter("email");
	
		try {
			 user=ServerManager.getServerManger().getUserManager().addUser(name, password, email);
			this.responseString="OK";
			HttpSession session = req.getSession(true);
			session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
		} catch (UserException e) {
			this.responseString = e.getReason();
		}

	}

}
