import { div, span } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function closeModal() {
  document.querySelector('.image-modal').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none';
}

function createModal() {
  const modal = div(
    { class: 'image-modal', style: 'display: none;' },
    div(
      { class: 'image-modal-content' },
      span({ class: 'close', onclick: closeModal }),
      div({ class: 'slides' }),
    ),
  );
  document.body.append(modal);
  return modal;
}

function showImageModal(imgSrc) {
  const modal = document.querySelector('.image-modal') || createModal();
  const overlay = document.querySelector('.overlay') || div({ class: 'overlay', style: 'display: none;' });
  document.body.append(overlay);

  const slides = modal.querySelector('.slides');
  slides.innerHTML = '';
  const slide = div(
    { class: 'slide' },
    createOptimizedPicture(imgSrc, '', true, [
      { media: '(min-width: 600px)', width: '2000' },
      { width: '750' },
    ]),
  );
  slides.append(slide);

  modal.style.display = 'block';
  overlay.style.display = 'block';
  overlay.onclick = closeModal;
  
  // Add keyboard support for closing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function makeImagesClickable() {
  // Target the specific table cells with images in your layout
  document.querySelectorAll('.columns td img, [data-lightbox="true"] img, a[href^="https://final--cio-nebraska"] img').forEach((img) => {
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
