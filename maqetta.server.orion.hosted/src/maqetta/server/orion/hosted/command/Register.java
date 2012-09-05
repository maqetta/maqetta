package maqetta.server.orion.hosted.command;

import java.io.IOException;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.review.Utils;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

public class Register  extends Command {

    private static Random generator = new Random();
	private static String EMAIL_FIELD = "SIGNUP_EMAIL";
	private static String EMAIL_TEMPLATE = "Please click this link to activate your maqetta.org user account:<br><br>";
	
	class EmailRunnable implements Runnable {
		String emailAdd = null;
		String message = null;
		String from = null;
		EmailRunnable(String emailAdd, String message, String from){
			this.emailAdd = emailAdd;
			this.message = message;
			this.from = from;
		}
	    public void run() {
	    	ServerManager.getServerManger().sendEmail(this.from, emailAdd, "Maqetta.org user activation", message);
	    	System.out.println("---------------\nSending email:\n"+message );
	    }
	}
	
    public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException {
    	
    	String emailAdd = req.getParameter("login");
    	String randomToken = System.currentTimeMillis() + "_" + generator.nextInt();
    	
    	String requestUrl = req.getRequestURL().toString();
    	
    	int offset = (requestUrl.indexOf("https://") > -1 ? "https://".length():"http://".length() );
    	
    	String host = requestUrl.substring(0, requestUrl.indexOf('/', offset));
    	String authLink = host + "/mixloginstatic/LoginWindow.html?login=" + emailAdd + "&loginTolken=" + randomToken + "&redirect=../maqetta/cmd/migrate";
    	
    	String domain = host.substring( offset);
    	String emailAddy = Utils.getCommonNotificationId();
    	if(domain.indexOf(":") > -1)
    		domain = domain.substring(0,domain.indexOf(":"));
    	
    	if(emailAddy ==null)
    		emailAddy = "admin@" + domain;
    	
    	
    	
    	IEclipsePreferences signupTokens = new OrionScope().getNode("signup"); //$NON-NLS-1$
    	
    	/* index by the token for easy retrival */
		IEclipsePreferences result = (IEclipsePreferences) signupTokens.node(randomToken);
    	/* store the email address with the token */
		result.put(Register.EMAIL_FIELD, emailAdd);
		
		sendEmail(emailAdd, EMAIL_TEMPLATE + authLink, emailAddy);
	
        
    	this.responseString = "OK";
      }
    
    private void sendEmail(String emailAdd, String htmlContent, String from){
    	(new Thread(new EmailRunnable(emailAdd, htmlContent, from))).start();
    }
}