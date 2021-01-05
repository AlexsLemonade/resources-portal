/*
 * Simple way to compare multiple values for sameness.
 * Converts arguments to stringifed JSON and then compares.
 *
 */

export default (...arrays) => {
  return arrays
    .map((array) => JSON.stringify(array))
    .every((strArray, index, strArrays) => strArray === strArrays[0])
}
