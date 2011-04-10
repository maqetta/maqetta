package org.davinci.server.user;


public interface UserManager {

	public abstract boolean hasPermisions(User owner, User requester,
			String resource);

	public abstract User getUser(String userName);

	public abstract User addUser(String userName, String password, String email)
			throws UserException;

    public abstract void removeUser(String userName)
            throws UserException;

	public abstract User login(String userName, String password);

	public abstract boolean isValidUser(String userName);
	public User getSingleUser();

	public PersonManager getPersonManager();

}