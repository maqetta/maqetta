package org.davinci.server.internal.user;

import java.io.File;
import java.util.HashMap;
import java.util.Set;

import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.Person;
import org.davinci.server.user.PersonManager;
import org.davinci.server.user.UserException;
import org.davinci.server.util.XMLFile;
import org.w3c.dom.Element;

public class PersonManagerImpl implements PersonManager {

    HashMap             persons      = new HashMap();

    static final String USERS_TAG    = "users";
    static final String USER_TAG     = "user";
    static final String NAME_TAG     = "name";
    static final String PASSWORD_TAG = "password";
    static final String EMAIL_TAG    = "email";

    File                baseDirectory;

    static class PersonImpl implements Person {
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

        public String getUserName() {
            return name;
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

        protected Object createObject(Element element, String[] attributes) {
            String userName = attributes[0];
            PersonImpl user = new PersonImpl(userName, attributes[1], attributes[2]);
            PersonManagerImpl.this.persons.put(user.getUserName(), user);
            return user;
        }

        protected String[] getAttributeValues(Object object) {
            PersonImpl user = (PersonImpl) object;
            return new String[] { user.getUserName(), user.password, user.getEmail() };
        }

    }

    public PersonManagerImpl(File baseDir) {
        this.baseDirectory = baseDir;
        loadUsers();
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * org.davinci.server.user.impl.UserManager#hasPermisions(org.davinci.server
     * .user.User, org.davinci.server.user.User, java.lang.String)
     */
    public boolean hasPermisions(Person owner, Person requester, String resource) {
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
    public Person addPerson(String userName, String password, String email) throws UserException {
        Person person = (Person) persons.get(userName);
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
    public Person login(String userName, String password) {
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

    private void loadUsers() {
        File userFile = new File(this.baseDirectory, IDavinciServerConstants.USER_LIST_FILE);
        if (userFile.exists()) {
            new UsersFile().load(userFile);

        }
    }

    private void savePersons() {
        File userFile = new File(this.baseDirectory, IDavinciServerConstants.USER_LIST_FILE);
        new UsersFile().save(userFile, this.persons.values());
    }

    public Person getPerson(String userName) {

        PersonImpl person = (PersonImpl) persons.get(userName);
        return person;

    }

    public Person[] getPersons(String userName, int resultNumber, int start) {
        HashMap<String, Person> users = new HashMap<String, Person>();
        Set<String> names = persons.keySet();
        int i = 0;
        for (String name : names) {
            String email = ((Person) persons.get(name)).getEmail();
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
