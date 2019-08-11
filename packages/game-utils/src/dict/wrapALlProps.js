/**
 * entries
 *
 * @param dict
 * @param wrapper
 * @returns {undefined}
 */
const wrapAllProps = (dict, wrapper) => Object.entries(dict).reduce((acc, [k, f]) => ({
  ...acc,
  k: wrapper(f),
}), dict);

export default wrapAllProps;
