package maqetta.core.server.user.manager;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import maqetta.core.server.user.User;
import maqetta.core.server.util.VResourceUtils;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.UserException;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;

public class UserManagerImpl implements IUserManager {

	static final private Logger theLogger = Logger.getLogger(UserManagerImpl.class.getName());

	private static IUser localUser;
    protected static UserManagerImpl theUserManager;
  //  protected HashMap                users    = new HashMap();
    protected IStorage            baseDirectory;

    protected IPersonManager          personManager;
    protected int                    maxUsers = 0;
    protected int            usersCount;


    public UserManagerImpl() {
    	ServerManager serverManger = ServerManager.getServerManager();

    	initWorkspace();
    	
        String maxUsersStr = serverManger.getDavinciProperty(IDavinciServerConstants.MAX_USERS);
        if (maxUsersStr != null && maxUsersStr.length() > 0) {
            this.maxUsers = Integer.valueOf(maxUsersStr).intValue();
        }

        this.personManager = ServerManager.getServerManager().getPersonManager();

    }

    protected void initWorkspace(){
    	this.baseDirectory= ServerManager.getServerManager().getBaseDirectory();
    	this.usersCount = this.baseDirectory.list().length;

    	theLogger.info("Setting [user space] to: " + baseDirectory.getAbsolutePath());
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.davinci.server.user.impl.UserManager#hasPermisions(org.davinci.server
     * .user.User, org.davinci.server.user.User, java.lang.String)
     */
    public boolean hasPermisions(IUser owner, IUser requester, String resource) {
        /*
         * deny permision to direct access of a users workspace
         */
        return resource != "";
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#getUser(java.lang.String)
     * 
     */
    public IUser newUser(IPerson person, IStorage baseDirectory) throws UserException, IOException {
    	 return new User(person, baseDirectory);
    }
    
    public IUser getUser(String userName) throws UserException, IOException {

       // IUser user = (IUser) users.get(userName);
        if (ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
            return this.getSingleUser();
        }
        if (this.checkUserExists(userName)) {
            IPerson person = this.personManager.getPerson(userName);
            return newUser(person, this.baseDirectory.newInstance(this.baseDirectory, userName));
        }
        return null;
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#addUser(java.lang.String,
     * java.lang.String, java.lang.String)
     */
    public IUser addUser(String userName, String password, String email) throws UserException, IOException {

        if (checkUserExists(userName)) {
            throw new UserException(UserException.ALREADY_EXISTS);
        }

        if (this.maxUsers > 0 && this.usersCount >= this.maxUsers) {
            throw new UserException(UserException.MAX_USERS);
        }
        IPerson person = this.personManager.addPerson(userName, password, email);
        if (person != null) {
            IUser user = newUser(person, this.baseDirectory.newInstance(this.baseDirectory, userName));
          //  users.put(userName, user);
            //File userDir = user.getUserDirectory();
            //userDir.mkdir();
            //File settingsDir = user.getSettingsDirectory();
           // settingsDir.mkdir();
            try {
				user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
			} catch (IOException e) {
				throw new UserException(e);
			}
            
            this.usersCount++;
            return user;
        }
        return null;
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.davinci.server.user.impl.UserManager#removeUser(java.lang.String)
     */
    public void removeUser(String userName) throws UserException, IOException {

        if (!checkUserExists(userName)) {
            return;
        }
        /*
         * would call this.personManager.removePerson(userName) here
         */
        IStorage userDir = this.baseDirectory.newInstance(this.baseDirectory, userName);
        VResourceUtils.deleteDir(userDir);
     
        this.usersCount--;
    }


    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#login(java.lang.String,
     * java.lang.String)
     */
    public IUser login(String userName, String password) throws UserException, IOException {
        if (!checkUserExists(userName)) {
            return null;
        }
        IPerson person = this.personManager.login(userName, password);
        if (person != null) {
			return newUser(person, this.baseDirectory.newInstance(this.baseDirectory, userName));
        }
        return null;
    }

    protected boolean checkUserExists(String userName) {
        IStorage userDir = this.baseDirectory.newInstance(this.baseDirectory, userName);
        return userDir.exists();
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.davinci.server.user.impl.UserManager#isValidUser(java.lang.String)
     */
    public boolean isValidUser(String userName) throws UserException, IOException {
        if (ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
            return true;
        }
        IUser user = getUser(userName);
        return user != null;
    }

	public boolean isValidUserByEmail(String email) throws UserException {
		throw new Error("NOT IMPLEMENTED");
//		return isValidUser(email);
	}

    public IUser getSingleUser() {
    	if (localUser == null) {
    		try {
		    	class LocalPerson implements IPerson {
		            public String getEmail() {
		                return "";
		            }
		            public String getUserID() {
		                return IDavinciServerConstants.LOCAL_INSTALL_USER;
		            }
		            public String getDisplayName() {
	            		return "";
	            	}
		        }

	    		IStorage userDir = this.baseDirectory;
	        	userDir.mkdir();

	        	localUser = new User(new LocalPerson(), userDir);
	       		IStorage settingsDir = this.baseDirectory.newInstance(userDir, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
	        	if (!settingsDir.exists()) {
	           		settingsDir.mkdir();
	            	localUser.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
	        	}
    		} catch (IOException e) {
    			return null; //TODO
    		}
    	}
    	return localUser;
    }

	public IUser getUser(HttpServletRequest req) {
		if (ServerManager.LOCAL_INSTALL) {
			return this.getSingleUser();
		}
		return (IUser) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
	}

}
