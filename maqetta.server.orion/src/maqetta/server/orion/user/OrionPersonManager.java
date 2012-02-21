package maqetta.server.orion.user;

//import java.io.File;
import maqetta.core.server.user.manager.PersonManagerImpl;

import org.davinci.server.user.IPerson;
import org.davinci.server.user.UserException;

public class OrionPersonManager extends PersonManagerImpl {

    public IPerson addPerson(String userName, String password, String email) throws UserException {
        IPerson person = (IPerson) persons.get(userName);
        if (person != null) {
            return person;
        }
       return super.addPerson(userName, password, email);
    }
}
