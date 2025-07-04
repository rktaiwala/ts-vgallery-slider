/**
 * Product Gallery Slider - Main JavaScript (v1.3.0)
 */

class ProductGallery {
    constructor(element) {
        this.galleryWrapper = element;
        if (!this.galleryWrapper) return;

        this.eventListeners = []; // Store listeners for easy removal
        this.initialize();
    }

    initialize() {
        this.bindElements();
        this.setState();
        this.generateDots();
        this.setupEventListeners();
        this.updateGalleryState();
    }

    bindElements() {
        this.imageStack = this.galleryWrapper.querySelector('.pgs-image-stack');
        this.images = this.galleryWrapper.querySelectorAll('.pgs-image-to-zoom');
        this.imageContainers = this.galleryWrapper.querySelectorAll('.pgs-image-container');
        this.prevBtn = this.galleryWrapper.querySelector('.pgs-prev-btn');
        this.nextBtn = this.galleryWrapper.querySelector('.pgs-next-btn');
        this.sliderTrack = this.galleryWrapper.querySelector('.pgs-slider-track');
        this.sliderThumb = this.galleryWrapper.querySelector('.pgs-slider-thumb');
        this.mobileNavDotsContainer = this.galleryWrapper.querySelector('.pgs-mobile-nav-dots');
        this.lightbox = this.galleryWrapper.querySelector('.pgs-lightbox');
        this.lightboxImg = this.galleryWrapper.querySelector('.pgs-lightbox-img');
        this.lightboxClose = this.galleryWrapper.querySelector('.pgs-lightbox-close');
    }

    setState() {
        this.isMobile = window.matchMedia('(max-width: 767px)').matches;
        this.currentImageIndex = 0;
        this.isZoomed = false;
        this.zoomedImage = null;
        this.isDragging = false;
        this.imageHeight = 0;
    }

    generateDots() {
        this.mobileNavDotsContainer.innerHTML = '';
        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.dataset.index = index;
            this.mobileNavDotsContainer.appendChild(dot);
        });
    }
    
    updateGalleryState() {
        if (this.isMobile) {
            this.imageStack.classList.add('carousel-track');
            this.imageContainers.forEach(c => c.classList.add('carousel-item'));
            this.imageStack.style.transform = `translateX(-${this.currentImageIndex * 100}%)`;
            this.updateDots();
        } else {
            this.imageStack.classList.remove('carousel-track');
            this.imageContainers.forEach(c => c.classList.remove('carousel-item'));
            this.imageHeight = this.imageStack.clientHeight;
            this.imageStack.scrollTop = this.currentImageIndex * this.imageHeight;
            this.updateSlider();
        }
    }

    setupEventListeners() {
        this.destroy(); // Clean up before adding new listeners

        this.addEvent(window, 'resize', () => this.handleResize());
        this.addEvent(this.lightboxClose, 'click', () => this.closeLightbox());
        this.mobileNavDotsContainer.querySelectorAll('.dot').forEach(dot => {
            this.addEvent(dot, 'click', () => this.handleDotClick(parseInt(dot.dataset.index)));
        });

        if (this.isMobile) {
            this.addEvent(this.imageStack, 'touchstart', (e) => this.touchStart(e), { passive: true });
            this.addEvent(this.imageStack, 'touchmove', (e) => this.touchMove(e), { passive: true });
            this.addEvent(this.imageStack, 'touchend', () => this.touchEnd());
            this.imageContainers.forEach(container => {
                this.addEvent(container, 'click', (e) => this.handleImageClick(e));
            });
        } else {
            this.addEvent(this.imageStack, 'scroll', () => this.updateSlider());
            this.addEvent(this.galleryWrapper, 'wheel', (e) => this.handleWheelScroll(e), { passive: false });
            this.addEvent(this.prevBtn, 'click', () => this.handleButtonClick(-1));
            this.addEvent(this.nextBtn, 'click', () => this.handleButtonClick(1));
            this.addEvent(this.sliderThumb, 'mousedown', (e) => this.startDrag(e));
            this.addEvent(document, 'mousemove', (e) => this.onDrag(e));
            this.addEvent(document, 'mouseup', () => this.stopDrag());
            
            // Stable zoom event listeners
            this.imageContainers.forEach(container => {
                this.addEvent(container, 'click', (e) => this.handleImageClick(e));
                this.addEvent(container, 'mousemove', (e) => this.handleZoomMove(e));
                this.addEvent(container, 'mouseleave', (e) => this.handleZoomLeave(e));
            });
        }
    }
    
    addEvent(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    destroy() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
    }

    handleResize() {
        const newIsMobile = window.matchMedia('(max-width: 767px)').matches;
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            if (this.isZoomed && this.zoomedImage) {
                this.toggleZoom(this.zoomedImage); // Unzoom before switching
            }
            this.setupEventListeners();
            this.updateGalleryState();
        }
    }
    
    // --- Mobile Logic ---
    handleDotClick(index) { this.currentImageIndex = index; this.updateGalleryState(); }
    updateDots() { this.mobileNavDotsContainer.querySelectorAll('.dot').forEach((dot, index) => { dot.classList.toggle('active', index === this.currentImageIndex); }); }
    touchStart(e) { this.isSwiping = true; this.touchStartX = e.touches[0].clientX; this.prevTranslate = -this.currentImageIndex * this.imageStack.offsetWidth; this.imageStack.style.transition = 'none'; }
    touchMove(e) { if (!this.isSwiping) return; this.touchMoveX = e.touches[0].clientX; this.currentTranslate = this.prevTranslate + this.touchMoveX - this.touchStartX; this.imageStack.style.transform = `translateX(${this.currentTranslate}px)`; }
    touchEnd() { this.isSwiping = false; const movedBy = this.touchMoveX - this.touchStartX; this.imageStack.style.transition = 'transform 0.3s ease-out'; if (movedBy < -50 && this.currentImageIndex < this.images.length - 1) this.currentImageIndex++; if (movedBy > 50 && this.currentImageIndex > 0) this.currentImageIndex--; this.updateGalleryState(); }
    openLightbox(src) { this.lightboxImg.src = src; this.lightbox.classList.add('active'); this.addEvent(this.lightboxImg, 'touchstart', (e) => this.pinchStart(e)); this.addEvent(this.lightboxImg, 'touchmove', (e) => this.pinchMove(e)); this.addEvent(this.lightboxImg, 'touchend', () => this.pinchEnd()); }
    closeLightbox() { this.lightbox.classList.remove('active'); this.resetPinchZoom(); }
    getPinchDist(e) { return Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); }
    pinchStart(e) { if (e.touches.length === 2) { this.initialPinchDist = this.getPinchDist(e); } }
    pinchMove(e) { if (e.touches.length === 2 && this.initialPinchDist) { const newDist = this.getPinchDist(e); const scale = (newDist / this.initialPinchDist) * this.currentScale; this.lightboxImg.style.transform = `scale(${Math.max(1, scale)})`; } }
    pinchEnd() { if (this.initialPinchDist) { this.currentScale = parseFloat(this.lightboxImg.style.transform.replace('scale(', '')) || 1; this.initialPinchDist = null; } }
    resetPinchZoom() { this.currentScale = 1; this.lightboxImg.style.transform = 'scale(1)'; }

    // --- Desktop Logic ---
    handleImageClick(e) { const img = e.currentTarget.querySelector('.pgs-image-to-zoom'); if (!img) return; if (this.isMobile) { this.openLightbox(img.src); } else { this.toggleZoom(img); } }
    updateSlider() { if (this.isMobile) return; const scrollableHeight = this.imageStack.scrollHeight - this.imageStack.clientHeight; if (scrollableHeight <= 0) { this.sliderThumb.style.top = '0px'; return; } const scrollFraction = this.imageStack.scrollTop / scrollableHeight; const trackHeight = this.sliderTrack.clientHeight; const thumbHeight = this.sliderThumb.clientHeight; const thumbMaxTop = trackHeight - thumbHeight; this.sliderThumb.style.top = `${scrollFraction * thumbMaxTop}px`; }
    handleWheelScroll(e) { if (this.isZoomed) return; e.preventDefault(); this.imageStack.scrollTop += e.deltaY; }
    handleButtonClick(direction) { if (!this.imageHeight) this.imageHeight = this.imageStack.clientHeight; const currentScroll = this.imageStack.scrollTop; const newScrollTop = currentScroll + (direction * this.imageHeight); this.imageStack.scrollTo({ top: newScrollTop, behavior: 'smooth' }); }
    startDrag(e) { e.preventDefault(); this.isDragging = true; this.dragStartY = e.clientY; this.thumbStartTop = this.sliderThumb.offsetTop; this.sliderThumb.style.backgroundColor = '#4b5563'; document.body.style.cursor = 'grabbing'; this.sliderThumb.style.cursor = 'grabbing'; }
    onDrag(e) { if (!this.isDragging) return; e.preventDefault(); const deltaY = e.clientY - this.dragStartY; const trackHeight = this.sliderTrack.clientHeight; const thumbHeight = this.sliderThumb.clientHeight; const thumbMaxTop = trackHeight - thumbHeight; let newThumbTop = this.thumbStartTop + deltaY; newThumbTop = Math.max(0, Math.min(newThumbTop, thumbMaxTop)); const scrollFraction = thumbMaxTop > 0 ? newThumbTop / thumbMaxTop : 0; const scrollableHeight = this.imageStack.scrollHeight - this.imageStack.clientHeight; if (scrollableHeight > 0) this.imageStack.scrollTop = scrollFraction * scrollableHeight; }
    stopDrag() { if (!this.isDragging) return; this.isDragging = false; this.sliderThumb.style.backgroundColor = '#6b7280'; document.body.style.cursor = 'default'; this.sliderThumb.style.cursor = 'grab'; }
    
    toggleZoom(img) {
        if (!img) return;
        const currentlyIsZoomed = img.classList.contains('zoomed');
        
        // If another image is zoomed, unzoom it first.
        if (this.isZoomed && this.zoomedImage && this.zoomedImage !== img) {
            this.zoomedImage.classList.remove('zoomed');
        }
        
        img.classList.toggle('zoomed');
        this.isZoomed = !currentlyIsZoomed;
        this.zoomedImage = this.isZoomed ? img : null;
        
        if (!this.isZoomed) {
             img.style.transformOrigin = 'center center';
        }
    }

    handleZoomMove(e) {
        if (!this.isZoomed || !this.zoomedImage) return;
        const img = e.currentTarget.querySelector('.pgs-image-to-zoom');
        if (img !== this.zoomedImage) return;

        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    }

    handleZoomLeave(e) {
        if (!this.isZoomed || !this.zoomedImage) return;
        const img = e.currentTarget.querySelector('.pgs-image-to-zoom');
        if (img === this.zoomedImage) {
            this.toggleZoom(img);
        }
    }
}

window.pgsGalleries = {};
document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.pgs-gallery-wrapper');
    galleries.forEach(galleryElement => {
        const galleryId = galleryElement.id;
        if (galleryId) {
            window.pgsGalleries[galleryId] = new ProductGallery(galleryElement);
        }
    });
});
