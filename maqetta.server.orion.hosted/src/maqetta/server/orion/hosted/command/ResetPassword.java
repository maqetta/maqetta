package maqetta.server.orion.hosted.command;

import java.io.IOException;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.review.Utils;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.users.OrionScope;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.UserServiceHelper;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;
import org.osgi.service.prefs.BackingStoreException;

public class ResetPassword extends Command {

	   private static Random generator = new Random();
	   private static String EMAIL_FIELD = "RESET_EMAIL";
	   private static String EMAIL_TEMPLATE = "Please click this link to reset your maqetta.org user account:<br><br>";
		
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
	    	boolean requestReset = "reset".equals(req.getParameter("action"));
	    	boolean changePassword = "change".equals(req.getParameter("action"));
	    	String randomToken = req.getParameter("resetTolken");
	    	String newPassword = req.getParameter("password");
	    	
	    	if(!ServerManager.getServerManger().getUserManager().isValidUser(emailAdd, true)){
	    		this.responseString = "NO_USER";
	    		return;
	    	}
	    	
	    	/* user requested password reset */
	    	if(requestReset){
	    		randomToken = System.currentTimeMillis() + "_" + generator.nextInt();
		    	String requestUrl = req.getRequestURL().toString();
		    	int offset = (requestUrl.indexOf("https://") > -1 ? "https://".length():"http://".length() );
		    	
		    	String host = requestUrl.substring(0, requestUrl.indexOf('/', offset));
		    	String authLink = host + "/mixloginstatic/LoginWindow.html?login=" + emailAdd + "&resetTolken=" + randomToken + "&redirect=../maqetta/";
		    	
		    	IEclipsePreferences signupTokens = new OrionScope().getNode("resetPassword"); //$NON-NLS-1$
		    	
		    	/* index by the token for easy retrival */
				IEclipsePreferences result = (IEclipsePreferences) signupTokens.node(randomToken);
		    	/* store the email address with the token */
				result.put(ResetPassword.EMAIL_FIELD, emailAdd);
				try {
					//flush directly at root level to workaround equinox bug 389754.
					result.parent().flush();
				} catch (BackingStoreException e) {
					LogHelper.log(e);
				}

				sendEmail(emailAdd, EMAIL_TEMPLATE + authLink, Utils.getCommonNotificationId(req));
	    	}else if(changePassword){
	    		/* reset link followed, now actually reset the password */
	    		IEclipsePreferences signupTokens = new OrionScope().getNode("resetPassword"); //$NON-NLS-1$
		    	
		    	/* index by the token for easy retrival */
				IEclipsePreferences result = (IEclipsePreferences) signupTokens.node(randomToken);
		    	/* store the email address with the token */
				String email = result.get(ResetPassword.EMAIL_FIELD, null);
				if(emailAdd!=null && emailAdd.equals(email)){
					IOrionCredentialsService userAdmin = UserServiceHelper.getDefault().getUserStore();
			   	 	org.eclipse.orion.server.useradmin.User orionUser = (org.eclipse.orion.server.useradmin.User) userAdmin.getUser("login", emailAdd);
			   	 	orionUser.setPassword(newPassword);
			   	 	userAdmin.updateUser(orionUser.getUid(), orionUser);
				}else{
					resp.sendError(HttpServletResponse.SC_FORBIDDEN);
				}
	    	}
	        
	    	this.responseString = "OK";
	      }
	    
	    private void sendEmail(String emailAdd, String htmlContent, String from){
	    	(new Thread(new EmailRunnable(emailAdd, htmlContent, from))).start();
	    }
    
  
}