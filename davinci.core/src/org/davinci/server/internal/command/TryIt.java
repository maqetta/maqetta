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

public class TryIt extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException {

        String email = "guest@maqetta.org";
        String name = "";
        String password = "guest";

        // generate a unique temporary guest user name
        name = IDavinciServerConstants.GUEST_USER_PREFIX + String.valueOf(System.currentTimeMillis());

        try {
            user = ServerManager.getServerManger().getUserManager().addUser(name, password, email);

            // this effectively logs the guest into the session
            HttpSession session = req.getSession(true);
            session.setAttribute(IDavinciServerConstants.SESSION_USER, user);

            // redirect to designer
            String portSpec = req.getServerPort() == 80 ? "" : ':' + String.valueOf(req.getServerPort());
            String redirectURL = "http://" + req.getServerName() + portSpec + "/maqetta/";
            resp.sendRedirect(redirectURL);

        } catch (UserException e) {
            this.responseString = e.getReason();
        }

    }

}
