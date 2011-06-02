package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.user.UserException;

public class RemoveUser extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String name = req.getParameter("userName");

		try {
			ServerManager.getServerManger().getUserManager().removeUser(name);
			this.responseString = "OK";
			HttpSession session = req.getSession(false);
			if (session != null) {
				if (user.getUserName().equals(name)) { // we deleted a logged-in
														// user so log them out
					session.invalidate();
				}
			}
		} catch (UserException e) {
			this.responseString = e.getReason();
		}
	}
}
