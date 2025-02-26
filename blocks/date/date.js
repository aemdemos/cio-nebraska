export default function decorate(block) {
  const options = {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  };
  const nebraskaDate = new Date().toLocaleDateString('en-US', options);

  const paragraph = block.querySelector('p');

  if (paragraph) {
    paragraph.textContent += ` ${nebraskaDate}`;
  }
}
