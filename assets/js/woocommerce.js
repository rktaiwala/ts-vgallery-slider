/**
 * Product Gallery Slider - WooCommerce Integration JavaScript
 */

jQuery(function ($) {
    const pgsWooHandler = {
        galleryWrapper: $('#pgs-wc-gallery'),
        originalImages: typeof pgs_wc_params !== 'undefined' ? pgs_wc_params.original_images : null,

        init: function () {
            if (this.galleryWrapper.length) {
                // Listen for the event WooCommerce triggers when a variation is found
                $(document).on('found_variation', 'form.variations_form', this.handleVariationChange.bind(this));
                // Listen for the event when variation is reset
                $('form.variations_form').on('reset_data', this.handleVariationReset.bind(this));
            }
        },

        handleVariationChange: function (event, variation) {
            // pgs_wc_params is localized from PHP
            const variationImages = pgs_wc_params.variation_images[variation.variation_id];
            
            // If this variation has specific gallery images, update the gallery
            if (variationImages && variationImages.length > 0) {
                this.updateGallery(variationImages);
            } else if (this.originalImages) {
                // If variation has NO image, revert to the main product gallery
                this.updateGallery(this.originalImages);
            }
        },
        
        handleVariationReset: function() {
            // When attributes are cleared, revert to the original gallery images without reloading
            if (this.originalImages) {
                this.updateGallery(this.originalImages);
            }
        },

        updateGallery: function (images) {
            const galleryId = this.galleryWrapper.attr('id');

            // 1. Destroy the old gallery instance to remove listeners
            if (window.pgsGalleries && window.pgsGalleries[galleryId]) {
                window.pgsGalleries[galleryId].destroy();
            }

            // 2. Build the new HTML for the images
            let newImagesHtml = '';
            images.forEach((image, index) => {
                newImagesHtml += `
                    <div class="pgs-image-container">
                        <img src="${image.url}" alt="${image.alt}" class="pgs-image-to-zoom" data-index="${index}">
                    </div>
                `;
            });

            // 3. Replace the old images with the new ones
            this.galleryWrapper.find('.pgs-image-stack').html(newImagesHtml);

            // 4. Re-initialize the gallery with the new content
            window.pgsGalleries[galleryId] = new ProductGallery(this.galleryWrapper[0]);
        }
    };

    pgsWooHandler.init();
});
