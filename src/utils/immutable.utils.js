/**
 * movePtIm - move an immutable position list by an offset defiend by a native arr
 *
 * @param {List} imPt - List([x,y])
 * @param {Array} offset - [x,y]
 * @returns {List} newImPt
 */
export function movePointIm(imPt, offset) {
  return imPt.map((imCoord, i) => imCoord + offset[i]);
}
