package maqetta.server.orion.user;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import maqetta.core.server.user.manager.UserManagerImpl;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.configurator.ConfiguratorActivator;
import org.eclipse.orion.server.core.authentication.IAuthenticationService;
import org.eclipse.orion.server.core.users.OrionScope;

public class OrionUserManagerImpl extends UserManagerImpl {

 
    private IAuthenticationService authenticationService;
	private Properties authProperties;


    public OrionUserManagerImpl() {
    	super();
        authenticationService = ConfiguratorActivator.getDefault().getAuthService();
    }

   

    protected boolean checkUserExists(String userName) {
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(userName);
		return result!=null;
    }

   
	public IUser getUser(HttpServletRequest req) {
		// TODO Auto-generated method stub
		String user = null;
		try {
			user = authenticationService.getAuthenticatedUser(req, null, authProperties);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getUser(user);
	
	}




}
