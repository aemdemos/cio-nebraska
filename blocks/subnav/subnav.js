export default function decorate(block) {
  const container = block.querySelector('div > div');
  container.classList.add('subnav-group-container');
  const paragraphs = Array.from(container.querySelectorAll('p'));
  const newContainer = document.createElement('div');

  for (let i = 0; i < paragraphs.length; i += 2) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.classList.add('grouped-content');

    wrapperDiv.appendChild(paragraphs[i]);
    if (paragraphs[i + 1]) {
      wrapperDiv.appendChild(paragraphs[i + 1]);
    }

    newContainer.appendChild(wrapperDiv);
  }

  newContainer.classList.add('grouped-content-container');

  container.innerHTML = '';
  container.appendChild(newContainer);

  const divs = block.querySelectorAll('.grouped-content');
  const classes = ['blue', 'red', 'grey'];

  divs.forEach((div, index) => {
    div.classList.add(classes[index % classes.length]);
    const buttonContainerParagraph = div.querySelector('.button-container a');
    buttonContainerParagraph.classList.remove('button');
  });
}
