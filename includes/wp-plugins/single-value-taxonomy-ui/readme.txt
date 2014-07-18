=== Single Value Taxonomy UI ===
Tags: infrastructure, taxonomy, single value, required, select, UI
Donate link: http://tinyurl.com/donatetomitcho
Contributors: mitchoyoshitaka
Tested up to: 3.4.1
Requires at least: 3.1
Stable Tag: 0.3

== Description ==
This infrastructure plugin adds basic UI for single-valued taxonomies, i.e. a taxonomy with presents a `select` widget.

= Usage =

When registering your custom taxonomy, add the argument `single_value` set to `true` to get the single value UI. If a selection of this term is required, also add `required` set to `true`.

`
register_taxonomy(
	'astrological_sign',
	array( 'person' ),
	array(
		'hierarchical' => false,
		'show_ui' => true,
		'required' => true,
		'single_value' => true
	)
);
`

Development of this plugin supported by [MIT Global Shakespeares](http://globalshakespeares.org).

== Screenshots ==

1. An example of two single value taxonomies

== Changelog ==

= 0.3 =
* [Bugfix](https://wordpress.org/support/topic/plugin-single-value-taxonomy-ui-missing-esc_attr): fixed behavior with apostrophes in terms.

= 0.2 =
* Use `singular_name`, if specified, instead of `name`. Thanks to Reuven Kaplan for the suggestion.

= 0.1 =
* Initial upload

== Installation ==

1. Upload to your plugins folder, usually `wp-content/plugins/`. Activate.
2. Create your single valued custom taxonomy. See the readme for details.
