<?php
/*
Plugin Name: Single Value Taxonomy UI
Description: This infrastructure plugin adds basic UI for single-valued taxonomies, i.e. a taxonomy with presents a <code>select</code> widget.
Version: 0.3
Author: mitcho (Michael Yoshitaka Erlewine)
Author URI: http://mitcho.com/
Donate link: http://tinyurl.com/donatetomitcho
*/

function add_single_value_meta_boxes() {
	foreach ( get_taxonomies( array( 'show_ui' => true ), 'object' ) as $taxonomy ) {
		if ( !isset($taxonomy->single_value) || !$taxonomy->single_value )
			continue;

		foreach ( $taxonomy->object_type as $object_type ) {
			remove_meta_box('tagsdiv-' . $taxonomy->name, $object_type, 'side');
			add_meta_box('tagsdiv-' . $taxonomy->name, $taxonomy->labels->singular_name, 'tax_single_value_meta_box', $object_type, 'side', 'default', array( 'taxonomy' => $taxonomy->name ));		
		}
	}
}
add_action('add_meta_boxes', 'add_single_value_meta_boxes');

function tax_single_value_meta_box($post, $box) {
	if ( !isset($box['args']) || !is_array($box['args']) )
		$args = array();
	else
		$args = $box['args'];
	extract( wp_parse_args($args), EXTR_SKIP );
	$tax_name = esc_attr($taxonomy);
	$taxonomy = get_taxonomy($taxonomy);
	$disabled = !current_user_can($taxonomy->cap->assign_terms) ? 'disabled="disabled"' : '';
	echo "<select name='tax_input[{$tax_name}]' $disabled>";
	if ( !isset($taxonomy->required) || !$taxonomy->required )
		echo "<option value=''>(" . sprintf(__('no %s'), $taxonomy->labels->singular_name) . ")</option>";

	echo wp_terms_checklist($post->ID, array( 'taxonomy' => $taxonomy->name, 'selected_cats' => $post->ID, 'walker' => new Walker_Taxonomy_Select) );
	echo "</select>";
}
class Walker_Taxonomy_Select extends Walker {
	var $tree_type = 'taxonomy_select';
	var $db_fields = array ('parent' => 'parent', 'id' => 'term_id');

	function start_lvl(&$output, $depth, $args) {
	}

	function end_lvl(&$output, $depth, $args) {
	}

	function start_el(&$output, $term, $depth, $args) {
		$indent = str_repeat("\t", $depth);

		extract($args);
		if ( $taxonomy == 'category' )
			$name = 'post_category';
		else
			$name = "tax_input[{$taxonomy}]";

		$class = '';
		$output .= "\n<option id='{$taxonomy}-{$term->term_id}'$class value='". esc_attr( $term->name ) . "'" . selected( in_array( $term->term_id, $selected_cats ), true, false ) . disabled( empty( $args['disabled'] ), false, false ) . ' /> ' . $indent . esc_html( apply_filters('the_category', $term->name )) . '</option>';
	}

	function end_el(&$output, $category, $depth, $args) {
	}
}
