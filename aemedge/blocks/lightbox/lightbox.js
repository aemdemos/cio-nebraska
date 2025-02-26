import { createOptimizedPicture } from '../../scripts/aem.js';
import { Modal } from '../form/components/modal/modal.js';

export default function decorate() {
  // Find all links that contain pictures
  document.querySelectorAll('a:has(picture)').forEach((link) => {
    const picture = link.querySelector('picture');
    if (picture) {
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
      
      // Prevent link navigation and show modal instead
      link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.dialog = modal.createDialog(modalContent);
        document.body.appendChild(modal.dialog);
        modal.showModal();
        document.body.classList.add('modal-open');
      });
    }
  });
}
