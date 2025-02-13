import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.append(footer);

  document.querySelectorAll('footer .footer .default-content-wrapper ul:first-child li').forEach((li) => {
    const picture = li.querySelector('picture');
    const link = li.querySelector('a');
    const br = li.querySelector('br');
    if (br) br.remove();
    if (picture && link) {
      link.textContent = '';
      link.insertBefore(picture, link.firstChild);
    }
  });
}
