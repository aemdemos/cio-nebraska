import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlock,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
  toClassName,
  createOptimizedPicture,
  decoratePicturesWithLinks,
} from './aem.js';

const TEMPLATES = ['home']; // add your templates here
const TEMPLATE_META = 'template';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const logoUrl = 'https://main--cio-nebraska--aemdemos.aem.page/aemedge/icons/ocio-logo-white.svg';
  let pictureUrl = getMetadata('og:image') || ''; // Add default empty string

  // Early return if we don't have an H1
  if (!h1) {
    return;
  }

  // Skip hero creation if it's the default image
  if (pictureUrl.includes('/default-meta-image.png')) {
    return;
  }

  const url = new URL(pictureUrl, window.location.href);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
    pictureUrl = url.href;
  }

  const picture = createOptimizedPicture(pictureUrl, 'Hero image', true, [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]);
  picture.classList.add('hero-image');
  const logo = createOptimizedPicture(logoUrl, 'Nebraska - Good Life. Great Opportunity', true);
  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.append(logo);
  logo.classList.add('ocio-logo');
  const figure = document.createElement('figure');
  figure.append(logoLink);
  const heroSection = document.createElement('div');
  heroSection.append(buildBlock('hero', { elems: [picture, figure] }));
  main.prepend(heroSection);
  // remove empty divs
  const emptyDivs = main.querySelectorAll('div:empty');
  emptyDivs.forEach((div) => div.remove());
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Sets an optimized background image for a given section element.
 * This function takes into account the device's viewport width and device pixel ratio
 * to choose the most appropriate image from the provided breakpoints.
 *
 * @param {HTMLElement} section - The section element to which the background image will be applied.
 * @param {string} bgImage - The base URL of the background image.
 * @param {Array<{width: string, media?: string}>} [breakpoints=[
 *  { width: '450' },
 *   { media: '(min-width: 450px)', width: '750' },
 *   { media: '(min-width: 768px)', width: '1024' },
 *   { media: '(min-width: 1024px)', width: '1600' },
 *   { media: '(min-width: 1600px)', width: '2200' },
 * ]] - An array of breakpoint objects. Each object contains a `width` which is the width of the
 * image to request, and an optional `media` which is a media query string indicating when this
 * breakpoint should be used.
 */

export const resizeListeners = new WeakMap();
export function getBackgroundImage(element) {
  const sectionData = element.dataset.background;
  const bgImages = sectionData.split(',').map((img) => img.trim());
  return (bgImages.length === 1
    || (window.innerWidth > 1024 && bgImages.length === 2)) ? bgImages[0] : bgImages[1];
}

export function createOptimizedBackgroundImage(element, breakpoints = [
  { width: '450' },
  { media: '(min-width: 450px)', width: '768' },
  { media: '(min-width: 768px)', width: '1024' },
  { media: '(min-width: 1024px)', width: '1600' },
]) {
  const updateBackground = () => {
    const bgImage = getBackgroundImage(element);
    const { pathname } = new URL(bgImage, window.location.href);

    const matchedBreakpoint = breakpoints
      .filter((br) => !br.media || window.matchMedia(br.media).matches)
      .reduce((acc, curr) => (parseInt(curr.width, 10)
      > parseInt(acc.width, 10) ? curr : acc), breakpoints[0]);

    const adjustedWidth = matchedBreakpoint.width * window.devicePixelRatio;
    element.style.backgroundImage = `url(${pathname}?width=${adjustedWidth}&format=webply&optimize=highest)`;
  };

  if (resizeListeners.has(element)) {
    window.removeEventListener('resize', resizeListeners.get(element));
  }
  resizeListeners.set(element, updateBackground);
  window.addEventListener('resize', updateBackground);
  updateBackground();
}

function decorateStyledSections(main) {
  Array.from(main.querySelectorAll('.section[data-background]')).forEach((section) => {
    createOptimizedBackgroundImage(section);
  });
}

// Initiate the IntersectionObserver to animate the parallax sections
function createObserver() {
  const parallaxRight = document.querySelector('.parallax.right');
  const parallaxLeft = document.querySelector('.parallax.left');
  document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('right')) {
            entry.target.querySelector('div').classList.add('slideLeft');
          } else if (entry.target.classList.contains('left')) {
            entry.target.querySelector('div').classList.add('slideRight');
          }
        } else if (entry.target.classList.contains('right')) {
          entry.target.querySelector('div').classList.remove('slideLeft');
        } else if (entry.target.classList.contains('left')) {
          entry.target.querySelector('div').classList.remove('slideRight');
        }
      });
    }, {
      threshold: 0.3,
    });

    [parallaxRight, parallaxLeft].forEach((section) => {
      if (section) {
        // only change button location + link target if an icon is linked
        const arrowContainer = section.querySelector('.button-container:has(a > .icon)');
        if (arrowContainer) {
          section.append(arrowContainer);
          const anchor = arrowContainer.querySelector('a');
          const parentSection = anchor.parentElement;
          if (anchor && parentSection) {
            anchor.addEventListener('click', (event) => {
              event.preventDefault();
              parentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        }
        observer.observe(section);
      }
    });
  });
}
createObserver();

/* BREADCRUMBS */
// first have to copy function from fragment.js and add a cache
const fragmentCache = new Map();

export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    if (fragmentCache.has(path)) {
      return fragmentCache.get(path);
    }
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('div');
      main.innerHTML = await resp.text();
      fragmentCache.set(path, main);
      return main;
    }
  }
  return null;
}

const getFragmentPath = (path) => {
  let fragmentPath;
  switch (true) {
    case path.includes('/news/'):
      fragmentPath = '/aemedge/fragments/breadcrumbs-news';
      break;
    case path.includes('/contact/'):
      fragmentPath = '/aemedge/fragments/breadcrumbs-contact';
      break;
    case path.includes('/servicedesk/'):
      fragmentPath = '/aemedge/fragments/breadcrumbs-servicedesk';
      break;
    case path.includes('/about/'):
      fragmentPath = '/aemedge/fragments/breadcrumbs-about';
      break;
    default:
      fragmentPath = '/aemedge/fragments/breadcrumbs-default';
  }
  return fragmentPath;
};

async function buildBreadcrumbs() {
  const outerSection = document.createElement('div');
  const breadcrumbMetadata = getMetadata('breadcrumb-title') || getMetadata('og:title') || '';
  // if breadcrumb-title is "false" in metadata, return an empty div
  if (breadcrumbMetadata !== 'False' && breadcrumbMetadata !== 'false') {
    // Even if breadcrumbs are disabled, we need an empty div to keep the layout consistent
    outerSection.className = 'breadcrumbs-outer wrapper';
    const container = document.createElement('div');
    container.className = 'section breadcrumbs-container';
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumbs';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.innerHTML = '';
    const fragmentPath = getFragmentPath(window.location.pathname);
    // load the fragment and add it to the breadcrumb
    const fragment = await loadFragment(fragmentPath);
    if (fragment) {
      const breadcrumbLinks = fragment.querySelectorAll('a');
      breadcrumbLinks.forEach((link, index) => {
        breadcrumb.appendChild(link);
        if (index < breadcrumbLinks.length) {
          const separator = document.createElement('span');
          separator.className = 'breadcrumb-separator';
          separator.textContent = ' / ';
          breadcrumb.appendChild(separator);
        }
      });
      // Only append the text if it's not empty
      if (breadcrumbMetadata && breadcrumbMetadata.trim()) {
        const textNode = document.createTextNode(breadcrumbMetadata);
        breadcrumb.append(textNode);
      }
    }
    outerSection.appendChild(container);
    container.appendChild(breadcrumb);
  }
  return outerSection;
}
/* END BREADCRUMBS */

function buildLinksOfInterest() {
  const aside = document.createElement('aside');
  aside.classList.add('content-aside');
  loadFragment('/aemedge/fragments/links-of-interest').then((fragment) => {
    aside.append(fragment);
    decoratePicturesWithLinks(aside);
    decorateIcons(aside);
  });
  return aside;
}

/**
 * wraps main content with breadcrumbs, cards, and aside.
 */

async function buildDefaultTemplate() {
  const template = getMetadata('template');
  if (template !== 'home') {
    const main = document.querySelector('main');
    const h1 = main.querySelector('h1:first-of-type') || '';
    const contentSection = main.querySelector(':scope > .section.hero-container+.section') || main.querySelector(':scope > .section');
    // create a lower wrapper div to place aside and content
    const pageContentWrapper = document.createElement('div');
    pageContentWrapper.className = 'page-details-wrapper';
    // aside and content wrappers will be appended to this wrapper
    const asideWrapper = document.createElement('div');
    asideWrapper.className = 'aside-details-wrapper';
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-details-wrapper';

    // move all divs into content wrapper div
    contentSection.querySelectorAll('div[class*="wrapper"]:not(.cards-wrapper)').forEach((div) => {
      contentWrapper.append(div);
    });
    asideWrapper.prepend(await buildLinksOfInterest());
    pageContentWrapper.append(asideWrapper, contentWrapper);
    contentSection.append(pageContentWrapper);

    contentSection.before(h1, await buildBreadcrumbs());
    const emptyDivs = main.querySelectorAll('div:empty');
    emptyDivs.forEach((div) => div.remove());
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    const template = getMetadata('template');
    if (template !== 'home') {
      buildHeroBlock(main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * check if link text is same as the href
 * @param {Element} link the link element
 * @returns {boolean} true or false
 */
export function linkTextIncludesHref(link) {
  const href = link.getAttribute('href');
  const textcontent = link.textContent;

  return textcontent.includes(href);
}

/**
 * Builds youtube embedded blocks when those links are encountered
 * @param {Element} main The container element
 */
export function buildYoutubeBlocks(main) {
  const youTubeRegex = /youtube\.com|youtu\.be/;
  main.querySelectorAll('a[href]').forEach((a) => {
    if (youTubeRegex.test(a.href) && linkTextIncludesHref(a)) {
      const embedBlock = buildBlock('embed', a.cloneNode(true));
      a.replaceWith(embedBlock);
      decorateBlock(embedBlock);
    }
  });
}

/**
 * Processes and decorates divider elements within the main content.
 * @param {Element} main The main element containing divider codes
 */
function buildPageDivider(main) {
  const allPageDivider = main.querySelectorAll('code');

  allPageDivider.forEach((el) => {
    const alt = el.innerText.trim();
    const lower = alt.toLowerCase();
    if (lower.startsWith('divider')) {
      if (lower === 'divider' || lower.includes('element')) {
        el.innerText = '';
        el.classList.add('divider');
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  buildPageDivider(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateStyledSections(main);
  createObserver();
  decoratePicturesWithLinks(main);
  buildYoutubeBlocks(main);
}

/**
 * load the template specific js and css
 */
async function loadTemplate(main) {
  try {
    const template = getMetadata(TEMPLATE_META) ? toClassName(getMetadata(TEMPLATE_META)) : null;
    if ((template && TEMPLATES.includes(template))) {
      const templateJS = await import(`../templates/${template}/${template}.js`);
      // invoke the default export from template js
      if (templateJS.default) {
        await templateJS.default(main);
      }
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${template}/${template}.css`,
      );
    }
    buildDefaultTemplate(main);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load template with error : ${err}`);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await loadTemplate(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
    // const h1 = main.querySelector('h1:first-of-type');
    // h1.after(await buildBreadcrumbs());
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
