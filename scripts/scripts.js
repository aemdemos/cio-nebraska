import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
  toClassName,
  createOptimizedPicture,
} from './aem.js';

const TEMPLATES = ['home']; // add your templates here
const TEMPLATE_META = 'template';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const logoUrl = 'https://main--cio-nebraska--aemdemos.aem.live/cio-ne-logo.png';
  let pictureUrl = getMetadata('og:image');
  if (pictureUrl.includes('/default-meta-image.png')) {
    // if no image in page meta found, then no hero block creation
    return;
  }
  const url = new URL(pictureUrl, window.location.href);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
    pictureUrl = url.href;
  }

  if (h1) { // all pages need an H1 anyway
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
  }
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
        observer.observe(section);
      }
    });
  });
}
createObserver();

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
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateStyledSections(main);
  createObserver();
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
