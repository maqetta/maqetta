package maqetta.core.server.user.manager;


import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.IPersonManager;
import org.davinci.server.user.UserException;
import org.davinci.server.util.XMLFile;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;
import org.w3c.dom.Element;

public class PersonManagerImpl implements IPersonManager {

    protected HashMap<String, IPerson> persons = new HashMap<String, IPerson>();

    protected static final String USERS_TAG    = "users";
    protected static final String USER_TAG     = "user";
    protected static final String NAME_TAG     = "name";
    protected static final String PASSWORD_TAG = "password";
    protected static final String EMAIL_TAG    = "email";

    IStorage                baseDirectory;

    static class PersonImpl implements IPerson {
        String email;
        String name;
        String password;

        public PersonImpl(String userName, String password, String email) {
            this.name = userName;
            this.password = password;
            this.email = email;
        }

        public String getEmail() {
            return email;
        }

        public String getUserID() {
            return name;
        }

		public String getDisplayName() {
			// TODO Auto-generated method stub
			 return email;
		}

    }

    class UsersFile extends XMLFile {
        protected String getRootTag() {
            return PersonManagerImpl.USERS_TAG;
        }

        protected String getElementTag() {
            return PersonManagerImpl.USER_TAG;
        }

        protected String[] getAttributeNames() {
            return new String[] { PersonManagerImpl.NAME_TAG, PersonManagerImpl.PASSWORD_TAG, PersonManagerImpl.EMAIL_TAG };
        }

        protected Object createObject(Element element, String[] attributeNames, String[] attributes) {
            String name = element.getAttribute(PersonManagerImpl.NAME_TAG);
            String email = element.getAttribute(PersonManagerImpl.EMAIL_TAG );
            String password = element.getAttribute(PersonManagerImpl.PASSWORD_TAG);
            PersonImpl user = new PersonImpl(name,  password, email);
            PersonManagerImpl.this.persons.put(user.getUserID(), user);
            return user;
        }

        protected String[] getAttributeValues(Object object) {
            PersonImpl user = (PersonImpl) object;
            return new String[] { user.getUserID(), user.password, user.getEmail() };
        }

		@Override
		protected String getAttributeValue(String attribute, Object object) {
			  PersonImpl user = (PersonImpl) object;
			  if(attribute.equalsIgnoreCase(PersonManagerImpl.NAME_TAG)){
					return user.getUserID();
			  }
			  if(attribute.equalsIgnoreCase(PersonManagerImpl.PASSWORD_TAG)){
					return user.password;
			  }
			  if(attribute.equalsIgnoreCase(PersonManagerImpl.EMAIL_TAG)){
					return user.getEmail();
			  }
			return null;
		
		}

    }

    protected IStorage getBaseDirectory(){
    	if(this.baseDirectory==null){
    		this.baseDirectory = ServerManager.getServerManager().getBaseDirectory();	
    	}
    	return this.baseDirectory;
    }
    
    public PersonManagerImpl() {
    	
    	loadUsers();
    }
    
    /*
     * (non-Javadoc)
     *
     * @see
     * org.davinci.server.user.impl.UserManager#hasPermisions(org.davinci.server
     * .user.User, org.davinci.server.user.User, java.lang.String)
     */
    public boolean hasPermisions(IPerson owner, IPerson requester, String resource) {
        /*
         * deny permision to direct access of a users workspace
         */
        return (resource != "");
    }

    /*
     * (non-Javadoc)
     *
     * @see org.davinci.server.user.impl.UserManager#addUser(java.lang.String,
     * java.lang.String, java.lang.String)
     */
    public IPerson addPerson(String userName, String password, String email) throws UserException, IOException {
        IPerson person = (IPerson) persons.get(userName);
        if (person != null) {
            throw new UserException(UserException.ALREADY_EXISTS);
        }
        checkValidUserName(userName);
        person = new PersonImpl(userName, password, email);
        persons.put(userName, person);
        savePersons();
        return person;
    }

    /*
     * (non-Javadoc)
     *
     * @see org.davinci.server.user.impl.UserManager#login(java.lang.String,
     * java.lang.String)
     */
    public IPerson login(String userName, String password) {
        PersonImpl person = (PersonImpl) persons.get(userName);
        if (person != null && person.password.equals(password)) {
            return person;
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
        PersonImpl person = (PersonImpl) persons.get(userName);
        if (person == null) {
            return false;
        }
        return password.equals(person.password);
    }

    protected void loadUsers() {
    	IStorage baseDirectory = getBaseDirectory();
        IStorage userFile = baseDirectory.newInstance(baseDirectory, IDavinciServerConstants.USER_LIST_FILE);
        if (userFile.exists()) {
            new UsersFile().load(userFile);

        }
    }

    protected void savePersons() throws IOException {
    	IStorage baseDirectory = getBaseDirectory();
        IStorage userFile = baseDirectory.newInstance(baseDirectory, IDavinciServerConstants.USER_LIST_FILE);
        new UsersFile().save(userFile, this.persons.values());
    }

    public IPerson getPerson(String userName) {

        IPerson person = (IPerson) persons.get(userName);
        return person;

    }
    
    public IPerson getPersonByEmail(String email) {
    	IPerson match = null;
        Iterator<IPerson> peopleIterator = persons.values().iterator();
        while (peopleIterator.hasNext() && match == null) {
        	IPerson person = (IPerson)peopleIterator.next();
        	if (person.getEmail().equals(email)) {
        		match = person;
        	}
        }
        return match;
    }

    public IPerson[] getPersons(String userName, int resultNumber, int start) {
        HashMap<String, IPerson> users = new HashMap<String, IPerson>();
        Set<String> names = persons.keySet();
        int i = 0;
        for (String name : names) {
            String email = ((IPerson) persons.get(name)).getEmail();
            if (name.indexOf(userName) >= 0 || email.indexOf(userName) >= 0) {
                if (i >= start && i < start + resultNumber) {
                    users.put(email, new PersonImpl(name, "", email));
                }
                i++;
            }
        }
        return users.values().toArray(new PersonImpl[0]);
    }

    public String getPhotoRepositoryPath() {
        return "not-implemented";
    }
}
