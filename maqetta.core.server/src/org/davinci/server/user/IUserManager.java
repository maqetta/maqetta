package org.davinci.server.user;

import javax.servlet.http.HttpServletRequest;

import org.maqetta.server.IStorage;

public interface IUserManager {

    public abstract boolean hasPermisions(IUser owner, IUser requester, String resource);

    public abstract IUser getUser(String userName) throws UserException;

    public abstract IUser addUser(String userName, String password, String email) throws UserException;

    public abstract void removeUser(String userName) throws UserException;

    public abstract IUser login(String userName, String password) throws UserException;

    public abstract boolean isValidUser(String userName) throws UserException;

	public abstract boolean isValidUserByEmail(String email) throws UserException;

    public IUser getSingleUser();

    public IUser newUser(IPerson p, IStorage f ) throws UserException;
    
    public IUser getUser(HttpServletRequest req );
    
}