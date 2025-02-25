import { createOptimizedPicture } from '../../scripts/aem.js';
import { Modal } from '../form/components/modal/modal.js';

export default function decorate(block) {
  // Find all pictures followed by links to #
  block.querySelectorAll('picture').forEach((picture) => {
    const nextElement = picture.nextElementSibling;
    if (nextElement && nextElement.tagName === 'A' && nextElement.getAttribute('href') === '#') {
      const img = picture.querySelector('img');

      // Create optimized thumbnail
      const thumbnail = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      thumbnail.classList.add('lightbox-thumbnail');

      // Create optimized full-size image for modal
      const fullImage = createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]);
      fullImage.classList.add('lightbox-full');

      // Create modal
      const modal = new Modal();
      const modalContent = document.createElement('div');
      modalContent.classList.add('lightbox-modal');
      modalContent.appendChild(fullImage);

      // Replace original elements with thumbnail
      picture.replaceWith(thumbnail);
      nextElement.remove();

      // Add click handler
      thumbnail.addEventListener('click', () => {
        modal.dialog = modal.createDialog(modalContent);
        document.body.appendChild(modal.dialog);
        modal.showModal();
        document.body.classList.add('modal-open');
      });
    }
  });
}
