package maqetta.core.server.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class RemoveUser extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        String name = req.getParameter("userName");
        
      
        /* this command can only be called from 127.0.0.1, sorry hackers */
        if(!Command.isLocalRequest(req)) return; // FIXME: this test is not working as intended.

        try {
            ServerManager.getServerManager().getUserManager().removeUser(name);
            this.responseString = "OK";
            HttpSession session = req.getSession(false);
            if (session != null) {
                if (user != null && user.getUserID().equals(name)) {
                    /*
                     * we deleted a logged-in user. so, log them out
                     */
                    session.invalidate();
                }
            }
        } catch (UserException e) {
            this.responseString = e.getMessage();
        }
    }
}
