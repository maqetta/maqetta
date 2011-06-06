package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.user.User;
import org.davinci.server.user.UserException;

public class LogOff extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		if (user.getUserName().startsWith(
				IDavinciServerConstants.GUEST_USER_PREFIX)) {
			try {
				ServerManager.getServerManger().getUserManager()
						.removeUser(user.getUserName());
			} catch (UserException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		req.getSession().invalidate();
		responseString = "OK";
	}

}
