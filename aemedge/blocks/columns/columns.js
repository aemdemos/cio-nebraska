// show gallery lightbox
function showGalleryLightbox(picture, pictures) {
  let currentIndex = Array.from(pictures).indexOf(picture);

  // First we must remove any lightboxes that are already open
  document.querySelectorAll('.lightbox').forEach(el => el.remove());

  // Create the lightbox container
  const lightbox = document.createElement('div');
  lightbox.classList.add('lightbox');

  // Function to update the picture in the lightbox
  function updatePicture(index) {
    const img = lightbox.querySelector('img');
    const originalImg = pictures[index].querySelector('img');

    // Create a new image with the original source URL (without query parameters)
    const newImg = document.createElement('img');
    const originalSrc = originalImg.src.split('?')[0];
    newImg.src = originalSrc;
    newImg.alt = originalImg.alt || '';

    img.replaceWith(newImg);
  }

  // Create the picture element with original source
  const originalImg = picture.querySelector('img');
  const img = document.createElement('img');
  const originalSrc = originalImg.src.split('?')[0];
  img.src = originalSrc;
  img.alt = originalImg.alt || '';

  lightbox.appendChild(img);

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.classList.add('lightbox-close');
  closeButton.textContent = 'Close'; // Will be hidden by text-indent
  closeButton.addEventListener('click', () => {
    document.body.removeChild(lightbox);
  });
  lightbox.appendChild(closeButton);

  // Create the next button
  const nextButton = document.createElement('button');
  nextButton.classList.add('lightbox-next');
  nextButton.textContent = 'Next'; // Will be hidden by text-indent
  nextButton.addEventListener('click', () => {
    if (currentIndex < pictures.length - 1) {
      currentIndex += 1;
      updatePicture(currentIndex);
    }
  });
  lightbox.appendChild(nextButton);

  // Create the previous button
  const prevButton = document.createElement('button');
  prevButton.classList.add('lightbox-prev');
  prevButton.textContent = 'Previous'; // Will be hidden by text-indent
  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updatePicture(currentIndex);
    }
  });
  lightbox.appendChild(prevButton);

  // Append the lightbox to the body
  document.body.appendChild(lightbox);
}

function buildGallery(block) {
  // Find all picture elements in the block
  const pictures = block.querySelectorAll('picture');
  // For each picture, add a class of "gallery-img"
  pictures.forEach((picture) => {
    const parentP = picture.closest('p');
    if (parentP) {
      parentP.style.cursor = 'pointer';
      parentP.addEventListener('click', () => {
        showGalleryLightbox(picture, pictures);
      });
    }
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  // check if the block has a class of "gallery"
  if (block.classList.contains('gallery')) {
    buildGallery(block);
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
