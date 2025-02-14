export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`aicolumns-s3aou0-1749612991-${cols.length}-cols`);

  // setup image aicolumns-s3aou0-1749612991
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('aicolumns-s3aou0-1749612991-img-col');
        }
      }
    });
  });
}
