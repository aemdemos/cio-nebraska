// Using document.createElement instead of importing dom-helpers
function closeModal() {
  document.querySelector('.image-modal').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
}

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.style.display = 'none';

  const modalContent = document.createElement('div');
  modalContent.className = 'image-modal-content';

  const closeButton = document.createElement('span');
  closeButton.className = 'close';
  closeButton.onclick = closeModal;

  const slides = document.createElement('div');
  slides.className = 'slides';

  modalContent.appendChild(closeButton);
  modalContent.appendChild(slides);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  return modal;
}

function showImageModal(imgSrc) {
  const modal = document.querySelector('.image-modal') || createModal();

  let overlay = document.querySelector('.overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }

  const slides = modal.querySelector('.slides');
  slides.innerHTML = '';

  const slide = document.createElement('div');
  slide.className = 'slide';

  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.maxWidth = '100%';
  img.style.maxHeight = '80vh';

  slide.appendChild(img);
  slides.appendChild(slide);

  modal.style.display = 'block';
  overlay.style.display = 'block';
  overlay.onclick = closeModal;

  // Add keyboard support for closing with proper cleanup
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
}

function makeImagesClickable() {
  // Expanded selector to include more image types, especially targeting the metrics page
  const imageSelectors = [
    '.columns td img',
    '[data-lightbox="true"] img',
    'a[href^="https://final--cio-nebraska"] img',
    '.metric-info img',
    '.cards.metrics img',
    '.columns img', // Added general columns images
    '.section img', // Added all section images
    'main img', // Added all images in main content as fallback
  ];

  document.querySelectorAll(imageSelectors.join(', ')).forEach((img) => {
    // Skip images that are already processed
    if (img.hasAttribute('data-lightbox-processed')) {
      return;
    }

    img.style.cursor = 'pointer';
    img.setAttribute('data-lightbox-processed', 'true');
    img.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showImageModal(img.src);
    };

    // Add a subtle hover effect
    img.addEventListener('mouseenter', () => {
      img.style.opacity = '0.9';
    });
    img.addEventListener('mouseleave', () => {
      img.style.opacity = '1';
    });
  });
}

// Call makeImagesClickable on load and also after a delay to catch dynamically loaded images
export default function decorate() {
  // Initial call on load
  window.addEventListener('load', () => {
    makeImagesClickable();

    // Call again after a short delay to catch any images loaded after initial page load
    setTimeout(makeImagesClickable, 1000);
  });

  // Also call when DOM content is loaded (earlier than full load)
  document.addEventListener('DOMContentLoaded', makeImagesClickable);

  // Add a mutation observer to detect when new images are added to the page
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        shouldProcess = true;
      }
    });

    if (shouldProcess) {
      makeImagesClickable();
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
}
