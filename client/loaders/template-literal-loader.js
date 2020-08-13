// This is a simple loader used with raw-loader for importing
// markdown to be consumed by grommet/Markdown

// eslint-disable-next-line
module.exports = function (source) {
  // eslint-disable-next-line
  return eval(`\`${source}\``)
}
