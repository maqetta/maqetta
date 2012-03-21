package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class Login extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String name = req.getParameter("userName");
        String password = req.getParameter("password");
        user = ServerManager.getServerManger().getUserManager().login(name, password);
        if (user != null) {
        	storeUserInSession(req, resp, user);
        } else {
            user = ServerManager.getServerManger().getUserManager().getUser(name);
            if (user == null) {
                String pluginName = req.getParameter("plugin");
            	if (pluginName == "joomla") { // auto-create user to work around joomla user synchronization issues.
                    String email = req.getParameter("email");
                    try {
						user = ServerManager.getServerManger().getUserManager().addUser(name, password, email);
					} catch ( UserException e ) {
						resp.sendError(HttpServletResponse.SC_FORBIDDEN, e.getReason());
						return;
					}
                    user = ServerManager.getServerManger().getUserManager().login(name, password);
					if (user != null) {
			        	storeUserInSession(req, resp, user);
					} else {
	                	resp.sendError(HttpServletResponse.SC_FORBIDDEN, "User not known");
					}
            	} else {
                	resp.sendError(HttpServletResponse.SC_FORBIDDEN, "User not known");
            	}
            } else {
                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Incorrect username/password");
            }
        }
    }
    
    private void storeUserInSession(HttpServletRequest req, HttpServletResponse resp, IUser user) {
        this.responseString = "OK";
        HttpSession session = req.getSession(true);
        session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
        session.setMaxInactiveInterval(IDavinciServerConstants.SESSION_TIMEOUT);
        Cookie k = new Cookie(IDavinciServerConstants.SESSION_USER, user != null ? user.getUserName() : null);
		k.setPath("/maqetta");
		resp.addCookie(k);
    }
}
