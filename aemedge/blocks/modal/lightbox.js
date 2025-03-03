import { decorateIcons } from '../../scripts/aem.js';

export class Lightbox {
  constructor() {
    this.dialog = null;
    this.currentIndex = 0;
    this.images = [];
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Find all images that should be part of the lightbox
    // We're targeting images in the columns block based on your sample
    const columnsBlock = document.querySelector('.columns');
    if (!columnsBlock) return;

    this.images = Array.from(columnsBlock.querySelectorAll('img'));

    if (this.images.length === 0) return;

    // Create the lightbox dialog
    this.createDialog();

    // Add click event listeners to all images
    this.images.forEach((img, index) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLightbox(index);
      });
    });

    this.initialized = true;
  }

  createDialog() {
    // Create the dialog element
    this.dialog = document.createElement('dialog');
    this.dialog.classList.add('lightbox-dialog');

    // Create the content container
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('lightbox-content');

    // Create the image container
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('lightbox-image-container');
    dialogContent.appendChild(imageContainer);

    // Create navigation buttons
    const prevButton = document.createElement('button');
    prevButton.classList.add('lightbox-nav', 'lightbox-prev');
    prevButton.setAttribute('aria-label', 'Previous image');
    prevButton.innerHTML = '<span class="icon icon-chevron-left"></span>';
    prevButton.addEventListener('click', () => this.navigate(-1));

    const nextButton = document.createElement('button');
    nextButton.classList.add('lightbox-nav', 'lightbox-next');
    nextButton.setAttribute('aria-label', 'Next image');
    nextButton.innerHTML = '<span class="icon icon-chevron-right"></span>';
    nextButton.addEventListener('click', () => this.navigate(1));

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('lightbox-close');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML = '<span class="icon icon-close"></span>';
    closeButton.addEventListener('click', () => this.dialog.close());

    // Add all elements to the dialog
    dialogContent.appendChild(prevButton);
    dialogContent.appendChild(nextButton);
    this.dialog.appendChild(dialogContent);
    this.dialog.appendChild(closeButton);

    // Add event listeners for keyboard navigation and clicking outside
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
      if (e.key === 'Escape') this.dialog.close();
    });

    this.dialog.addEventListener('click', (event) => {
      const dialogDimensions = this.dialog.getBoundingClientRect();
      if (event.clientX < dialogDimensions.left || event.clientX > dialogDimensions.right
          || event.clientY < dialogDimensions.top || event.clientY > dialogDimensions.bottom) {
        this.dialog.close();
      }
    });

    // Add close event listener
    this.dialog.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
    });

    // Decorate icons
    decorateIcons(this.dialog);

    // Add the dialog to the document
    document.body.appendChild(this.dialog);
  }

  openLightbox(index) {
    if (!this.dialog) return;

    this.currentIndex = index;
    this.updateImage();

    document.body.classList.add('lightbox-open');
    this.dialog.showModal();
  }

  updateImage() {
    const imageContainer = this.dialog.querySelector('.lightbox-image-container');
    if (!imageContainer) return;

    // Clear current image
    imageContainer.innerHTML = '';

    // Get current image
    const currentImg = this.images[this.currentIndex];
    if (!currentImg) return;

    // Create optimized version of the image for the lightbox
    const img = document.createElement('img');
    img.src = currentImg.src;
    img.alt = currentImg.alt;
    img.classList.add('lightbox-image');

    // Add image to container
    imageContainer.appendChild(img);

    // Update navigation button states
    const prevButton = this.dialog.querySelector('.lightbox-prev');
    const nextButton = this.dialog.querySelector('.lightbox-next');

    if (prevButton) {
      prevButton.disabled = this.currentIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled = this.currentIndex === this.images.length - 1;
    }
  }

  navigate(direction) {
    const newIndex = this.currentIndex + direction;

    if (newIndex >= 0 && newIndex < this.images.length) {
      this.currentIndex = newIndex;
      this.updateImage();
    }
  }
}

export default async function decorate(block) {
  // Initialize the lightbox
  const lightbox = new Lightbox();

  // We need to wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => lightbox.initialize());
  } else {
    lightbox.initialize();
  }

  return block;
}
