package org.davinci.server.user;

public interface PersonManager {

	public abstract boolean hasPermisions(Person owner, Person requester,
			String resource);

	public abstract Person getPerson(String userName);

	public abstract Person addPerson(String userName, String password,
			String email) throws UserException;

	public abstract Person login(String userName, String password);

	public abstract boolean isValidPassword(String userName, String password);

	public abstract Person[] getPersons(String userName, int resultNumber,
			int start);

	public abstract String getPhotoRepositoryPath();
}