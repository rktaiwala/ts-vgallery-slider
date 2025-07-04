<?php
/**
 * Plugin Name:       Product Gallery Slider
 * Description:       A modular and responsive product gallery with a vertical slider for desktop and a swipe carousel for mobile.
 * Version:           1.0.0
 * Author:            Rahul Taiwala
 * Author URI:        https://techsarathy.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       product-gallery-slider
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Product_Gallery_Slider {

    protected static $_instance = null;

    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_shortcode( 'product_gallery', [ $this, 'render_gallery_shortcode' ] );

        // Conditionally load WooCommerce integration if the plugin is active.
        add_action( 'plugins_loaded', [ $this, 'load_woocommerce_integration' ] );
    }

    public function load_woocommerce_integration() {
        if ( class_exists( 'WooCommerce' ) ) {
            require_once plugin_dir_path( __FILE__ ) . 'includes/woocommerce-integration.php';
        }
    }

    public function enqueue_scripts() {
        wp_enqueue_style(
            'pgs-style',
            plugin_dir_url( __FILE__ ) . 'assets/css/style.css',
            [],
            '1.3.0'
        );

        wp_enqueue_script(
            'pgs-script',
            plugin_dir_url( __FILE__ ) . 'assets/js/main.js',
            [],
            '1.3.0',
            true
        );
    }
    
    public function render_gallery_shortcode( $atts ) {
        $atts = shortcode_atts( [ 'ids' => '' ], $atts, 'product_gallery' );

        if ( empty( $atts['ids'] ) ) {
            return '<p>Product Gallery: Please provide image IDs. e.g., [product_gallery ids="1,2,3"]</p>';
        }

        $image_ids = array_map( 'trim', explode( ',', $atts['ids'] ) );
        $images    = [];

        foreach ( $image_ids as $id ) {
            $image_url = wp_get_attachment_image_url( $id, 'large' );
            if ( $image_url ) {
                $images[] = [
                    'url' => $image_url,
                    'alt' => get_the_title( $id ),
                ];
            }
        }
        
        $images = apply_filters( 'pgs_gallery_images', $images, $atts );

        ob_start();
        $this.render_gallery_html( $images );
        return apply_filters( 'pgs_gallery_html', ob_get_clean(), $images );
    }

    public function render_gallery_html( $images, $gallery_id = null ) {
        if ( empty( $images ) ) return;
        
        $gallery_id = $gallery_id ? esc_attr( $gallery_id ) : 'pgs-gallery-' . esc_attr( uniqid() );
        ?>
        <div class="pgs-gallery-wrapper" id="<?php echo $gallery_id; ?>">
            <div class="pgs-gallery-container">
                <div class="pgs-image-stack">
                    <?php foreach ( $images as $index => $image ) : ?>
                        <div class="pgs-image-container">
                            <img src="<?php echo esc_url( $image['url'] ); ?>" alt="<?php echo esc_attr( $image['alt'] ); ?>" class="pgs-image-to-zoom" data-index="<?php echo esc_attr( $index ); ?>">
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="pgs-slider-controls">
                    <button class="pgs-slider-btn pgs-prev-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg></button>
                    <div class="pgs-slider-track-wrapper"><div class="pgs-slider-track"><div class="pgs-slider-thumb"></div></div></div>
                    <button class="pgs-slider-btn pgs-next-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></button>
                </div>

                <div class="pgs-mobile-nav-dots"></div>
            </div>
            
            <div class="pgs-lightbox"><img class="pgs-lightbox-img" src="" alt="Zoomed product image"><button class="pgs-lightbox-close">&times;</button></div>
        </div>
        <?php
    }
}

Product_Gallery_Slider::instance();
