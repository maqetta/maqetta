package org.davinci.server.user;

public class UserException extends Exception {

	private static final long serialVersionUID = -4613354227524860896L;

	public static final String ALREADY_EXISTS                    = "User already exists";

    public static final String INVALID_USER_NAME                 = "Invalid User Name";
    public static final String MAX_USERS                         = "Maximum number of Maqetta users exceded";

    public static final String ERROR_COPYING_USER_BASE_DIRECTORY = "Error while creating user base directory.";

    public UserException(String reason) {
        super(reason);
    }
    
    public UserException(Exception e) {
    	super(e);
    }

    public String getReason() {
        return this.getMessage();
    }

}
