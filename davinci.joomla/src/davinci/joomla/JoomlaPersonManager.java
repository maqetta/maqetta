package davinci.joomla;

import org.davinci.server.user.Person;
import org.davinci.server.user.PersonManager;
import org.davinci.server.user.UserException;

public class JoomlaPersonManager implements PersonManager {

	static class PersonImpl implements Person {
		String name;
		String email;

		public PersonImpl(String userName) {
			this.name = userName;
		}

		public PersonImpl(String userName, String email) {
			this(userName);
			this.email = email;
		}

		public String getEmail() {
			if (email != null)
				return email;
			else
				return name;
		}

		public String getUserName() {
			return name;
		}
	}

	public Person addPerson(String userName, String password, String email)
			throws UserException {
		return new PersonImpl(userName); 
	}

	public Person getPerson(String userName) {
		return new PersonImpl(userName);  
	}

	public boolean hasPermisions(Person owner, Person requester, String resource) {
		return false;  
	}

	public boolean isValidPassword(String userName, String password) {
		return true;  
	}

	public Person login(String userName, String password) {
		return new PersonImpl(userName);
	}

	public Person[] getPersons(String userName, int resultNumber, int start) {
		// summary:
		// Query persons. Support pagination.
		return new PersonImpl[0]; // NOT IMPLEMENTED; returns empty array in case clients try to iterate
	}

	public String getPhotoRepositoryPath() {
		return "not-implemented";
	}
}
