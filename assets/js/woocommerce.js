/**
 * Product Gallery Slider - WooCommerce Integration JavaScript
 */

jQuery(function ($) {
    const pgsWooHandler = {
        // Select all gallery wrappers on a single product page.
        // WooCommerce adds the 'single-product' class to the body tag.
        galleryWrappers: $('.single-product .pgs-gallery-wrapper'),
        originalImages: typeof pgs_wc_params !== 'undefined' ? pgs_wc_params.original_images : null,

        init: function () {
            if (this.galleryWrappers.length) {
                // Listen for the event WooCommerce triggers when a variation is found
                $(document).on('found_variation', 'form.variations_form', this.handleVariationChange.bind(this));
                // Listen for the event when variation is reset
                $('form.variations_form').on('reset_data', this.handleVariationReset.bind(this));
            }
        },

        handleVariationChange: function (event, variation) {
            const variationImages = pgs_wc_params.variation_images[variation.variation_id];
            
            if (variationImages && variationImages.length > 0) {
                this.updateAllGalleries(variationImages);
            } else if (this.originalImages) {
                this.updateAllGalleries(this.originalImages);
            }
        },
        
        handleVariationReset: function() {
            if (this.originalImages) {
                this.updateAllGalleries(this.originalImages);
            }
        },

        updateAllGalleries: function (images) {
            // Iterate over each gallery instance on the page (e.g., one for mobile, one for desktop)
            this.galleryWrappers.each((index, galleryWrapperElement) => {
                const galleryWrapper = $(galleryWrapperElement);
                const galleryId = galleryWrapper.attr('id');

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
                galleryWrapper.find('.pgs-image-stack').html(newImagesHtml);

                // 4. Re-initialize the gallery with the new content
                window.pgsGalleries[galleryId] = new ProductGallery(galleryWrapper[0]);
            });
        }
    };

    pgsWooHandler.init();
});
