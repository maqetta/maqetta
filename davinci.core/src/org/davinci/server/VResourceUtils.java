package org.davinci.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class VResourceUtils {
	public static void copyDirectory(IVResource source, IVResource destination,
			boolean recurse) {
		IVResource[] list = source.listFiles();

		if(!destination.mkdir()){
			System.err.println("copyDirectory failed to create destination "+destination.getPath());
			return;
		}

		for (int i = 0; i < list.length; i++) {
			IVResource r = destination.create(list[i].getName());
			if (list[i].isDirectory()) {
				r.mkdir();
				if (recurse) {
					VResourceUtils.copyDirectory(list[i], r, recurse);
				}
			} else {
				try {
					if (!r.exists()) {
						r.createNewInstance();
						VResourceUtils.copyFile(list[i], r);
						r.flushWorkingCopy();
					}
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
	}

	public static void copyFile(IVResource src, IVResource dest)
			throws IOException {
		InputStream in = src.getInputStreem();
		OutputStream out = dest.getOutputStreem();

		byte[] buf = new byte[1024];
		int len;
		while ((len = in.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		in.close();
		out.close();
		dest.flushWorkingCopy();
	}

}
