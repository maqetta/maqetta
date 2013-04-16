package maqetta.server.orion.user;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import maqetta.core.server.user.manager.UserManagerImpl;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.configurator.ConfiguratorActivator;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.authentication.IAuthenticationService;
import org.eclipse.orion.server.core.users.OrionScope;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;
import org.osgi.service.prefs.BackingStoreException;

public class OrionUserManager extends UserManagerImpl {

	private IAuthenticationService authenticationService;
	private Properties authProperties;

    public OrionUserManager() {
    	ServerManager serverManger = ServerManager.getServerManager();
    	this.personManager = ServerManager.getServerManager().getPersonManager();
        

        String maxUsersStr = serverManger.getDavinciProperty(IDavinciServerConstants.MAX_USERS);
        if (maxUsersStr != null && maxUsersStr.length() > 0) {
            this.maxUsers = Integer.valueOf(maxUsersStr).intValue();
        }
    }

    private void assertValidUserId(String uid) {
    	if (uid.indexOf("@") != -1) {
    		throw new Error("Invalid user ID");
    	}
    }

    private IAuthenticationService getAuthenticationService(){
    	if(authenticationService==null){
    		authenticationService = ConfiguratorActivator.getDefault().getAuthService();
    	}
    	return authenticationService;
    }

	protected void initWorkspace() {
		// noop for orion
	}

	protected boolean checkUserExists(String userName) {
		return OrionPersonManager.getOrionUser(userName) != null;
	}

	protected boolean checkUserExistsByEmail(String email) {
		return OrionPersonManager.getOrionUserByEmail(email) != null;
	}

	public IUser getUser(String userName) throws UserException {
		assertValidUserId(userName);

		if (ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
			return this.getSingleUser();
		}

		if (this.checkUserExists(userName)) {
			IPerson person = this.personManager.getPerson(userName);
			return newUser(person, null);
		}
		return null;
	}

    public IUser getUserByEmail(String email) throws UserException {
         if (checkUserExistsByEmail(email)) {
             IPerson person = this.personManager.getPersonByEmail(email);
             return newUser(person, null);
         }
         return null;
    }

    public IUser newUser(IPerson person, IStorage baseDirectory) throws UserException {
     	IUser user;
		try {
			user = new OrionUser(person);
		} catch (CoreException e) {
			throw new UserException(e);
		}
     	if(init(person.getUserID())){
     		try {
				user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
			} catch (IOException e) {
				throw new UserException(e);
			}
     	}
     	return user;
    }

    public IUser addUser(String userName, String password, String email) throws UserException, IOException {
		assertValidUserId(userName);

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
            user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
            this.usersCount++;
            return user;
        }
        return null;
    }

    /* sets the init flag on the user. returns 'true' if this happened (so that we can setup any user project files */
    private boolean init(String userName){
		assertValidUserId(userName);

		IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(userName);
        	// read it with BufferedReader
    	boolean wasInit = result.getBoolean("maqettaInit", false);
     
    	if(!wasInit){
    		result.putBoolean("maqettaInit", true);
    		try {
    			//flush directly at root level to workaround equinox bug 389754.
    			result.parent().flush();
    		} catch (BackingStoreException e) {
    			LogHelper.log(e);
    		}
    	}
    	return !wasInit;
    }
    
	public IUser getUser(HttpServletRequest req) {
		String user = null;
		try {
			user = getAuthenticationService().getAuthenticatedUser(req, null, authProperties);
			if(user!=null){
				return newUser(this.personManager.addPerson(user, null, null), null);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}catch (UserException e) {
			e.printStackTrace();
		}
		
		return null;
	}

    @Override
	public boolean isValidUserByEmail(String email) throws UserException {
        IUser user = getUserByEmail(email);
        return user != null;
	}
}
