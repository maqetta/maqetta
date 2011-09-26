package maqetta.core.server.orion.command;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class Register extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String name = req.getParameter("userName");
        String password = req.getParameter("password");
        String email = req.getParameter("email");

        try {
            user = ServerManager.getServerManger().getUserManager().addUser(name, password, email);
            this.responseString = "OK";
            HttpSession session = req.getSession(true);
            session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
        } catch (UserException e) {
            this.responseString = e.getReason();
        }

    }

}
