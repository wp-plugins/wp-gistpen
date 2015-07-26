=== WP-Gistpen ===
Contributors: JamesDiGioia  
Donate link: http://jamesdigioia.com/  
Tags: gist, code snippets, codepen  
Requires at least: 3.9  
Tested up to: 4.2.3  
Stable tag: 0.5.8  
License: GPLv2  
License URI: http://www.gnu.org/licenses/gpl-2.0.html  

== Description ==

A self-hosted alternative to putting your code snippets on Gist.

[![Build Status](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/badges/build.png?b=develop)](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/build-status/develop) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/badges/quality-score.png?b=develop)](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/?branch=develop) [![Code Coverage](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/badges/coverage.png?b=develop)](https://scrutinizer-ci.com/g/mAAdhaTTah/WP-Gistpen/?branch=develop)

You use WordPress because you want control over your writing. Why give Gist or Codepen your code snippets? WP-Gistpen is a self-hosted replacement for your WordPress blog.

Features include:

* Revision saving
* Gist import & export
* ACE editor
* PrismJS syntax highlighting
* Supported Languages
	- Assembly (NASM)
	- ActionScript
	- AppleScript
	- Bash
	- C
	- Coffeescript
	- C#
	- CSS
	- Dart
	- Eiffel
	- Erlang
	- Gherkin/Cucumber
	- Git/Diff
	- Go
	- Groovy
	- HAML
	- Handlebars
	- HTML
	- HTTP
	- ini
	- Jade
	- Java
	- JavaScript
	- LaTeX
	- LESS
	- Markdown
	- Matlab
	- Objective-C
	- Perl
	- PHP
	- PlainText
	- PowerShell
	- Python
	- R
	- Rust
	- Ruby
	- Sass
	- Scala
	- Scheme
	- Smarty
	- Sql
	- Swift
	- Twig
	- XML

== Installation ==

= Using the WordPress Dashboard =

1. Navigate to the 'Add New' in the plugins dashboard
2. Search for 'wp-gistpen'
3. Click 'Install Now'
4. Activate the plugin on the Plugin dashboard

= Uploading in WordPress Dashboard =

1. Download `wp-gistpen.zip` from the WordPress plugins repository.
2. Navigate to the 'Add New' in the plugins dashboard
3. Navigate to the 'Upload' area
4. Select `wp-gistpen.zip` from your computer
5. Click 'Install Now'
6. Activate the plugin in the Plugin dashboard

= Using FTP =

1. Download `wp-gistpen.zip`
2. Extract the `wp-gistpen` directory to your computer
3. Upload the `wp-gistpen` directory to the `/wp-content/plugins/` directory
4. Activate the plugin in the Plugin dashboard

== Frequently Asked Questions ==

= What are the plugin's requirements? =

First, revisions need to be enabled. They can be disabled in `wp-config.php`, but WP-Gistpen relies on them to keep everything in sync. A future version will remove this dependency, but it's currently required.

Additionally, your PHP version should be 5.3+. If you're a developer using 5.2, may God have mercy on your soul.

= How do I create a Gistpen and insert it into the post? =

To add a new Gistpen, go to Gistpens -> Add New, and paste in your code. You can enable or disable Gist syncing on a a per-Gistpen basis.

You can also create and insert a Gistpen directly into your post/page from the visual editor by clicking the code button. From the pop-up, select one of the recent Gistpens, search your Gistpens, or create a new one by pasting in your code and clicking "Insert".

After inserting the shortcode, your code will appear in your post, highlighted by [PrismJS](http://prismjs.com).

= How do I highlight specific lines in my Gistpen? =

To highlight a specific line, add `highlight="^^"`, where ^^ is a line number or range of numbers you want highlighted, like this ([via PrismJS documentation](http://prismjs.com/plugins/line-highlight/)):

* A single number refers to the line with that number
* Ranges are denoted by two numbers, separated with a hyphen (-)
* Multiple line numbers or ranges are separated by commas.
* Whitespace is allowed anywhere and will be stripped off.

Examples:

* `highlight="5"`: The 5th line
* `highlight="1-5"`: Lines 1 through 5
* `highlight="1,4"`: Line 1 and line 4
* `highlight="1-2,5,9-20"`: Lines 1 through 2, line 5, lines 9 through 20

Offset does not yet work but will be added soon.

= How do I link to a specific line? =

You can link to a specific line in your Gistpen by linking to `#gistpen-{gistpen-slug}.{lines}`. The lines don't need to be highlighted in advance for the link to work, and they will be highlighted when the link is clicked. The `{lines}` should match the same format as above.

= How do I get my Gist token from GitHub? =

1. Login to GitHub.
2. Go to Settings -> Applications.
3. Under "Personal access tokens", click "Generate New Token."
4. Give it a name, click create
	* The default settings work, but make you sure you at least include the `gist` and `user` scopes.
5. Copy the generated token.
6. Paste it into the settings page.
7. ???
8. Profit!

= How do I sync my Gistpens to Gist? =

Gistpens can be exported en masse from the Gistpens settings page. All Gistpens will be synced, only if the Gistpen hasn't been synced yet, but **regardless of whether syncing for the Gistpen is enabled**. Syncing will then be enabled on the exported Gistpens.

If you do not want this, you can enable/disable Gistpen syncing on a per-Gistpen basis. Just click the checkbox on the Gistpen edit page, and any changes will be reflected on the corresponding Gist on update. If you uncheck that box, future changes will not be reflected on Gist.

= What is the future of this plugin? =

Eventually, I hope to make this plugin interoperable with Gist, allowing you to import your current Gists, fork other people's Gists into your Gistpen, and publishing your Gistpens to Gist.

Additionally, I want to make Gistpens embeddable on other websites the same way you can embed Gists, but both of those larger features are likely a long way off.

Essentially, the idea is to build a fully-featured Gist clone in WordPress

== Screenshots ==


1. The Insert Gistpen dialog after you click the pen in the visual editor.


2. Default theme - How your code will appear in your post.


3. Twilight theme with line numbers enabled. Check out all the themes at [PrismJS.com](http://prismjs.com).


4. The current options page.


5. The options page with a token saved.


6. Gistpen editor screen with Ace editor

== Changelog ==

This change log follows the [Keep a Changelog standards](http://keepachangelog.com/). Versions follows [Semantic Versioning](http://semver.org/).

### [0.5.8] - 2015-07-26

**Fixed**

* Fixed a bug introduced in WordPress 4.2.3 where cap checks fail for `edit_post` on a post_id of 0.
* Also loosened a couple checks because null values were being cast to 0. 

= [0.5.7] - 2015-05-23 =

**Fixed**

* Use `wpdb` to get the posts table for alternate prefix and Multisite compatibility (thanks @janizde!)

= [0.5.6] - 2015-02-17 =

**Fixed**

* Logic bugs raised by Travis

= [0.5.5] - 2015-02-15 =

**Fixed**

* Fixed syncing bug, renabled everything
	- So sorry about the multiple releases. Ran into the problem after deploying, and didn't want anyone's DB to get out-of-sync. Everything looks good now, but let me know if you experience issues.

= [0.5.4] - 2015-02-14 =

**Fixed**

* Disable importing/exporting en masse until we fix export/sync bug

= [0.5.2] - 2015-02-14 =

**Fixed**

* Add new database migration to fix Gist exports of pre-0.5.0 Gistpens

= [0.5.0] - 2015-02-14 =

**Added**

* MAJOR FEATURE: Gist interoperability
	- Gistpens can be exported to Gist on a case-by-case basis
	- Most Gists can be imported into Gistpen
		+ Unsupported languages get changed to "Plaintext" - sorry!
* New Feature: Revisions and history
* Bad tests for everything :/
* New languages:
	- Actionscript
	- Applescript
	- Dart
	- Eiffel
	- Erlang
	- Gherkin
	- Git
	- Haml
	- Handlebars
	- Jade
	- LaTeX
	- LESS
	- Markdown
	- Matlab
	- NASM
	- Perl
	- Powershell
	- R
	- Rust
	- Scheme
	- Smarty

**Changed**

* CMB -> CMB2
* Massive reorganization wit namespacing + autoloading
* Unminified scripts enqueued when `WP_SCRIPT_DEBUG` is true
* ACE editor rewritten in Backbone.js
	- Saving and updating all done with AJAX
* Menu icon pen -> code
* Improved .org deployment process (No more dumbass "forgot to minify js" commits/releases)

**Fixed**

* Deleting bug
	- Files were being left behind when Zips were deleted
* Strings are now translatable
* All languages cleaned up and verified working
	- HTML & XML are split again

= [0.4.0] - 2014-10-03 =

**Added**

* MAJOR FEATURE: Multiple files can be created in a single Gistpen
	- First step towards Gist compatibility
	- The database gets upgraded to account for this, so PLEASE make a backup before you upgrade
* ACE editor

**Fixed**

* Properly escaping content display

= [0.3.1] - 2014-08-03 =

**Fixed**

* Forgot to minify JavaScripts

= [0.3.0] - 2014-08-03 =

**Changed**

* Use [PrismJS](http://prismjs.com/) over SyntaxHighlighter

**Added**

* Options page
* Theme switching 
* Line numbers plugin
* Line-highlighting
* Link to lines
* Languages:
	- C
	- Coffeescript
	- C#
	- Go
	- HTTP
	- ini
	- HTML/Markup (XML has been migrated here)
	- Objective-C
	- Swift
	- Twig

**Removed**

* Languages (*If you need any of these languages readded, please open an issue on [GitHub](https://github.com/mAAdhaTTah/WP-Gistpen) to discuss.)
	- AppleScript
	- ActionScript3
	- ColdFusion
	- CPP
	- Delphi
	- Diff
	- Erlang
	- JavaFX
	- Perl
	- Vb

= [0.2.3] - 2014-07-28 =

**Fixed**

* Uninstall/reinstall language deleting bug

= [0.2.2] - 2014-07-28 =

**Fixed**

* Fix mis-enqueued scripts (again!)

= [0.2.1] - 2014-07-27 =

**Fixed**

* Fix mis-enqueued scripts

= [0.2.0] - 2014-07-26 =

**Added**

* "Insert Gistpen" button in TinyMCE

**Updated**

* Gistpen icon
* Code organization
* README
* Build script

= [0.1.2] - 2014-07-17 =

**Fixed**

* More bugfixes

= [0.1.1] - 2014-07-17 =

**Fixed**

* Autoloader

**Changed**

* Use defined constant for dir_path

= [0.1.0] - 2014-07-17 =

**Added**

* Gistpen post type
* Embeddable in posts via shortcode
* Use SyntaxHighlighter to display

[unreleased]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/develop
[0.5.8]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.8
[0.5.7]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.7
[0.5.6]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.6
[0.5.5]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.5
[0.5.4]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.4
[0.5.2]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.2
[0.5.0]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.5.0
[0.4.0]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.4.0
[0.3.1]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.3.1
[0.3.0]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.3.0
[0.2.3]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.2.3
[0.2.2]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.2.2
[0.2.1]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.2.1
[0.2.0]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.2.0
[0.1.2]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.1.2
[0.1.1]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.1.1
[0.1.0]: https://github.com/mAAdhaTTah/WP-Gistpen/tree/0.1.0
