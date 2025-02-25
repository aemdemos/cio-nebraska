
export default function parse(element, { document }) {
  // Initialize the two-dimensional array with empty rows
  let table = [[], []];

  // Convert the XPaths to generic CSS selectors relative to the element
  // The selectors are based on the structure of the HTML and the classes/ids available
  let selectors = [
    ":scope > nav:nth-of-type(1) > div:nth-of-type(1)",
    ":scope > nav:nth-of-type(2) > div:nth-of-type(1)"
  ];

  // Iterate over the selectors to find the elements and add them to the table
  selectors.forEach((selector, index) => {
    // Find the element using querySelector
    let foundElement = element.querySelector(selector);

    // Calculate the row and column index for the current element
    let rowIndex = Math.floor(index / 2);
    let colIndex = index % 2;

    // If the element is found, add it to the table
    if (foundElement) {
      // If the cell is already occupied, create an array and add both elements
      if (table[rowIndex][colIndex]) {
        if (!Array.isArray(table[rowIndex][colIndex])) {
          table[rowIndex][colIndex] = [table[rowIndex][colIndex]];
        }
        table[rowIndex][colIndex].push(foundElement);
      } else {
        // Otherwise, just add the element to the cell
        table[rowIndex][colIndex] = foundElement;
      }
    }
  });

  // Return the two-dimensional array representing the table
  return table;
}
