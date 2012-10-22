package maqetta.server.orion.user;

//import java.io.File;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import maqetta.core.server.user.manager.PersonManagerImpl;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.UserException;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.eclipse.orion.server.useradmin.UserServiceHelper;

public class OrionPersonManager extends PersonManagerImpl {
	
	
	public OrionPersonManager(){
		
	}
	
	 static class OrionPersonImpl implements IPerson {
	        String email;
	        String name;
	        String password;
		 public OrionPersonImpl(String userName, String password, String email) {
	         this.name = userName;
	         this.password = password;
	         this.email = email;
	     }
	
	     public String getEmail() {
	    	 if(this.email!=null)
	    		 return this.email;
	    	 
	   // 	 UserServiceHelper.getDefault().getUserProfileService().getUserProfileNode(this.name, false);
	    	 IOrionCredentialsService userAdmin = UserServiceHelper.getDefault().getUserStore();
	    	 User user = (User) userAdmin.getUser(UserConstants.KEY_UID, this.getUserID());
	    	 if (user != null) {
	    		 this.email = user.getLogin();
	    	 } else {
	    		 System.err.println("ERROR: OrionPersonImpl.getEmail: user '" + this.getUserID() + "' could not be found in IOrionCredentialsService.");
	    	 }
	    	 return this.email;
	     }
	
	     public String getUserID() {
	         return name;
	     }
	
		public String getFirstName() {
			// TODO Auto-generated method stub
			return "";
		}
	
		public String getLastName() {
			// TODO Auto-generated method stub
			return "";
		}

	 }

    private void assertValidUserId(String uid) {
    	if (uid.indexOf("@") != -1) {
    		throw new Error("Invalid user ID");
    	}
    }

	 public IPerson addPerson(String userName, String password, String email) throws UserException {
		 assertValidUserId(userName);

	        IPerson person = (IPerson) persons.get(userName);
	        if (person != null) {
	           return person;
	        }
	        
	        person = new OrionPersonImpl(userName, password, email);
	        persons.put(userName, person);
	        
	        //Trace out the addition
	        System.out.println("INFO: OrionPersonManager.addPerson: user added with following info: userName = " + userName + ", email = " + email);
	        
	        return person;
	    }
    
	 
	    /*
	     * (non-Javadoc)
	     *
	     * @see org.davinci.server.user.impl.UserManager#login(java.lang.String,
	     * java.lang.String)
	     */
	    public IPerson login(String userName, String password) {
			assertValidUserId(userName);

			IPerson person = (IPerson) persons.get(userName);
	        if(person!=null){
	        	return person;
	        }
	        try {
				return addPerson(userName, null, null);
			} catch (UserException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	        return null;
	    }

	    private void checkValidUserName(String userName) throws UserException {
	        if (userName.indexOf(' ') >= 0) {
	            throw new UserException(UserException.INVALID_USER_NAME);
	        }
	    }

	    /*
	     * (non-Javadoc)
	     *
	     * @see
	     * org.davinci.server.user.impl.UserManager#isValidPassword(java.lang.String
	     * , java.lang.String)
	     */
	    public boolean isValidPassword(String userName, String password) {
		       return true;
	    }

	    protected void savePersons() {}

	    public IPerson getPerson(String userName) {
			assertValidUserId(userName);

			IPerson person = (IPerson) persons.get(userName);
	        if(person!=null)
	        	return person;
	        
	        try {
				return addPerson(userName, null, null);
			} catch (UserException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	        return null;
	    }
	    
	    public IPerson getPersonByEmail(String email) {
	    	IPerson match = null;
	        Iterator peopleIterator = persons.values().iterator();
	        while (peopleIterator.hasNext() && match == null) {
	        	IPerson person = (IPerson)peopleIterator.next();
	        	String personEmail = person.getEmail();
	        	if (personEmail != null && personEmail.equals(email)) {
	        		match = person;
	        	}
	        }
	        return match;
	    }
	    
	    /* no need to load the users */
	    protected void loadUsers() {
	    }

	    public IPerson[] getPersons(String email, int resultNumber, int start) {
			HashMap<String, IPerson> users = new HashMap<String, IPerson>();
	        Set<String> names = persons.keySet();
	        int i = 0;
	        for (String name : names) {
	            String personEmail = ((IPerson) persons.get(name)).getEmail();
	            if (name.indexOf(email) >= 0 || personEmail.indexOf(email) >= 0) {
	                if (i >= start && i < start + resultNumber) {
	                    users.put(personEmail, new OrionPersonImpl(name, "", personEmail));
	                }
	                i++;
	            }
	        }
	        return users.values().toArray(new IPerson[0]);
	    }

	    public String getPhotoRepositoryPath() {
	        return "not-implemented";
	    }
}
