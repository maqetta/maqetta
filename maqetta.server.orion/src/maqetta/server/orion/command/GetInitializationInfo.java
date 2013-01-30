package maqetta.server.orion.command;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.MaqettaOrionServerConstants;

import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class GetInitializationInfo extends Command {
	private String siteConfigJson = null;

	private class MaqettaConfigException extends Exception {
		private static final long serialVersionUID = 1L;

		public MaqettaConfigException(String message) {
			super(message);
		}

	};

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			IUser user) throws IOException {
		IEclipsePreferences users = new OrionScope().getNode("Users"); //$NON-NLS-1$
		IEclipsePreferences result = (IEclipsePreferences) users.node(user
				.getUserID());
		String workbenchSettings = result.get(
				MaqettaOrionServerConstants.WORKBENCH_PREF, "{}");
		try {
			String c = this.getSiteJson();
			this.responseString = "{\n" + "\t'workbenchState':"
					+ workbenchSettings + ",\n" + "\t'userInfo':{'userId': '"
					+ user.getUserID() + "'," + "\t\t'isLocalInstall': '"
					+ String.valueOf(ServerManager.LOCAL_INSTALL) + "',"
					+ "\t\t'userFirstName': '"
					+ String.valueOf(user.getPerson().getFirstName()) + "',"
					+ "\t\t'userLastName': '"
					+ String.valueOf(user.getPerson().getLastName()) + "',"
					+ "\t\t'email': '" + user.getPerson().getEmail() + "'\n"
					+ "\t}" + "\t" + c + "\n" + "}";
		} catch (MaqettaConfigException e) {
			System.err.println("Maqetta Configuration Exception: "
					+ e.getMessage());
			e.printStackTrace();
			// TODO: throw a 500, for now. Consider whether we should send this
			// error back in JSON instead
			throw new IOException(e.getMessage());
		}

	}

	private String getSiteJson() throws MaqettaConfigException {

		if (this.siteConfigJson != null) {
			return this.siteConfigJson;
		}
		String ret = "";
		String siteConfigDir = ServerManager.getServerManger()
				.getDavinciProperty(
						IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY);
		if (siteConfigDir == null) {
			throw new MaqettaConfigException(
					"maqetta.server.orion.command.GetInitializationInfo "
							+ IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY
							+ " :  Is not set in Config file");

		}
		File folder = new File(siteConfigDir);
		if (folder.exists()) {
			File[] listOfFiles = folder.listFiles();

			for (int i = 0; i < listOfFiles.length; i++) {

				if (listOfFiles[i].isFile()) {
					String file = listOfFiles[i].getName();
					if (file.endsWith(".json") || file.endsWith(".JSON")) {
						try {
							String fileNameWithOutExt = file.replaceFirst(
									"[.][^.]+$", "");
							String output = this.readFile(siteConfigDir + "/"
									+ file);
							JSONObject j = new JSONObject(output);
							ret = ret + ",\n\t'" + fileNameWithOutExt + "': "
									+ output;
						} catch (JSONException e) {
							throw new MaqettaConfigException(
									"maqetta.server.orion.command.GetInitializationInfo "
											+ siteConfigDir + "/" + file
											+ " not valid json: " + e.getMessage());
						} catch (IOException e) {
							throw new MaqettaConfigException(
									"maqetta.server.orion.command.GetInitializationInfo "
											+ siteConfigDir + "/" + file
											+ " error reading file: " + e.getMessage());
						}
					}
				}
			}

		} else {
			throw new MaqettaConfigException(
					"maqetta.server.orion.command.GetInitializationInfo "
							+ IDavinciServerConstants.SITECONFIG_DIRECTORY_PROPERTY
							+ " : " + siteConfigDir + " Does not exist");
		}
		this.siteConfigJson = ret;
		return this.siteConfigJson;
	}

	private String readFile(String path) throws IOException {
		FileInputStream stream = new FileInputStream(new File(path));
		try {
			FileChannel fc = stream.getChannel();
			MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0,
					fc.size());
			/* Instead of using default, pass in a decoder. */
			return Charset.defaultCharset().decode(bb).toString();
		} finally {
			stream.close();
		}
	}

}
