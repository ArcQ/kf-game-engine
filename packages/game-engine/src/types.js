// @flow
//
type PixiApp = {};
type ReactRefStub = any;

type StoreFn = {
  dispatchFn: ({ type: string, payload: {} }) => void,
  selectFn: (k: string) => void,
};

type AssetDict = {
  [asset: string]: string,
};

type AssetDicts = {
  [k: string]: AssetDict,
};

export type engine = {
  app: PixiApp,
  ticker: any,
  stopTicker: (void) => void,
  assetUrl: string,
  assetDicts: AssetDicts,
  web: {
    screen: {
      bounds: Array<number>,
    },
  },
  scale: number,
  ui: StoreFn,
  start: (gameConfig: {}, ReactRefStub, StoreFn, AssetDicts) => PixiApp,
};
