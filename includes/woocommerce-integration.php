<?php
/**
 * WooCommerce Integration for Product Gallery Slider
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PGS_WooCommerce_Integration {

    public function __construct() {
        // Allow disabling automatic replacement via a filter for page builder support
        if ( apply_filters( 'pgs_auto_replace_wc_gallery', true ) ) {
            add_action( 'woocommerce_before_single_product', [ $this, 'setup_gallery_hooks' ] );
        }

        // Add a shortcode for manual placement in page builders
        add_shortcode( 'wc_product_gallery', [ $this, 'render_gallery_shortcode' ] );
        
        // Enqueue scripts if needed
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_wc_scripts' ] );
    }

    public function setup_gallery_hooks() {
        if ( ! is_product() ) return;
        remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20 );
        add_action( 'woocommerce_before_single_product_summary', [ $this, 'render_product_gallery_for_hook' ], 20 );
    }

    public function enqueue_wc_scripts() {
        global $post;
        // Enqueue if it's a product page OR if the shortcode exists in the content
        if ( is_product() || ( is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'wc_product_gallery') ) ) {
            wp_enqueue_script(
                'pgs-wc-script',
                plugin_dir_url( __DIR__ ) . 'assets/js/woocommerce.js',
                [ 'pgs-script', 'jquery' ],
                '1.2.1',
                true
            );

            $product = wc_get_product(); 
            if ( $product && $product->is_type( 'variable' ) ) {
                wp_localize_script( 'pgs-wc-script', 'pgs_wc_params', [
                    'variation_images' => $this->get_variation_gallery_data( $product ),
                    'original_images'  => $this->get_product_gallery_images( $product )
                ] );
            }
        }
    }

    public function render_product_gallery_for_hook() {
        global $product;
        $images = $this->get_product_gallery_images( $product );
        Product_Gallery_Slider::instance()->render_gallery_html( $images );
    }

    public function render_gallery_shortcode() {
        $product = wc_get_product();
        if ( ! $product ) {
            return '<p>WooCommerce Product Gallery: This shortcode must be used on a single product page.</p>';
        }
        $images = $this->get_product_gallery_images( $product );
        ob_start();
        Product_Gallery_Slider::instance()->render_gallery_html( $images );
        return ob_get_clean();
    }

    private function get_product_gallery_images( $product ) {
        $attachment_ids = $product->get_gallery_image_ids();
        $main_image_id  = $product->get_image_id();

        if ( $main_image_id ) array_unshift( $attachment_ids, $main_image_id );
        
        $images = [];
        if ( ! empty( $attachment_ids ) ) {
            foreach ( $attachment_ids as $id ) {
                $image_url = wp_get_attachment_image_url( $id, 'large' );
                if ( $image_url ) $images[] = [ 'url' => $image_url, 'alt' => get_the_title( $id ) ];
            }
        } elseif ( has_post_thumbnail( $product->get_id() ) ) {
            $images[] = [ 'url' => get_the_post_thumbnail_url( $product->get_id(), 'large' ), 'alt' => get_the_title( $product->get_id() ) ];
        }
        return $images;
    }
    
    private function get_variation_gallery_data( $product ) {
        $variation_data = [];
        foreach ( $product->get_available_variations() as $variation ) {
            $variation_obj = wc_get_product( $variation['variation_id'] );
            $image_id = $variation_obj->get_image_id();
            $gallery_ids = $variation_obj->get_gallery_image_ids();
            
            $attachment_ids = $image_id ? array_merge([$image_id], $gallery_ids) : $gallery_ids;
            
            $images = [];
            if ( ! empty( $attachment_ids ) ) {
                foreach ( $attachment_ids as $id ) $images[] = [ 'url' => wp_get_attachment_image_url( $id, 'large' ), 'alt' => get_the_title( $id ) ];
            }
             /**
             * Filter the gallery images for a specific product variation.
             *
             * @param array $images The array of image data ([ 'url' => '', 'alt' => '' ]).
             * @param WC_Product_Variation $variation_obj The variation product object.
             * @param WC_Product $product The main product object.
             */
            $variation_data[ $variation['variation_id'] ] = apply_filters( 'pgs_variation_gallery_images', $images, $variation_obj,$variation['variation_id'], $product );
        }
        return $variation_data;
    }
}

new PGS_WooCommerce_Integration();
