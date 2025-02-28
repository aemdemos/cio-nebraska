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
  // Target the specific table cells with images in your layout
  document.querySelectorAll('.columns td img, [data-lightbox="true"] img, a[href^="https://final--cio-nebraska"] img, .metric-info img, .cards.metrics img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.onclick = (e) => {
      e.preventDefault();
      showImageModal(img.src);
    };
  });
}

export default function decorate() {
  window.addEventListener('load', makeImagesClickable);
}
