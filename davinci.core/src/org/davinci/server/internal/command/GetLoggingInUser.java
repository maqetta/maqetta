package org.davinci.server.internal.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.User;

public class GetLoggingInUser extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {
		String loggingInUser=(String)req.getSession().getAttribute(IDavinciServerConstants.LOGGING_IN_USER);
		if (loggingInUser!=null && loggingInUser.length()>0)
			this.responseString=loggingInUser;
		else
			this.responseString="";
	}

}
