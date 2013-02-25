define(["dojo/_base/declare",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetBase",
        "dijit/_WidgetsInTemplateMixin",
        "davinci/library",
        "system/resource",
        "dojo/promise/all",
        "dojo/parser",
        "davinci/Workbench",
        "davinci/ve/RebaseDownload",
        "dojo/i18n!./nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/download.html",
        "davinci/Theme",
        "dijit/form/Button",
        "dijit/form/ValidationTextBox",
        "dijit/form/TextBox"
],function(declare, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin, Library, Resource, all, parser, Workbench, RebaseDownload, uiNLS, commonNLS, templateString, Theme){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: templateString,
		
		_fileNameValidationRegExp: "[a-zA-z0-9_.]+", //Numbers, letters, "_", and "."
		_fileNameMaxLength: 50,
		
		postMixInProperties: function() {
			this._projectName = Workbench.getProject();
			dojo.mixin(this, uiNLS);
			dojo.mixin(this, commonNLS);
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			this._buildUITable();
		},

		_buildUITable: function() {
			this._handles = [];
			this._userLibs = Library.getUserLibs(this.getRoot());
			var uiArray = [
			    dojo.replace("<table cellspacing='0' cellpadding='0' width='100%' class='dwnloadLibTable'><tr><td class='header'>{library}</td><td class='header'>{version}</td><td class='header'>{include}<br>{source}</td><td class='header'>{baseLocation}</td></tr><tr><td colspan='4'><hr></hr></td></tr>", uiNLS)];
			this.libraries = {};
			/* build UI table */
			this._userLibs.forEach(function(userLib, i){
				userLib.initRoot = this._getLibRoot(userLib.id, userLib.version);
				var name = userLib.id; // may want to use a better name here eventually
				
				if(!userLib.initRoot) {
					return;
				}
				
				uiArray.push("<tr libPath='" + i + "'");
				if (userLib.required) {
					uiArray.push(" style='display:none'");
				}
				uiArray.push(">");

				uiArray = uiArray.concat([
				    "<td class='columna'>" + name + "</td>",
					"<td class='columnb'>" + userLib.version + "</td>",
					"<td class='columnc'><input type='checkbox' data-dojo-type='dijit/form/CheckBox' checked></input></td>",
					"<td class='columnd'><input type='text' data-dojo-type='dijit/form/TextBox' value='" + userLib.initRoot + "'></input></td>",
					"</tr>"]);
			}, this);
			uiArray.push("</table>");
			dojo.place(uiArray.join(""), this._tableDiv);

			// parse dijits
			parser.parse(this._tableDiv);
		},
	
		_getLibRoot: function(id,version){
			var root = undefined;
			this._userLibs.some(function(lib){
				if (lib.id == id && lib.version == version) {
					root = lib.root;
					return true;
				}
			});
			return root;
		},
		
		_getLibs: function(){
			return dojo.query("tr[libPath]", this.domNode).map(function(row){
				var textBox = dijit.byNode(dojo.query(".dijitTextBox", row)[0]),
					checkBox = dijit.byNode(dojo.query(".dijitCheckBox", row)[0]),
					element = parseInt(dojo.attr(row, "libPath")),
					value = checkBox.get("checked"),
					libLocation = textBox.get("value") || this._userLibs[element].root;

				return {
					id: this._userLibs[element].id,
					version: this._userLibs[element].version,
					root: libLocation,
					includeSrc: value};
			}, this);
		},
		
		getRoot: function(){
			if(Workbench.singleProjectMode()){
				return Workbench.getProject();
			}
		},
		
		_getResources: function(){
			return [Workbench.getProject()];
		},
		
		_rewriteUrls: function(){
			var allResources = [];

			this._getResources().forEach(function(file) {
				var resource = Resource.findResource(file);
				if(resource.elementType=="Folder"){
					allResources = allResources.concat(Resource.findResource("*.html", true, resource, true));
				}else if(resource.extension=="html"){
					allResources.push(resource);
				}
			});

			var pageBuilder = new RebaseDownload(this._getLibs());
			var promises = allResources.filter(function(res){
				return !Theme.isThemeHTML(res);
			}).map(function(res){
				return pageBuilder.rebuildSource(res.getContentSync(), res).then(function (newSource) {
					res.setContents(newSource, true);						
				});
			});

			return all(promises);
		},

		_select: function(value) {
			dojo.query("tr[libPath]", this.domNode).forEach(function(row) {
				var checkBox = dijit.byNode(dojo.query(".dijitCheckBox", row)[0]);
				if (checkBox) {
					checkBox.set("checked", value);
				}
			});

			return false;
		},

		_selectAll: function() {
			this._select(true);
		},

		_selectNone: function() {
			this._select(false);
		},
		
		okButton: function(){
			if (this.__fileName.isValid()) {
				var fileName = dojo.attr( this.__fileName, "value");
				if (fileName.slice(-4) != ".zip") {
					fileName += ".zip";
				}
				this._rewriteUrls().then(function() {
					var actualLibs = this._getLibs().filter(function(lib){
						return lib.includeSrc;
					});
		
					var options = {};
					if (this.__optimize && this.__optimize.getValue()) {
						options.build = "1";
					}
					if (this.__fullSource && this.__fullSource.getValue()) {
						options.fullsource = "1";
					}

					// have to close the dialog before the download call starts
					setTimeout(function(){
						Resource.download(
							this._getResources(),
							fileName,
							this.getRoot(),
							actualLibs,
							options);
					}.bind(this), 300);
				}.bind(this));
			}
		},
		
		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		}
	});
});