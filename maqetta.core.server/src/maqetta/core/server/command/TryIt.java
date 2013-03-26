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

public class TryIt extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {

        String email = "guest@maqetta.org";
        String name = "";
        String password = "guest";

        // generate a unique temporary guest user name
        name = IDavinciServerConstants.GUEST_USER_PREFIX + String.valueOf(System.currentTimeMillis());

        try {
            user = ServerManager.getServerManager().getUserManager().addUser(name, password, email);

            // this effectively logs the guest into the session
            HttpSession session = req.getSession(true);
            session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
            session.setMaxInactiveInterval(IDavinciServerConstants.SESSION_TIMEOUT);
                    // redirect to designer
            String portSpec = req.getServerPort() == 80 ? "" : ':' + String.valueOf(req.getServerPort());
            String redirectURL = "http://" + req.getServerName() + portSpec + "/maqetta/";
            resp.sendRedirect(redirectURL);

        } catch (UserException e) {
            this.responseString = e.getMessage();
        }

    }

}
