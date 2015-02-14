window.wpgpEditor = { Views: {}, Models: {} };

jQuery(function($) {
	"use strict";

	var editor = window.wpgpEditor;

	var app = new editor.Main({
		post_id: $('#post_ID').val(),
		form: $('form#post'),
	});

	editor.app = app;
});

(function($){
	var editor = window.wpgpEditor;

	var files = Backbone.Collection.extend({
		model: function(attrs, options) {
			return new editor.Models.File(attrs, options);
		},

		initialize: function() {
			this.view = new editor.Views.Files({collection: this});
			this.on({
				'add': this.addFile
			});
		},

		addFile: function() {
			this.view.render();
		}
	});

	window.wpgpEditor.Files = files;
})(jQuery);

(function($){
	var editor = window.wpgpEditor;

	var modelfile = Backbone.Model.extend({
		defaults: {
			slug: "",
			code: "",
			ID: null,
			language: ""
		},

		initialize: function() {
			this.view = new editor.Views.File({model: this});
		},

		deleteFile: function() {
			this.collection.remove(this);
		}
	});

	window.wpgpEditor.Models.File = modelfile;
})(jQuery);

(function($){
	var editor = window.wpgpEditor;

	var main = Backbone.Model.extend({
		$nonce: $('#_ajax_wp_gistpen'),
		defaults: {
			acetheme: 'ambiance'
		},

		initialize: function(atts, opts) {
			this.getData();

			this.view = new editor.Views.Main({model: this});
		},

		attachListeners: function() {
			this.on({
				'change:acetheme': this.updateThemes,
			});
		},

		updateThemes: function() {
			var that = this;

			this.files.view.updateThemes(this.get('acetheme'));

			$.post(ajaxurl, {
				nonce: that.getNonce(),
				action: 'save_ace_theme',
				theme: that.get('acetheme')
			}, function(response, textStatus, xhr) {
				if(response.success === false) {
					that.view.displayMessage(response.data.code, response.data.message);
				}
			});
		},

		getData: function() {
			var that = this;

			$.ajaxq('getData', {
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'get_gistpen',
					nonce: that.getNonce(),

					post_id: that.get('post_id'),
				},
			})
			.done(function(response) {
				if(response.success === false) {
					that.view.displayMessage(response.data.code, response.data.message);
				} else {
					that.set('files', response.data.files);
					delete response.data.files;

					that.set('zip', response.data);

					that.zip = new editor.Models.Zip(that.get('zip'));
					that.files = new editor.Files(that.get('files'));

					that.get('form').prepend(that.render());
				}
			});

			$.ajaxq('getData', {
				url: ajaxurl,
				type: 'POST',
				data: {
					nonce: that.getNonce(),
					action: 'get_ace_theme'
				},
			})
			.done(function(response) {
				if(response.success === true && "" !== response.data.theme) {
					that.set('acetheme', response.data.theme);
					that.view.$select.val(that.get('acetheme'));
				}

				that.files.view.updateThemes(that.get('acetheme'));

				that.attachListeners();
			});

		},

		addFile: function() {
			var file = new editor.Models.File();

			this.files.add(file);
			this.files.view.updateThemes(this.get('acetheme'));
		},

		updateGistpen: function() {
			var that = this;

			return $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'save_gistpen',
					nonce: that.getNonce(),

					zip: that.toJSON()
				},
			});
		},

		toJSON: function() {
			var atts = _.clone( this.zip.attributes );
			atts.files = _.clone( this.files.toJSON() );

			return atts;
		},

		getNonce: function() {
			return $.trim(this.$nonce.val());
		},

		render: function() {
			this.view.render();
			this.view.$el.prepend( this.zip.view.render().el );
			this.view.$el.find('.wpgp-main-settings').after( this.files.view.render().el );

			return this.view.$el;
		},

	});

	window.wpgpEditor.Main = main;
})(jQuery);

(function($){
	var editor = window.wpgpEditor;

	var modelzip = Backbone.Model.extend({
		defaults: {
			description: "",
			ID: null,
			status: "",
			password: "",
			sync: "off",
		},

		initialize: function() {
			if('Auto Draft' === this.get('description')) {
				this.set('description', '');
			}
			if('auto-draft' === this.get('status')) {
				this.set('status', 'draft');
			}
			if('on' !== this.get('sync')) {
				this.set('sync', 'off');
			}

			this.view = new editor.Views.Zip({model: this});
		},
	});

	window.wpgpEditor.Models.Zip = modelzip;
})(jQuery);

(function($){
	var viewfile = Backbone.View.extend({
		className: 'wpgp-ace',
		template: _.template($("script#wpgpFile").html()),
		events: {
			'click .switch-text': 'switchToText',
			'click .switch-ace': 'switchToAce',
			'click button': 'deleteFile',
			'change select': 'updateLanguage',
			'keyup input.wpgp-file-slug': 'updateSlug',
			'change textarea.wpgp-code': 'updateCode'
		},

		render: function() {
			var that = this;
			this.$el.html( this.template( this.model.toJSON() ) );
			this.$aceDiv = this.$el.find('.ace-editor');
			this.aceDiv = this.$aceDiv.get()[0];
			this.$textCode = this.$el.find('.wpgp-code');
			this.$wrapDiv = this.$el.find('.wp-editor-wrap');
			this.$langSelect = this.$el.find('.wpgp-file-lang');
			this.$slugInput = this.$el.find('.wpgp-file-slug');

			// Activate Ace editor
			this.aceEditor = ace.edit(this.aceDiv);

			this.aceEditor.getSession().on('change', function(event) {
				that.updateTextContent();
			});

			if("" === this.model.get('language')) {
				this.model.set('language', 'plaintext');
			}

			this.$langSelect.val(this.model.get('language'));
			this.updateLanguage();

			this.switchToAce();

			return this;
		},

		switchToAce: function() {
			this.updateAceContent();
			this.$textCode.hide();
			this.$aceDiv.show();
			this.$wrapDiv.addClass('ace-active').removeClass('html-active');
			this.aceEditor.focus();
		},

		updateAceContent: function() {
			this.aceEditor.getSession().setValue(this.$textCode.val());
		},

		switchToText: function() {
			this.$aceDiv.hide();
			this.$textCode.show();
			this.$wrapDiv.removeClass('ace-active').addClass('html-active');
		},

		updateTextContent: function() {
			this.$textCode.val(this.aceEditor.getValue());
			this.updateCode();
		},

		deleteFile: function(e) {
			e.preventDefault();

			this.$el.remove();
			this.model.deleteFile();
		},

		updateLanguage: function() {
			modelLang = this.$langSelect.val();

			// Nothin is set on init, so default to bash
			if ("" === modelLang || null === modelLang) {
				modelLang = 'bash';
			}

			this.model.set('language', modelLang);

			if('js' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/javascript');
			} else if('bash' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/sh');
			} else if('c' === modelLang || 'cpp' === modelLang || 'swift' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/c_cpp');
			} else if('coffeescript' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/coffee');
			} else if('php' === modelLang) {
				this.aceEditor.getSession().setMode(({path: "ace/mode/php", inline: true}));
			} else if('plaintext' === modelLang || 'http' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/plain_text');
			} else if('py' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/python');
			} else if('go' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/golang');
			} else if('git' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/diff');
			} else if('nasm' === modelLang) {
				this.aceEditor.getSession().setMode('ace/mode/assembly_x86');
			} else {
				this.aceEditor.getSession().setMode('ace/mode/' + modelLang);
			}
		},

		updateSlug: function() {
			this.model.set('slug', this.$slugInput.val());
		},

		updateCode: function() {
			this.model.set('code', this.$textCode.val());
		},

		updateTheme: function(theme) {
			this.aceEditor.setTheme('ace/theme/' + theme);
		},
	});

	window.wpgpEditor.Views.File = viewfile;
})(jQuery);

(function($){
	var viewfiles = Backbone.View.extend({
		id: 'wpgp-files',

		render: function() {
			this.collection.each(this.addAce, this);

			return this;
		},

		addAce : function(model, index) {
			this.$el.append(model.view.render().el);
		},

		updateThemes: function(theme) {
			this.collection.each(function(model, index) {
				model.view.updateTheme(theme);
			});
		}
	});

	window.wpgpEditor.Views.Files = viewfiles;
})(jQuery);

(function($){
	var viewmain = Backbone.View.extend({
		id: 'wpgp-editor',
		template: _.template($("script#wpgpMain").html()),
		events : {
			'change select': 'updateTheme',
			'click input#wpgp-addfile' : 'addFile',
			'click input#wpgp-update' : 'updateGistpen',
		},

		render: function() {
			this.$el.append( this.template() );

			this.$select = this.$el.find('select');
			this.$addFile = this.$el.find('input#wpgp-addfile');
			this.$updateGistpen = this.$el.find('input#wpgp-update');
			this.$spinner = this.$el.find('span.spinner');

			return this;
		},

		updateTheme: function() {
			this.model.set('acetheme', this.$select.val());
		},

		addFile: function(e) {
			e.preventDefault();

			this.model.addFile();
		},

		updateGistpen: function(e) {
			var that = this;

			e.preventDefault();

			this.$spinner.toggle();
			this.$updateGistpen.prop('disabled', true);
			this.model.updateGistpen().done(function(response) {
				that.displayMessage(response.data.code, response.data.message);

				that.$updateGistpen.prop('disabled', false);
				that.$spinner.toggle();
			});
		},

		displayMessage: function(code, message) {
			var $message = $('<div class="'+code+'"><p>'+message+'</p></div>');
			$message.hide().prependTo(this.$el).slideDown('slow').delay('2000').slideUp('slow');
		}
	});

	window.wpgpEditor.Views.Main = viewmain;
})(jQuery);

(function($){
	var viewzip = Backbone.View.extend({
		id: 'wpgp-zip',
		template: _.template($("script#wpgpZip").html()),

		events: {
			'keyup input#title': 'updateDescription',
			'change select#wpgp-zip-status': 'updateLanguage',
			'click .wpgp-sync': 'updateSync',
		},

		render: function() {
			var checked;

			this.$el.html( this.template( this.model.toJSON() ) );

			this.$inputDescription = this.$el.find('#title');
			this.$labelDescription = this.$el.find('#title-prompt-text');
			this.$selectStatus = this.$('#wpgp-zip-status');
			this.$inputSync = this.$('#wpgp-zip-sync');

			if ( '' !== this.model.get('description') ) {
				this.$labelDescription.addClass('screen-reader-text');
			}

			this.$selectStatus.val(this.model.get('status'));

			if ( 'on' === this.model.get('sync')) {
				checked = true;
			} else {
				checked = false;
			}

			this.$inputSync.prop('checked', checked);

			this.addListeners();

			return this;
		},

		addListeners: function() {
			that = this;

			this.$labelDescription.click(function(){
				that.$labelDescription.addClass('screen-reader-text');
				that.$inputDescription.focus();
			});

			this.$inputDescription.blur(function(){
				if ( '' === this.value ) {
					that.$labelDescription.removeClass('screen-reader-text');
				}
			}).focus(function(){
				that.$labelDescription.addClass('screen-reader-text');
			}).keydown(function(e){
				that.$labelDescription.addClass('screen-reader-text');
			});
		},

		updateDescription: function() {
			this.model.set('description', this.$inputDescription.val());
		},

		updateLanguage: function() {
			this.model.set('status', this.$selectStatus.val());
		},

		updateSync: function() {
			var sync;

			if (true === this.$inputSync.prop('checked')) {
				sync = 'on';
			} else {
				sync = 'off';
			}

			this.model.set('sync', sync);
		}
	});

	window.wpgpEditor.Views.Zip = viewzip;
})(jQuery);
