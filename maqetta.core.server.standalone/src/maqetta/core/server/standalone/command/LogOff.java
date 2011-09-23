package maqetta.core.server.standalone.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;



import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class LogOff extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
        if (user.getUserName().startsWith(IDavinciServerConstants.GUEST_USER_PREFIX)) {
            try {
                ServerManager.getServerManger().getUserManager().removeUser(user.getUserName());
            } catch (UserException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        req.getSession().invalidate();
        responseString = "OK";
    }

}
