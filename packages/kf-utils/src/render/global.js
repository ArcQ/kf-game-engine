// abstract away uses of window in case of ssr

import { path } from 'ramda';

export const canUseDOM = () => !!(
  typeof window !== 'undefined'
  && window.document
  && window.document.createElement
);

export const getWindow = (attrs) => {
  if (canUseDOM()) {
    return (attrs ? path(attrs, window) : window);
  }
  return undefined;
};

export const getDocument = () => {
  if (canUseDOM()) {
    return document;
  }
  return undefined;
};

export const getNavigator = () => {
  if (canUseDOM()) {
    return navigator;
  }
  return undefined;
};

const iOS = () =>
  (canUseDOM()
    ? /iPad|iPhone|iPod/.test(getNavigator().userAgent) && !getWindow().MSStream
    : undefined);

export const getWWidth = () => ((iOS) ? getWindow().screen.width : getWindow().innerWidth
  || getDocument()._documentElement.clientWidth
  || getDocument().body.clientWidth);

export const getWHeight = () => ((iOS) ? getWindow().screen.height : getWindow().innerHeight
  || getDocument()._documentElement.clientHeight
  || getDocument().body.clientHeight);

export const getWDimensions = () => ({ wWidth: getWWidth(), wHeight: getWHeight() });

export const devicePixelRatio = () => getWindow() && getWindow().devicePixelRatio;
