package maqetta.core.server.command;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;
import org.maqetta.server.Validator;

public class Register extends Command {

    @Override
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	// SECURITY, VALIDATION
    	//   'userName': checked with Validator.isUserName()
    	//   'password': N/A
    	//   'email': checked with Validator.isEmail()

        String name = req.getParameter("userName");
        String password = req.getParameter("password");
        String email = req.getParameter("email");
        
        if (!Validator.isUserName(name) || !Validator.isEmail(email)) {
			this.responseString = "INVALID USER NAME";
			return;
        }

        try {
            user = ServerManager.getServerManager().getUserManager().addUser(name, password, email);
            this.responseString = "OK";
            HttpSession session = req.getSession(true);
            session.setAttribute(IDavinciServerConstants.SESSION_USER, user);
        } catch (UserException e) {
            this.responseString = e.getMessage();
        }

    }

}
