export default function getImgSrc(engine) {
  return path => `${engine.assetUrl}${path}`;
}
