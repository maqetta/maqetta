package org.davinci.server.user;

import java.io.IOException;

public interface IPersonManager {

    public abstract boolean hasPermisions(IPerson owner, IPerson requester, String resource);

    public abstract IPerson getPerson(String userName);
    
    public IPerson getPersonByEmail(String email);

    public abstract IPerson addPerson(String userName, String password, String email) throws UserException, IOException;

    public abstract IPerson login(String userName, String password);

    public abstract boolean isValidPassword(String userName, String password);

    public abstract IPerson[] getPersons(String userName, int resultNumber, int start);

    public abstract String getPhotoRepositoryPath();
}