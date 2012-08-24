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
import org.maqetta.server.ServerManager;

public class OrionUserManager extends UserManagerImpl {

 
    private IAuthenticationService authenticationService;
	private Properties authProperties;


    public OrionUserManager() {
    	ServerManager serverManger = ServerManager.getServerManger();
    	this.personManager = ServerManager.getServerManger().getPersonManager();
        

        String maxUsersStr = serverManger.getDavinciProperty(IDavinciServerConstants.MAX_USERS);
        if (maxUsersStr != null && maxUsersStr.length() > 0) {
            this.maxUsers = Integer.valueOf(maxUsersStr).intValue();
        }
    }
    private IAuthenticationService getAuthenticationService(){
    	if(authenticationService==null){
    		authenticationService = ConfiguratorActivator.getDefault().getAuthService();
    	}
    	return authenticationService;
    }
   protected void initWorkspace(){
	   // noop for orion
   }

    protected boolean checkUserExists(String userName) {
    
    	IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(userName);
		return result!=null;
    
    }
    
    public IUser getUser(String userName) {

        // IUser user = (IUser) users.get(userName);
         if (ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
             return this.getSingleUser();
         }
      
         if (this.checkUserExists(userName)) {
             IPerson person = this.personManager.getPerson(userName);
             return newUser(person, null);
             
         }
         return null;

     }
    public IUser newUser(IPerson person, IStorage baseDirectory) {

     	IUser user =  new OrionUser(person);
     	if(init(person.getUserID())){
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
}
