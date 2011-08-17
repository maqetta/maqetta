package org.davinci.server;

public interface IDavinciServerConstants {

	public static final String BASE_DIRECTORY_PROPERTY = "maqetta.baseDirectory";
	public static final String SERVER_DEBUG = "maqetta.serverDebug";
	public static final String LOCAL_INSTALL = "maqetta.localInstall";
	public static final String MAX_USERS = "maqetta.maxUsers";

	public static final String BUNDLE_ID = "davinci.core";

	public static final String USER_LIST_FILE = "users.xml";

	public static final String SESSION_USER = "DAVINCI.USER";
	public static final String LOGGING_IN_USER = "DAVINCI.LOGGIN.IN.USER";
	public static final String REDIRECT_TO = "DAVINCI.REDIRECT_TO";

	public static final String APP_URL = "/app";
	public static final String WSFILE_URL = "/wsfile";
	public static final String USER_URL = "/user";
	public static final String PREVIEW_PARAM = "preview";
	public static final String GUEST_USER_PREFIX = "_Guest_";

	public static final String SETTINGS_DIRECTORY_NAME = ".settings";
	public static final String SETTINGS_EXTENSION = ".settings";
	public static final String WORKBENCH_STATE_FILE = "workbenchState.settings";
	public static final String LINKS_FILE = "links.settings";
	public static final String LIBS_FILE = "libs.settings";
	public static final String DOWNLOAD_DIRECTORY_NAME = ".download";
	public static final String SVN_DIRECTORY_NAME = ".svn";

	public static final String WORKING_COPY_EXTENSION = ".workingcopy";

	// Extension point definitions
	public static final String EXTENSION_POINT_COMMAND = "command";
	public static final String EP_TAG_COMMAND = "command";
	public static final String EP_ATTR_COMMAND_CLASS = "class";
	public static final String EP_ATTR_COMMAND_NOLOGIN = "noLogin";
	public static final String EP_ATTR_COMMAND_ISPUT = "isPut";
	public static final String EP_ATTR_COMMAND_PATH = "path";

	public static final String EXTENSION_POINT_AJAXLIBRARY = "ajaxLibrary";
	public static final String EP_TAG_AJAXLIBRARY = "ajaxLibrary";
	public static final String EP_ATTR_AJAXLIBRARY_NAME = "name";
	public static final String EP_TAG_LIBRARYPATH = "libraryPath";
	public static final String EP_ATTR_LIBRARYPATH_LOCATION = "location";
	public static final String EP_ATTR_LIBRARYPATH_NAME = "name";

	public static final String EP_TAG_METADATA = "metadata";
	public static final String EP_ATTR_METADATA_MODULE = "module";
	public static final String EP_ATTR_METADATA_MODULEPATH = "modulePath";
	public static final String EP_ATTR_METADATA_BASE = "base";
	public static final String EP_ATTR_METADATA_PALETTEDESCRIPTORS = "paletteDescriptors";

	public static final String EXTENSION_POINT_INITIAL_USER_FILES = "initialUserFiles";
	public static final String EP_TAG_INITIAL_USER_FILE = "initalUserFile";
	public static final String EP_ATTR_INITIAL_USER_FILE_PATH = "path";

	public static final String EXTENSION_POINT_PERSON_MANAGER = "personManager";
	public static final String EP_TAG_PERSON_MANAGER = "personManager";
	public static final String EP_ATTR_PERSON_MANAGER_CLASS = "class";

	public static final String EXTENSION_POINT_WELCOME_PAGE = "welcomePage";
	public static final String EP_TAG_WELCOME_PAGE = "welcomePage";
	public static final String EP_ATTR_WELCOME_PAGE_PATH = "path";

	public static final String EXTENSION_POINT_JSPLUGIN = "jsPlugin";
	public static final String EP_TAG_JSPLUGIN = "jsPlugin";
	public static final String EP_ATTR_JSPLUGIN_RESOURCE_PATH = "resourcePath";
	public static final String EP_ATTR_JSPLUGIN_ROLE = "role";
	public static final String EP_ATTR_JSPLUGIN_PATH = "path";

	public static final String LOCAL_INSTALL_USER = "maqettaUser";
	public static final String EP_ATTR_METADATA_VERSION = "version";
	public static final String EP_ATTR_METADATA_ID = "id";
    public static final String THEMES_DIRECTORY_NAME = "themes";
	public static final String DEFAULT_PROJECT = "project1";

}
