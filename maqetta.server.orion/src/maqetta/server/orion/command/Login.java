package maqetta.server.orion.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class Login extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {

        String name = req.getParameter("userName");
        String password = req.getParameter("password");
        String authType = req.getParameter("authType");

        ServerManager serverManager = ServerManager.getServerManager();

        if (authType != null) {
        	String authName = serverManager.getDavinciProperty("orion.auth.name");
        	if (authName == null) {
        		authName = "mixloginstatic";
        	}
        	this.responseString = authName;
        } else {
        	try {
				IUserManager userManager = serverManager.getUserManager();
				user = userManager.login(name, password);
		        if (user != null) {
		            String redirect = (String) req.getSession().getAttribute(IDavinciServerConstants.REDIRECT_TO);
		            req.getSession().removeAttribute(IDavinciServerConstants.REDIRECT_TO); // burn after reading
		            this.responseString = (redirect != null) ? redirect : "OK";
		            HttpSession session = req.getSession(true);
		            session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
		            session.setMaxInactiveInterval(IDavinciServerConstants.SESSION_TIMEOUT);
		        } else {
		            user = userManager.getUser(name);
		            if (user == null) {
		                resp.sendError(HttpServletResponse.SC_FORBIDDEN, "User not known");
		            } else {
		                resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Incorrect username/password");
		            }
		        }
        	} catch (UserException e) {
        		throw new RuntimeException(e);
        	}
        }
    }
}
