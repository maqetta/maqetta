package maqetta.server.orion.user;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import maqetta.core.server.user.User;
import maqetta.core.server.user.manager.UserManagerImpl;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.configurator.ConfiguratorActivator;
import org.eclipse.orion.server.core.authentication.IAuthenticationService;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;

public class OrionUserManager extends UserManagerImpl {

 
    private IAuthenticationService authenticationService;
	private Properties authProperties;


    public OrionUserManager() {
    	super();
        authenticationService = ConfiguratorActivator.getDefault().getAuthService();
    }

   

    protected boolean checkUserExists(String userName) {
    
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(userName);
		return result!=null;
    
    }
    public IUser newUser(IPerson person, IStorage baseDirectory) {

     	IUser user =  new OrionUser(person);
     	if(init(person.getUserName())){
     		user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
     	}
     	return user;
    }
    public IUser addUser(String userName, String password, String email) throws UserException {

        if (checkUserExists(userName)) {
            throw new UserException(UserException.ALREADY_EXISTS);
        }

        if (this.maxUsers > 0 && this.usersCount >= this.maxUsers) {
            throw new UserException(UserException.MAX_USERS);
        }
        IPerson person = this.personManager.addPerson(userName, password, email);
        if (person != null) {

            IUser user = newUser(person,null);
          
            //File userDir = user.getUserDirectory();
            //userDir.mkdir();
            //File settingsDir = user.getSettingsDirectory();
           // settingsDir.mkdir();
            IVResource project = user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
            
            this.usersCount++;
            return user;
        }
        return null;
    }

    /* sets the init flag on the user. returns 'true' if this happened (so that we can setup any user project files */
    private boolean init(String userName){
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(userName);
        	// read it with BufferedReader
    	boolean wasInit = result.getBoolean("maqettaInit", false);
     
    	if(!wasInit){
    		result.putBoolean("maqettaInit", true);
    	}
    	return !wasInit;
    }
    
	public IUser getUser(HttpServletRequest req) {
		String user = null;
		try {
			user = authenticationService.getAuthenticatedUser(req, null, authProperties);
			if(user!=null)
				this.personManager.addPerson(user, "", "");
			
		} catch (IOException e) {
			e.printStackTrace();
		}catch (UserException e) {
			e.printStackTrace();
		}
		if(user==null) return null;
		
		return getUser(user);
	
	}
}
