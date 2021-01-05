/*
 * Simple way to compare multiple arrays for sameness.
 *
 */

export default (...arrays) => {
  return (
    arrays.length > 0 &&
    arrays
      .map((array) => JSON.stringify(array))
      .every((strArray, index, strArrays) => strArray === strArrays[0])
  )
}
