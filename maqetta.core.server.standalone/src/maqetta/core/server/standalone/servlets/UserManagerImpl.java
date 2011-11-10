package maqetta.core.server.standalone.servlets;

import java.io.File;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import maqetta.core.server.standalone.user.User;
import org.davinci.server.user.UserException;

import org.davinci.server.user.IUser;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.IPerson;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VResourceUtils;

public class UserManagerImpl implements IUserManager {

    static UserManagerImpl theUserManager;
    HashMap                users    = new HashMap();
    public File            baseDirectory;

    IPersonManager          personManager;
    int                    maxUsers = 0;
    private int            usersCount;


    public UserManagerImpl() {
    	ServerManager serverManger = ServerManager.getServerManger();
    	try{
        	this.baseDirectory= ServerManager.getServerManger().getBaseDirectory();
        	this.usersCount = this.baseDirectory.list().length;
    	}catch(Exception ex){
    		System.out.println("FATAL ERROR Starting maqetta: " + ex);
    		
    	}
        if (ServerManager.DEBUG_IO_TO_CONSOLE) {
            System.out.println("\nSetting [user space] to: " + baseDirectory.getAbsolutePath());
        }
        System.out.println("\nSetting [user space] to: " + baseDirectory.getAbsolutePath());

        String maxUsersStr = serverManger.getDavinciProperty(IDavinciServerConstants.MAX_USERS);
        if (maxUsersStr != null && maxUsersStr.length() > 0) {
            this.maxUsers = Integer.valueOf(maxUsersStr).intValue();
        }

        this.personManager = ServerManager.getServerManger().getPersonManager();

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
        return (resource != "");
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#getUser(java.lang.String)
     * 
     */
    public IUser newUser(IPerson person, File baseDirectory) {
    	 return new User(person, baseDirectory);
    }
    
    public IUser getUser(String userName) {

        IUser user = (IUser) users.get(userName);
        if (user == null && ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
            return this.getSingleUser();
        }
        if (user == null && this.checkUserExists(userName)) {
            IPerson person = this.personManager.getPerson(userName);
            user = newUser(person, new File(this.baseDirectory, userName));
        }
        return user;

    }

    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#addUser(java.lang.String,
     * java.lang.String, java.lang.String)
     */
    public IUser addUser(String userName, String password, String email) throws UserException {

        if (checkUserExists(userName)) {
            throw new UserException(UserException.ALREADY_EXISTS);
        }

        if (this.maxUsers > 0 && this.usersCount >= this.maxUsers) {
            throw new UserException(UserException.MAX_USERS);
        }
        IPerson person = this.personManager.addPerson(userName, password, email);
        if (person != null) {

            IUser user = new User(person, new File(this.baseDirectory, userName));
            users.put(userName, user);
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

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.davinci.server.user.impl.UserManager#removeUser(java.lang.String)
     */
    public void removeUser(String userName) throws UserException {

        if (!checkUserExists(userName)) {
            return;
        }
        /*
         * would call this.personManager.removePerson(userName) here
         */
        File userDir = new File(this.baseDirectory, userName);
        VResourceUtils.deleteDir(userDir);
        users.remove(userName);
        this.usersCount--;
    }


    /*
     * (non-Javadoc)
     * 
     * @see org.davinci.server.user.impl.UserManager#login(java.lang.String,
     * java.lang.String)
     */
    public IUser login(String userName, String password) {
        if (!checkUserExists(userName)) {
            return null;
        }
        IPerson person = this.personManager.login(userName, password);
        if (person != null) {
            return new User(person, new File(this.baseDirectory, userName));
        }
        return null;
    }

    private boolean checkUserExists(String userName) {
        File userDir = new File(this.baseDirectory, userName);
        return userDir.exists();
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * org.davinci.server.user.impl.UserManager#isValidUser(java.lang.String)
     */
    public boolean isValidUser(String userName) {
        if (ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equals(userName)) {
            return true;
        }
        IUser user = getUser(userName);
        return user != null;
    }

    public IUser getSingleUser() {
        class LocalPerson implements IPerson {
            public String getEmail() {
                return "";
            }

            public String getUserName() {
                return IDavinciServerConstants.LOCAL_INSTALL_USER;
            }
        }
        File userDir = this.baseDirectory;

        userDir.mkdir();
        IUser user =  new User(new LocalPerson(), userDir);
        File settingsDir = new File(userDir, IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
        if (!settingsDir.exists()) {
            settingsDir.mkdir();
            IVResource project = user.createProject(IDavinciServerConstants.DEFAULT_PROJECT);
        }
       return user;

    }

	public IUser getUser(HttpServletRequest req) {
		// TODO Auto-generated method stub
		return (IUser) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
	}




}
