
export default function parse(element, { document }) {
  // Initialize the two-dimensional array with one row and one column
  let table = [[]];

  // Use the :scope pseudo-class to query only the children of the passed element
  let children = element.querySelectorAll(':scope > *');

  // Since we want to include all child elements in the same cell,
  // we create an array to hold them
  let cellContent = Array.from(children);

  // Add the array of child elements to the first cell of the table
  table[0][0] = cellContent;

  // Return the two-dimensional array
  return table;
}
