<?php
/**
 * Plugin Name.
 *
 * @package   WP_Gistpen
 * @author    James DiGioia <jamesorodig@gmail.com>
 * @license   GPL-2.0+
 * @link      http://jamesdigioia.com/wp-gistpen/
 * @copyright 2014 James DiGioia
 */

/**
 * Plugin class. This class works with the
 * public-facing side of the WordPress site.
 *
 * @package WP_Gistpen
 * @author  James DiGioia <jamesorodig@gmail.com>
 */
class WP_Gistpen {

	/**
	 * Plugin version, used for cache-busting of style and script file references.
	 *
	 * @var     string
	 * @since   0.1.0
	 */
	const VERSION = '0.2.2';

	/**
	 *
	 * Unique identifier for your plugin.
	 *
	 *
	 * The variable name is used as the text domain when internationalizing strings
	 * of text. Its value should match the Text Domain file header in the main
	 * plugin file.
	 *
	 * @var      string
	 * @since    0.1.0
	 */
	protected $plugin_slug = 'wp-gistpen';

	/**
	 * Instance of this class.
	 *
	 * @var      object
	 * @since    0.1.0
	 */
	protected static $instance = null;

	/**
	 * Languages currently supported
	 *
	 * @var      array
	 * @since    0.1.0
	 */
	public static $langs = array(
		'AppleScript' => 'applescript',
		'ActionScript3' => 'as3',
		'Bash' => 'bash',
		'ColdFusion' => 'cf',
		'CPP' => 'cpp',
		'CSharp' => 'csharp',
		'CSS' => 'css',
		'Delphi' => 'delphi',
		'Diff' => 'diff',
		'Erlang' => 'erl',
		'Groovy' => 'groovy',
		'Java' => 'java',
		'JavaFX' => 'jfx',
		'JScript' => 'js',
		'Perl' => 'perl',
		'PHP' => 'php',
		'PlainText' => 'plaintext',
		'Python' => 'py',
		'Ruby' => 'ruby',
		'Sass' => 'sass',
		'Scala' => 'scala',
		'Sql' => 'sql',
		'Vb' => 'vb',
		'Xml' => 'xml',
	);

	/**
	 * Initialize the plugin by setting localization and loading public scripts
	 * and styles.
	 *
	 * @since     0.1.0
	 */
	private function __construct() {

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		// Load public libraries
		$this->load_public_libraries();

		// Activate plugin when new blog is added
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

		// Load public-facing style sheet and JavaScript.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'localize_scripts' ) );

		// Remove some filters from the Gistpen content
		add_action( 'wp', array( $this, 'remove_filters' ) );

		// Add the description to the Gistpen content
		add_filter( 'the_content', array($this, 'gistpen_content_add_description' ) );

		// All the init hooks
		add_action( 'init', array( $this, 'init' ) );

		// Add the gistpen shortcode
		add_shortcode( 'gistpen', array( $this, 'add_shortcode' ) );

	}

	/**
	 * Return the plugin slug.
	 *
	 * @return    Plugin slug variable.
	 * @since    0.1.0
	 */
	public function get_plugin_slug() {
		return $this->plugin_slug;
	}

	/**
	 * Return an instance of this class.
	 *
	 * @return    object    A single instance of this class.
	 * @since     0.1.0
	 */
	public static function get_instance() {

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Fired when the plugin is activated.
	 *
	 * @param    boolean    $network_wide    True if WPMU superadmin uses
	 *                                       "Network Activate" action, false if
	 *                                       WPMU is disabled or plugin is
	 *                                       activated on an individual blog.
	 * @since    0.1.0
	 */
	public static function activate( $network_wide ) {

		if ( function_exists( 'is_multisite' ) && is_multisite() ) {

			if ( $network_wide  ) {

				// Get all blog ids
				$blog_ids = self::get_blog_ids();

				foreach ( $blog_ids as $blog_id ) {

					switch_to_blog( $blog_id );
					self::single_activate();

					restore_current_blog();
				}

			} else {
				self::single_activate();
			}

		} else {
			self::single_activate();
		}

	}

	/**
	 * Fired when the plugin is deactivated.
	 *
	 * @param    boolean    $network_wide    True if WPMU superadmin uses
	 *                                       "Network Deactivate" action, false if
	 *                                       WPMU is disabled or plugin is
	 *                                       deactivated on an individual blog.
	 * @since    0.1.0
	 */
	public static function deactivate( $network_wide ) {

		if ( function_exists( 'is_multisite' ) && is_multisite() ) {

			if ( $network_wide ) {

				// Get all blog ids
				$blog_ids = self::get_blog_ids();

				foreach ( $blog_ids as $blog_id ) {

					switch_to_blog( $blog_id );
					self::single_deactivate();

					restore_current_blog();

				}

			} else {
				self::single_deactivate();
			}

		} else {
			self::single_deactivate();
		}

	}

	/**
	 * Load all the libraries used on the front-end
	 *
	 * @since    0.1.0
	 */
	public function load_public_libraries() {

		$files = array(
			'wp-plugins/single-value-taxonomy-ui/single-value.php'
		);

		foreach ($files as $file) {
			require_once( WP_GISTPEN_DIR . 'includes/' . $file );
		}

	}

	/**
	 * Fired when a new site is activated with a WPMU environment.
	 *
	 * @param    int    $blog_id    ID of the new blog.
	 * @since    0.1.0
	 */
	public function activate_new_site( $blog_id ) {

		if ( 1 !== did_action( 'wpmu_new_blog' ) ) {
			return;
		}

		switch_to_blog( $blog_id );
		self::single_activate();
		restore_current_blog();

	}

	/**
	 * Get all blog ids of blogs in the current network that are:
	 * - not archived
	 * - not spam
	 * - not deleted
	 *
	 * @return   array|false    The blog ids, false if no matches.
	 * @since    0.1.0
	 */
	private static function get_blog_ids() {

		global $wpdb;

		// get an array of blog ids
		$sql = "SELECT blog_id FROM $wpdb->blogs
			WHERE archived = '0' AND spam = '0'
			AND deleted = '0'";

		return $wpdb->get_col( $sql );

	}

	/**
	 * Fired for each blog when the plugin is activated.
	 *
	 * @since    0.1.0
	 */
	public static function single_activate() {

		$instance = self::get_instance();
		$instance->register_language_taxonomy();
		$instance->add_languages();
		flush_rewrite_rules();

	}

	/**
	 * Create the languages
	 *
	 * @since    0.1.0
	 */
	public function add_languages() {

		if ( get_option( 'wp_gistpen_langs_installed') == true ) {
			return;
		}

		foreach (self::$langs as $lang => $slug) {
			$result = wp_insert_term( $lang, 'language', array( 'slug' => $slug ) );
			if ( is_wp_error( $result ) ) {
				deactivate_plugins( $this->get_plugin_slug() );
				exit( print_r($result) );
			}
		}

		update_option( 'wp_gistpen_langs_installed', true );

	}

	/**
	 * Fired for each blog when the plugin is deactivated.
	 *
	 * @since    0.1.0
	 */
	public static function single_deactivate() {

		$terms = get_terms( 'language', array('get' => 'all') );

		if ( !empty( $terms ) && !is_wp_error( $terms ) ){
			foreach ($terms as $term ) {
				$result = wp_delete_term( $term->term_id, 'language' );
				if ( is_wp_error( $result ) ) {
					// @todo write error message and exit
				}
			}
		}

	}

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    0.1.0
	 */
	public function load_plugin_textdomain() {
		$domain = $this->plugin_slug;
		$locale = apply_filters( 'plugin_locale', get_locale(), $domain );

		load_textdomain( $domain, trailingslashit( WP_LANG_DIR ) . $domain . '/' . $domain . '-' . $locale . '.mo' );
		load_plugin_textdomain( $domain, FALSE, basename( plugin_dir_path( dirname( __FILE__ ) ) ) . '/languages/' );
	}

	/**
	 * Register and enqueue public-facing style sheet.
	 *
	 * @since    0.1.0
	 */
	public function enqueue_styles() {
		// wp_enqueue_style( $this->plugin_slug . '-plugin-styles', plugins_url( 'assets/css/wp-gistpen-public.css', __FILE__ ), array(), self::VERSION );
		wp_enqueue_style( 'syntaxhighlighter-style-core', plugins_url( 'assets/vendor/SyntaxHighlighter/styles/shCore.css', __FILE__ ), array(), self::VERSION );
		wp_enqueue_style( 'syntaxhighlighter-style-default', plugins_url( 'assets/vendor/SyntaxHighlighter/styles/shCoreDefault.css', __FILE__ ), array(), self::VERSION );
	}

	/**
	 * Register and enqueues public-facing JavaScript files.
	 *
	 * @since    0.1.0
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_slug . '-plugin-script', plugins_url( 'assets/js/wp-gistpen.min.js', __FILE__ ), array( 'jquery' ), self::VERSION );
	}

	/**
	 * Localize data for script
	 *
	 * @since    0.1.0
	 */
	public function localize_scripts() {
		wp_localize_script( $this->plugin_slug . '-plugin-script', 'PLUGIN_DIR', array( WP_GISTPEN_URL ) );
	}

	/**
	 * Functions on init action hook
	 *
	 * @since    0.1.0
	 */
	public function init() {
		$this->register_new_post_type();
		$this->register_language_taxonomy();
	}

	/**
	 * Register the Gistpen post_type
	 *
	 * @since    0.1.0
	 */
	public function register_new_post_type() {
		$labels = array(
			'name'                => _x( 'Gistpens', 'Post Type General Name', 'wp-gistpen' ),
			'singular_name'       => _x( 'Gistpen', 'Post Type Singular Name', 'wp-gistpen' ),
			'menu_name'           => __( 'Gistpens', 'wp-gistpen' ),
			'parent_item_colon'   => __( '', 'wp-gistpen' ),
			'all_items'           => __( 'All Gistpens', 'wp-gistpen' ),
			'view_item'           => __( 'View Gistpen', 'wp-gistpen' ),
			'add_new_item'        => __( 'Add New Gistpen', 'wp-gistpen' ),
			'add_new'             => __( 'Add New', 'wp-gistpen' ),
			'edit_item'           => __( 'Edit Gistpen', 'wp-gistpen' ),
			'update_item'         => __( 'Update Gistpen', 'wp-gistpen' ),
			'search_items'        => __( 'Search Gistpens', 'wp-gistpen' ),
			'not_found'           => __( 'Gistpen Not found', 'wp-gistpen' ),
			'not_found_in_trash'  => __( 'Gistpen Not found in Trash', 'wp-gistpen' ),
		);
		$args = array(
			'label'               => __( 'wp-gistpen', 'wp-gistpen' ),
			'description'         => __( 'Gistpen description', 'wp-gistpen' ),
			'labels'              => $labels,
			'supports'            => array( 'title', 'editor', 'author', 'comments', 'revisions' ),
			'taxonomies'          => array( 'post_tag', 'language' ),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 5,
			'can_export'          => true,
			'has_archive'         => true,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'menu_icon'           => 'dashicons-edit'
		);
		register_post_type( 'gistpens', $args );
	}

	/**
	 * Register the language taxonomy
	 *
	 * @since    0.1.0
	 */
	public function register_language_taxonomy() {

		$labels = array(
			'name'                       => _x( 'Languages', 'Taxonomy General Name', 'wp-gistdown' ),
			'singular_name'              => _x( 'Language', 'Taxonomy Singular Name', 'wp-gistdown' ),
			'menu_name'                  => __( 'Language', 'wp-gistdown' ),
			'all_items'                  => __( 'All Languages', 'wp-gistdown' ),
			'parent_item'                => __( 'Parent Language', 'wp-gistdown' ),
			'parent_item_colon'          => __( 'Parent Language:', 'wp-gistdown' ),
			'new_item_name'              => __( 'New Language', 'wp-gistdown' ),
			'add_new_item'               => __( 'Add New Language', 'wp-gistdown' ),
			'edit_item'                  => __( 'Edit Language', 'wp-gistdown' ),
			'update_item'                => __( 'Update Language', 'wp-gistdown' ),
			'separate_items_with_commas' => __( 'Separate language with commas', 'wp-gistdown' ),
			'search_items'               => __( 'Search languages', 'wp-gistdown' ),
			'add_or_remove_items'        => __( 'Add or remove language', 'wp-gistdown' ),
			'choose_from_most_used'      => __( 'Choose from the most used languages', 'wp-gistdown' ),
			'not_found'                  => __( 'Not Found', 'wp-gistdown' ),
		);
		$capabilities = array(
			'manage_terms'               => 'noone',
			'edit_terms'                 => 'noone',
			'delete_terms'               => 'noone',
			'assign_terms'               => 'edit_posts',
		);
		$args = array(
			'labels'                     => $labels,
			'hierarchical'               => false,
			'public'                     => true,
			'show_ui'                    => true,
			'show_admin_column'          => true,
			'show_in_nav_menus'          => true,
			'show_tagcloud'              => false,
			'required'                   => true,
			'single_value'               => true,
			'capabilities'               => $capabilities
		);

		register_taxonomy( 'language', array( 'gistpens' ), $args );

	}

	/**
	 * Remove extra filters from the Gistpen content
	 *
	 * @since    0.1.0
	 */
	public function remove_filters() {

		if( 'gistpens' == get_post_type() ) {
			remove_filter( 'the_content', 'wpautop' );
			remove_filter( 'the_content', 'wptexturize' );
			remove_filter('get_the_excerpt', 'wp_trim_excerpt');
		}
	}

	/**
	 * Add the Gistpen content field to the_content
	 *
	 * @param string $atts shortcode attributes
	 * @return string post_content
	 * @since    0.1.0
	 */
	public function gistpen_content_add_description( $content ) {
		global $post;

		if( $post->post_type == 'gistpens' ) {
			$content = $this->add_description( $this->add_tags_and_classes( $post ) );
		}

		return $content;
	}

	/**
	 * Register the shortcode to embed the Gistpen
	 *
	 * @param    array      $atts    attributes passed into the shortcode
	 * @return   string
	 * @since    0.1.0
	 */
	public function add_shortcode( $atts ) {
		$args = shortcode_atts( array(
			'id' => null),
			$atts,
			'gistpen'
		);

		// If the user didn't provide an ID, raise an error
		if( $args['id'] == null ) {
			return '<div class="gistpen-error">No Gistpen ID was provided.</div>';
		}

		$args = array(
			//Post & Page Parameters
			'post__in'     => array( $args['id'] ),
			//Type & Status Parameters
			'post_type'   => 'gistpens'
		);
		$query = new WP_Query( $args );

		$gistpen = array_pop( $query->posts );
		$content = $this->add_tags_and_classes( $gistpen );

		return $content;

	}

	/**
	 * Wrap content in code tags
	 * and add gistpen & language classes
	 *
	 * @param    object   $gistpen    gistpen post object
	 * @return   string               the tagged and classed content
	 * @since    0.1.0
	 */
	public function add_tags_and_classes( $gistpen ) {

		$terms = get_the_terms( $gistpen->ID, 'language' );
		if( $terms ) {
			$lang = array_pop( $terms );
			$content = '<pre class="gistpen brush: '. $lang->slug . '">' . $gistpen->post_content . '</pre>';
		} else {
			$content = '<pre class="gistpen">' . $gistpen->post_content . '</pre>';
		}

		return $content;

	}

	/**
	 * Add Gistpen description to content
	 *
	 * @param  string   $content   post_content
	 * @return string              the content with description
	 * @since    0.1.0
	 */
	public function add_description( $content ) {
		global $post;

		// Grab the description text
		$description_text = get_post_meta( $post->ID, '_wpgp_gistpen_description', true );

		// Wrap it
		$description_html = '<div class="gistpen-description">';
		$description_html .= $description_text;
		$description_html .= '</div>';

		// Add it to the content
		$content .= $description_html;

		return $content;

	}

}
