package org.davinci.server.user;

public class UserException extends Exception {
    public static final String ALREADY_EXISTS                    = "User already exists";

    public static final String INVALID_USER_NAME                 = "Invalid User Name";
    public static final String MAX_USERS                         = "Maximum number of Maqetta users exceded";

    public static final String ERROR_COPYING_USER_BASE_DIRECTORY = "Error while creating user base directory.";

    String                     reason;

    public UserException(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

}
