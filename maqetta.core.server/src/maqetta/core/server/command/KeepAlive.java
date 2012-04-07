package maqetta.core.server.command;

import java.io.IOException;
import java.util.Date;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.user.IUser;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class KeepAlive extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
           
            HttpSession session = req.getSession(true);
            this.responseString =  "{MaxInactiveInterval:" + session.getMaxInactiveInterval() +"}";
           //Date d = new Date();
           //System.err.println("Poll: " + d);
      
    }
}
