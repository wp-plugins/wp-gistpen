var InsertGistpenDialog = {

	appendDialog: function() {
		var that = this;
		this.dialogBody = jQuery('#wp-gistpen-insert-dialog-body');
		// HTML looks like this:
		// <div id="wp-gistpen-insert-wrap">
		// 	<form id="wp-gistpen-insert" action="" tabindex="-1">
		// 		<div id="insert-existing">
		// 			<p>Insert an existing Gistpen</p>
		// 			<div class="gistpen-search-wrap">
		// 				<label class="gistpen-search-label">
		// 					<label for="gistpen-search-field" class="search-label" style="display: none;">Search Gistpens</label>
		// 					<input type="search" id="gistpen-search-field" class="search-field" placeholder="Search Gistpens" />
		// 					<div id="wp-gistpen-search-btn" class="mce-btn">
		// 						<button role="button">Search</button>
		// 						<span class="spinner"></span>
		// 					</div>
		// 				</label>
		// 			</div>
		// 			<div id="select-gistpen" class="query-results">
		// 				<div class="query-notice"><em>Recent Gistpens</em></div>
		// 				<ul class="gistpen-list">
		// 					<!-- Add Gistpen list here -->
		// 					<li class="create_new_gistpen">
		// 						<div class="gistpen-radio"><input type="radio" name="gistpen_id" value="new_gistpen" checked="checked"></div>
		// 						<div class="gistpen-title">Create a new Gistpen:</div>
		// 						<div class="clearfix"></div>
		// 						<ul>
		// 							<li>
		// 								<label for="wp-gistfile-description" style="display: none;">Gistpen description...</label>
		// 								<input type="text" name="wp-gistfile-description" class="wp-gistfile-description" placeholder="Gistpen description..."></input>
		// 							</li>
		// 							<li id="wp-gistfile-wrap">
		// 							</li>
		// 						</ul>
		// 					</li>
		// 				</ul>
		// 			</div>
		// 		</div>
		// 	</form>
		// </div>
		this.dialogHTML = jQuery('<div id="wp-gistpen-insert-wrap"><form id="wp-gistpen-insert" action="" tabindex="-1"><div id="insert-existing"><p>Insert an existing Gistpen</p><div class="gistpen-search-wrap"><label class="gistpen-search-label"><label for="gistpen-search-field" class="search-label" style="display: none;">Search Gistpens</label><input type="search" id="gistpen-search-field" class="search-field" placeholder="Search Gistpens" /><div id="wp-gistpen-search-btn" class="mce-btn"><button role="button">Search</button><span class="spinner"></span></div></label></div><div id="select-gistpen" class="query-results"><div class="query-notice"><em>Recent Gistpens</em></div><ul class="gistpen-list"><!-- Add Gistpen list here --><li class="create_new_gistpen"><div class="gistpen-radio"><input type="radio" name="gistpen_id" value="new_gistpen" checked="checked"></div><div class="gistpen-title">Create a new Gistpen:</div><div class="clearfix"></div><ul><li><label for="wp-gistfile-description" style="display: none;">Gistpen description...</label><input type="text" name="wp-gistfile-description" class="wp-gistfile-description" placeholder="Gistpen description..."></input></li><li id="wp-gistfile-wrap"></li></ul></li></ul></div></div></form></div>');
		this.gistpenSearchButton = this.dialogHTML.find('#wp-gistpen-search-btn');

		this.dialogBody.append(this.dialogHTML);
		jQuery('.spinner').hide();

		this.fileEditor = new TinyMCEFileEditor();

		// Append recent Gistpens
		// @todo replace this with localize script
		this.getGistpens();

		this.gistpenSearchButton.click( function( e ) {
			$this = jQuery(this);
			e.preventDefault();

			jQuery('#select-gistpen ul.gistpen-list > li').not('.create_new_gistpen').remove();
			$this.children('button').hide();
			jQuery('.gistpen-search-wrap .spinner').show();

			that.getGistpens();

		});
	},

	getGistpens: function() {
		jQuery.post(ajaxurl, {
			action: 'get_gistpens',

			nonce: jQuery.trim(jQuery('#_ajax_wp_gistpen').val()),
			gistpen_search_term: jQuery.trim(jQuery('#gistpen-search-field').val())
		}, function(response) {
			if (response.success === false) {
				jQuery('<li><div class="gistpen-radio"><input type="radio" name="gistpen_id" value="none"></div><div class="gistpen-title">'+response.data.message+'</div></li>').prependTo('.gistpen-list');
			} else {
				var data = response.data;
				for (var i = data.gistpens.length - 1; i >= 0; i--) {
					var gistpen = data.gistpens[i];
					if ( typeof gistpen.description !== "undefined" ) {
						gistpen.post_name = gistpen.description;
					} else {
						gistpen.post_name = gistpen.slug;
					}
					jQuery('<li><div class="gistpen-radio"><input type="radio" name="gistpen_id" value="'+gistpen.ID+'"></div><div class="gistpen-title">'+gistpen.post_name+'</div></li>').prependTo('.gistpen-list');
				}
			}

			jQuery('.gistpen-search-wrap .spinner').hide();
			jQuery('#wp-gistpen-search-btn button').show();
		});
	},

	insertShortcode: function( editor ) {
		var that = this;
		// Get the selected gistpen id
		this.gistpenid = jQuery('input[name="gistpen_id"]:checked').val();

		if( this.gistpenid === 'new_gistpen' ) {
			// Hide the buttons and replace with spinner
			jQuery('#wp-gistpen-button-insert, #wp-gistpen-button-cancel').hide();
			jQuery('#wp-gistpen-insert-dialog .mce-foot .mce-container-body').append('<div class="posting">Inserting post... <span class="spinner"></span></div>');

			// Post the data
			jQuery.post( ajaxurl, {
				action: 'create_gistpen',

				nonce: jQuery.trim(jQuery('#_ajax_wp_gistpen').val()),

				"wp-gistpenfile-slug": that.fileEditor.filenameInput.val(),
				"wp-gistfile-description": jQuery('input.wp-gistfile-description').val(),
				"wp-gistpenfile-code": that.fileEditor.editorTextArea.val(),
				"wp-gistpenfile-language": that.fileEditor.languageSelect.val(),
				"post_status": that.fileEditor.post_status.val(),
			}, function( response ) {
				if ( response.success === false ) {
					editor.insertContent('Failed to save Gistpen. Message: '+response.data.message);
					editor.windowManager.close();
				} else {
					that.gistpenid = response.data.id;
					editor.insertContent( '[gistpen id="' + that.gistpenid + '"]' );
					editor.windowManager.close();
				}
			});
		} else {
			editor.insertContent( '[gistpen id="' + this.gistpenid + '"]' );
			editor.windowManager.close();
		}
	}
};

function TinyMCEFileEditor(file) {
	this.scaffoldEditor();
	this.appendEditor();
	this.appendPostStatusSelector();
	this.loadClickHandlers();
	this.deleteFileButton.remove();
	this.textButton.remove();
	this.aceButton.remove();
	this.aceEditorDiv.remove();

}

TinyMCEFileEditor.prototype  = {

	scaffoldEditor: function() {
		//	HTML looks like this:
		//	<div class="wp-core-ui wp-editor-wrap wp-gistpenfile-editor-wrap">
		//		<div class="wp-editor-tools hide-if-no-js">
		//
		//			<div class="wp-media-buttons">
		//				<input type="text" size="20" class="wp-gistpenfile-slug" placeholder="Filename (no ext)" autocomplete="off" />
		//				<select class="wp-gistpenfile-language"></select>
		//				<input type="submit" class="button delete" value="Delete This Gistfile">
		//			</div>
		//
		//			<div class="wp-editor-tabs wp-gistpenfile-editor-tabs">
		//				<a class="hide-if-no-js wp-switch-editor switch-html">Text</a>
		//				<a class="hide-if-no-js wp-switch-editor switch-ace">Ace</a>
		//			</div>
		//
		//		</div>
		//
		//		<div class="wp-editor-container wp-gistpenfile-editor-container">
		//			<textarea class="wp-editor-area wp-gistpenfile-editor-area" cols="40" rows="20"></textarea>
		//			<div class="ace-editor"></div>
		//		</div>
		//
		//	</div>
		this.editorHTML = '<div class="wp-core-ui wp-editor-wrap wp-gistpenfile-editor-wrap"><div class="wp-editor-tools hide-if-no-js"><div class="wp-media-buttons"><input type="text" size="20" class="wp-gistpenfile-slug" placeholder="Filename (no ext)" autocomplete="off" /><select class="wp-gistpenfile-language"></select><input type="submit" class="button delete" value="Delete This Gistfile"></div><div class="wp-editor-tabs wp-gistpenfile-editor-tabs"><a class="hide-if-no-js wp-switch-editor switch-html">Text</a><a class="hide-if-no-js wp-switch-editor switch-ace">Ace</a></div></div><div class="wp-editor-container wp-gistpenfile-editor-container"><textarea class="wp-editor-area wp-gistpenfile-editor-area" cols="40" rows="20"></textarea><div class="ace-editor"></div></div></div>';
		this.editorFull = jQuery(this.editorHTML);
		this.editorWrap = this.editorFull.find('.wp-gistpenfile-editor-wrap');
		this.editorTools = this.editorFull.find('.wp-editor-tools');
		this.mediaButtons = this.editorFull.find('.wp-media-buttons');
		this.filenameInput = this.editorFull.find('.wp-gistpenfile-slug');
		this.languageSelect = this.editorFull.find('.wp-gistpenfile-language');
		this.deleteFileButton = this.editorFull.find('.button.delete');
		this.editorTabs = this.editorFull.find('.wp-gistpenfile-editor-tabs');
		this.textButton = this.editorFull.find('.wp-switch-editor.switch-html');
		this.aceButton = this.editorFull.find('.wp-switch-editor.switch-ace');
		this.editorContainer = this.editorFull.find('.wp-gistpenfile-editor-container');
		this.editorTextArea = this.editorFull.find('.wp-gistpenfile-editor-area');
		this.aceEditorDiv = this.editorFull.find('.ace-editor');
	},

	appendEditor: function() {
		this.editorFull.appendTo(jQuery('#wp-gistfile-wrap'));
		this.appendLanguages();
		// add label: <label for="wp-gistpenfile-name-'+this.fileID+'" style="display: none;">Gistfilename</label>\
	},

	appendLanguages: function() {
		var thiseditor = this;
		jQuery.each(gistpenLanguages, function(index, el) {
			jQuery('<option></option>').val(el).text(index).appendTo(thiseditor.languageSelect);
		});
	},

	appendPostStatusSelector: function() {
		this.post_status = jQuery('<label for="post_status" style="display: none;">Post Status</label><select class="post_status" name="post_status"><option value="publish">Published</option><option value="draft">Draft</option></select>');
		this.post_status.appendTo(this.editorFull.find('.wp-editor-tools'));
		this.post_status = jQuery('select.post_status');
	},

	activateAceEditor: function() {
		var thiseditor = this;
		jQuery.each(this.aceEditorDiv, function(index, el) {
			thiseditor.aceEditor = el; // Get DOM object from jQuery
		});
		this.aceEditor = ace.edit(this.aceEditor); // Needs DOM object
		this.setTheme();
		this.setMode();
		this.switchToAce();
	},

	setTheme: function() {
		this.aceEditor.setTheme('ace/theme/twilight');
	},

	setMode: function() {

	},

	loadClickHandlers: function() {
		var thiseditor = this;

		this.languageSelect.change(function() {
			thiseditor.setMode();
		});
	},

	switchToText: function() {
		this.aceEditorDiv.hide();
		this.editorTextArea.show();
		this.editorWrap.addClass('html-active').removeClass('ace-active');
	},

	switchToAce: function() {
		this.updateAceContent();
		this.editorTextArea.hide();
		this.aceEditorDiv.show();
		this.editorWrap.addClass('ace-active').removeClass('html-active');
		this.aceEditor.focus();
	},

	deleteEditor: function() {
		var thiseditor = this;

		// Confirm we really want to delete
		var r = confirm("Are you sure you want to delete this Gistpen?");
		if (r === false) {
			return;
		}

		this.editorFull.remove();
		jQuery.post(ajaxurl,{
			action: 'delete_gistpenfile',

			nonce: GistpenEditor.getNonce(),
			fileID: thiseditor.fileID,
		}, function(response) {
			if(response.success === false) {
				console.log('Failed to delete file.');
				console.log(response.data.message);
			} else {
				var currentFileIDs = GistpenEditor.fileIDs.val();
				var newFilesIDs = currentFileIDs.replace(" " + thiseditor.fileID, "");
				GistpenEditor.fileIDs.val(newFilesIDs);
			}
		});
	},

	updateAceContent: function() {
		this.aceEditor.getSession().setValue(this.editorTextArea.val());
	},

	updateTextContent: function() {
		this.editorTextArea.val(this.aceEditor.getValue());
	},

	addID: function() {
		this.filenameInput.attr({
			id: 'wp-gistpenfile-slug-'+this.fileID,
			name: 'wp-gistpenfile-slug-'+this.fileID
		});
		this.languageSelect.attr({
			id: 'wp-gistpenfile-language-'+this.fileID,
			name: 'wp-gistpenfile-language-'+this.fileID
		});
		this.deleteFileButton.attr({
			id: 'wp-delete-gistpenfile-'+this.fileID,
			name: 'wp-delete-gistpenfile-'+this.fileID,
		});
		this.editorTextArea.attr({
			id: 'wp-gistpenfile-code-'+this.fileID,
			name: 'wp-gistpenfile-code-'+this.fileID
		});
		this.aceEditorDiv.attr({
			id: 'ace-editor-'+this.fileID
		});
	},

	addName: function() {
		this.filenameInput.val(this.fileName);
	},

	addContent: function() {
		this.editorTextArea.val(this.fileContent);
	},

	addLanguage: function() {
		this.languageSelect.val(this.fileLanguage);
	}
};
