define([
        "dojo/_base/declare",
        "../Workbench",
        "davinci/version",
        "davinci/repositoryinfo",
        "dojo/date/locale",
        "dojo/date/stamp",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dijit/form/Button"
   ],function(declare, Workbench, DavinciVersion, Repositoryinfo, Locale, Stamp, uiNLS, commonNLS){
		var about = declare("davinci.ui.about", null, {});
		about.show = function(){
				var langObj = uiNLS;

				var formHTML = "<div class='about_container'>"
						+ "<div class='about_version'>"
						+ dojo.string.substitute(langObj.productVersion,
								[ DavinciVersion ]) + "</div>";
				var ri = Repositoryinfo, revision = ri.revision;
				var bd = ri.buildtime;
				var date = Stamp.fromISOString(bd);
				if (date) {
					bd = Locale.format(date, {
						formatLength : 'medium'
					});
				}
				if (bd) {
					formHTML += "<div class='about_date'>"
							+ dojo.string.substitute(langObj.productDate,
									[ bd ]) + "</div>";
				}
				if (revision) {
					// formHTML += "<div class='about_build'>"+langObj.build+"<a
					// href='https://github.com/maqetta/maqetta/commit/"+revision+"'>"+
					// revision.substr(0,15) +"...</a></div>";
					var revisionLink = "<a href='https://github.com/maqetta/maqetta/commit/"
							+ revision
							+ "'>"
							+ revision.substr(0, 15)
							+ "...</a>";
					formHTML += "<div class='about_build'>"
							+ dojo.string.substitute(langObj.build,
									[ revisionLink ]) + "</div>";
				}
				formHTML += "</div>";

				Workbench.showMessage(langObj.aboutMaqetta, formHTML);
			}
		return about;
});