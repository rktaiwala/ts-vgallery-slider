# Product Gallery Slider

A modular, responsive product gallery for WordPress with a vertical desktop slider and a swipe carousel for mobile. Built to be lightweight and easy to drop into themes or a WooCommerce product page.

- Plugin Name: Product Gallery Slider
- Author: Rahul Taiwala — https://techsarathy.com
- License: GPL-2.0-or-later

## Overview

Product Gallery Slider provides:
- A vertical slider control for desktop (drag the slider thumb, or scroll/wheel).
- A swipeable carousel on mobile with navigation dots.
- Click-to-open lightbox with touch pinch-to-zoom support.
- Smooth scroll snapping and image hover/zoom behavior on desktop.
- A simple shortcode to render a gallery from image IDs, and an optional WooCommerce integration when WooCommerce is active.

This README was created from the repository files (`ts-vgallery-slider.php`, `assets/js/main.js`, and `assets/css/style.css`).

## Installation

1. Place the `ts-vgallery-slider` folder in your WordPress `wp-content/plugins/` directory.
2. Activate the plugin from the WordPress admin Plugins screen.
3. Use the shortcode (see below) to add a gallery to a page/post.

The plugin enqueues:
- CSS: `assets/css/style.css` (version: 1.3.3)
- JS: `assets/js/main.js` (version: 1.3.1)

(Asset version numbers are taken from the plugin's enqueue calls.)

## Shortcode

Basic usage:

[product_gallery ids="123,124,125"]

- `ids` — comma-separated list of attachment IDs (required).
- The plugin generates a unique gallery wrapper ID automatically for each rendered gallery. The gallery wrapper ID is used to store the JS instance.

Note: The shortcode is registered as `product_gallery` in the plugin.

## Markup / CSS classes

When rendered, the gallery markup contains the following structure and classes. You can target these in your theme CSS to customize appearance or behavior:

- `.pgs-gallery-wrapper` — top-level gallery wrapper (each gallery has an id, e.g. `pgs-gallery-<uniqid>`).
- `.pgs-gallery-container` — inner container.
- `.pgs-image-stack` — the scrollable stack (carousel) of images.
- `.pgs-image-container` — each image wrapper.
- `.pgs-image-to-zoom` — image element with zoom/interaction behavior.
- `.pgs-slider-controls` — desktop slider controls container.
- `.pgs-prev-btn`, `.pgs-next-btn` — prev/next buttons (SVG icons).
- `.pgs-slider-track-wrapper`, `.pgs-slider-track`, `.pgs-slider-thumb` — vertical slider track and draggable thumb.
- `.pgs-mobile-nav-dots` — mobile navigation dots container.
- `.pgs-mobile-nav-dots .dot` — individual dot; `.dot.active` marks the active slide.
- `.pgs-lightbox` — the lightbox overlay (hidden by default).
- `.pgs-lightbox-img` — image inside the lightbox.
- `.pgs-lightbox-close` — lightbox close button.

## JavaScript API / Integration points

- The plugin initializes one JS instance per gallery and stores instances in `window.pgsGalleries` keyed by gallery ID (e.g. `window.pgsGalleries['pgs-gallery-...']`). You can inspect the instance in the browser console for debugging or advanced integrations.

- Main behaviors implemented in `assets/js/main.js`:
  - Desktop: wheel scrolling maps to image stack scroll, next/prev button, vertical slider with drag support.
  - Mobile: swipe navigation with touchstart/touchmove/touchend handling and navigation dots.
  - Lightbox: click image to open, pinch-to-zoom handlers on touch devices, reset/close functionality.
  - Zoom preview on desktop (mousemove over image) and stable zoom interactions.

Refer to `assets/js/main.js` for specific method names and event hooks.

## Customization

- Styling: Override or extend `assets/css/style.css` using your theme stylesheet or enqueue another stylesheet loaded after the plugin styles. Target the classes listed above.
- Behavior: You can interact with gallery instances in `window.pgsGalleries` to call instance methods or modify state at runtime. (Inspect the instance to see available methods such as lifecycle helpers, event handlers, or destroy method.)
- To change markup output or behavior server-side, modify `ts-vgallery-slider.php` or provide a custom template (advanced).

## WooCommerce

If WooCommerce is active, the plugin conditionally loads a WooCommerce integration file (`includes/woocommerce-integration.php`). This integration is only included when the WooCommerce plugin is present.

## Accessibility & UX notes

- Controls use large hit targets and visible SVG icons for prev/next.
- The lightbox background and close button are provided; keyboard interactions should be verified and enhanced for full accessibility if needed.
- Mobile gestures (swipe, pinch-to-zoom) are supported; test on target devices for the best experience.

## Troubleshooting

- If images do not appear, ensure you passed valid attachment IDs to the `ids` shortcode attribute and the images exist in the Media Library.
- If styles or scripts don’t load, verify the plugin is active and your theme or another plugin is not deregistering/enqueueing conflicting assets.
- For multiple galleries on the same page, each gallery gets a unique ID and a separate JS instance.

## Development

- Main source files:
  - PHP: `ts-vgallery-slider.php`
  - JS: `assets/js/main.js`
  - CSS: `assets/css/style.css`
- The JS includes a class `ProductGallery` that handles initialization, event binding, mobile/desktop modes, and lightbox/pinch zoom logic.
- Use `document.addEventListener('DOMContentLoaded', ...)` initialization — instances are created automatically for each `.pgs-gallery-wrapper` element.

## Contributing

Contributions, bug reports, and enhancements are welcome. Please open issues or PRs in the repository.

## Changelog (high level)

- v1.0.0 — initial plugin header version
- Assets show newer internal versions (script/style versions in enqueue calls) — refer to asset headers and enqueue versions for more granular asset changes.

## License

Released under the GPL-2.0-or-later. See the plugin header and LICENSE for details.

---

If you'd like, I can:
- Add usage examples with actual shortcode output HTML,
- Expand the Accessibility section with recommended keyboard interactions,
- Or produce a quick demo page showing the required markup for non-WordPress usage.
```
