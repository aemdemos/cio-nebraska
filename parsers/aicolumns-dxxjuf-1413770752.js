
export default function parse(element, { document }) {
  // Initialize the two-dimensional array with one row and three columns
  let table = [[]];

  // Define the CSS selectors based on the provided xpaths
  // Since we are looking for immediate children of the element, we use :scope > 
  let selectors = [
    ":scope > div:nth-of-type(1)",
    ":scope > div:nth-of-type(2)",
    ":scope > div:nth-of-type(3)"
  ];

  // Iterate over the selectors and query the elements
  selectors.forEach((selector, index) => {
    let childElement = element.querySelector(selector);
    if (childElement) {
      // Place the element reference in the next available cell
      table[0][index] = childElement;
    }
  });

  // Return the two-dimensional array
  return table;
}
