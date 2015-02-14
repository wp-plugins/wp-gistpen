window.wpgpSettings = {};

jQuery(function($) {
	"use strict";

	var settings = window.wpgpSettings;

	Prism.hooks.add('after-highlight', function(env) {
		var preview = new settings.Preview();

		preview.setClickHandlers();
	});

	var exp = new settings.Export();

	exp.setClickHandlers();

	var imp = new settings.Import();

	imp.setClickHandlers();
});

(function($){
	var exp = Backbone.Model.extend({
		initialize: function(opts) {
			this.startBtn = jQuery('#export-gistpens');
			this.wrap = jQuery('.wpgp-wrap');
			this.templates = {};
			this.templates.header = jQuery("script#exportHeaderTemplate");
			this.templates.status = jQuery("script#statusTemplate");
		},

		setClickHandlers: function () {
			var that = this;

			if(!this.startBtn.length) {
				return;
			}

			this.startBtn.prop("disabled", true);

			this.getGistpenIDs();

			this.startBtn.click(function(e) {
					e.preventDefault();

					that.wrap.html('');

					that.appendHeader();

					that.gistpenIDs.forEach(function(id) {
						that.exportID(id);
					});
			});
		},

		getGistpenIDs: function() {
			var that = this;
			jQuery.post(ajaxurl, {
				action: 'get_gistpens_missing_gist_id',
				nonce: jQuery('#_ajax_wp_gistpen').val()
			}, function(response) {
				if(false === response.success) {
					that.startBtn.val(response.data.message);
				} else {
					that.gistpenIDs = response.data.ids;
					that.startBtn.prop("disabled", false);
				}
			});
		},

		appendHeader: function() {
			var that = this;
			var template = _.template(this.templates.header.html());

			this.header = jQuery(template({}).trim()).appendTo(this.wrap);
			this.backLink = this.header.find("a");
			this.$progress = this.header.find("#progressbar");
			this.$progressLabel = this.header.find(".progress-label");
			this.$status = jQuery('#export-status');

			var result = this.$progress.progressbar({
				max: that.gistpenIDs.length,
				value: 0,
				enable: true
			});
		},

		exportID: function(id) {
			var that = this;

			jQuery.ajaxq('export', {
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'create_gist_from_gistpen_id',
					nonce: jQuery('#_ajax_wp_gistpen').val(),

					gistpen_id: id
				},
				success: function(response) {
					that.updateProgress(response);
				},
				error: function(response) {
					jQuery.ajaxq.abort('export');
					that.updateProgress(response);
				},
			});
		},

		updateProgress: function(response) {
			var template = _.template(this.templates.status.html());

			this.$progress.progressbar( 'value', this.$progress.progressbar("value") + 1);

			this.$status.append(template({
				status_code: response.data.code,
				status_message: response.data.message
			}).trim());
		}
	});

	window.wpgpSettings.Export = exp;
})(jQuery);

(function($){
	var exp = Backbone.Model.extend({
		initialize: function(opts) {
			this.startBtn = jQuery('#import-gists');
			this.wrap = jQuery('.wpgp-wrap');
			this.templates = {};
			this.templates.header = jQuery("script#importHeaderTemplate");
			this.templates.status = jQuery("script#statusTemplate");
		},

		setClickHandlers: function () {
			var that = this;

			if(!this.startBtn.length) {
				return;
			}

			this.startBtn.prop("disabled", true);

			this.getGistIDs();

			this.startBtn.click(function(e) {
					e.preventDefault();

					that.wrap.html('');

					that.appendHeader();

					that.gistIDs.forEach(function(id) {
						that.importID(id);
					});
			});
		},

		getGistIDs: function() {
			var that = this;
			jQuery.post(ajaxurl, {
				action: 'get_new_user_gists',
				nonce: jQuery('#_ajax_wp_gistpen').val()
			}, function(response) {
				if(false === response.success) {
					that.startBtn.val(response.data.message);
				} else {
					that.gistIDs = response.data.gist_ids;
					that.startBtn.prop("disabled", false);
				}
			});
		},

		appendHeader: function() {
			var that = this;
			var template = _.template(this.templates.header.html());

			this.header = jQuery(template({}).trim()).appendTo(this.wrap);
			this.backLink = this.header.find("a");
			this.$progress = this.header.find("#progressbar");
			this.$progressLabel = this.header.find(".progress-label");
			this.$status = jQuery('#import-status');

			var result = this.$progress.progressbar({
				max: that.gistIDs.length,
				value: 0,
				enable: true
			});
		},

		importID: function(id) {
			var that = this;

			jQuery.ajaxq('import', {
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'import_gist',
					nonce: jQuery('#_ajax_wp_gistpen').val(),

					gist_id: id
				},
				success: function(response) {
					that.updateProgress(response);
				},
				error: function(response) {
					jQuery.ajaxq.abort('import');
					that.updateProgress(response);
				},
			});
		},

		updateProgress: function(response) {
			var template = _.template(this.templates.status.html());

			this.$progress.progressbar( 'value', this.$progress.progressbar("value") + 1);

			this.$status.append(template({
				status_code: response.data.code,
				status_message: response.data.message
			}).trim());
		}
	});

	window.wpgpSettings.Import = exp;
})(jQuery);

(function($){
	var preview = Backbone.Model.extend({

		initialize: function(opts) {
			this.cssLink = jQuery('link#wp-gistpen-prism-theme-css');
			this.themeSelect = jQuery('#_wpgp_gistpen_highlighter_theme');
			this.lnSelect = jQuery('#_wpgp_gistpen_line_numbers');
			this.pre = jQuery('pre.gistpen');
			this.lineNumbers = jQuery('span.line-numbers-rows');
		},

		setTheme: function() {
			var theme = this.themeSelect.val();

			if(theme == 'default') {
				theme = '';
			} else {
				theme = '-' + theme;
			}

			this.cssLink.attr('href', WP_GISTPEN_URL + 'assets/css/prism/themes/prism' + theme + '.css' );
		},

		setClickHandlers: function() {
			var that = this;

			this.setTheme();

			if(!this.lnSelect.is(':checked')) {
				this.pre.removeClass('line-numbers');
				this.lineNumbers.hide();
			}

			this.themeSelect.change(function() {
				that.setTheme();
			});

			this.lnSelect.click(function() {
				if(that.lnSelect.is(':checked')) {
					that.pre.addClass('line-numbers');
					that.lineNumbers.prependTo('pre.gistpen code');
					that.lineNumbers.show();
				} else {
					that.pre.removeClass('line-numbers');
					that.lineNumbers.hide();
				}
			});
		}
	});

	window.wpgpSettings.Preview = preview;
})(jQuery);
