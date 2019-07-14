module JsAdapter {
  [@bs.deriving abstract]
    type animsConfigJT;

  [@bs.deriving abstract]
    type charTypeDictJT = {
      spriteSheetKs: list(int),
      [@bs.optional] anims: animsConfigJT,
      [@bs.optional] size: int,
      [@bs.optional] anchor: int,
      [@bs.optional] animationSpeed: int,
    };

  [@bs.deriving abstract]
    type initialCharConfigJT = {
      pos: Common.position,
      anchor: int,
      charK: string,
    };

  type graphicsState = {
    isShow: bool,
    pos: Common.position,
  };

  type state = {
    characters: Common.StringMap.t(CharFactory.CharCreator.char),
    items: Common.StringMap.t(graphicsState),
  }

  type stateInterface = {
    getCharacter: (~k: string, ~attrK: string) => CharFactory.CharCreator.char,
    getItems: (~k: string, ~attrK: string) => graphicsState,
  } 
  
  let stateBuilder = (charFactory, initialConfig) => {
    {
      characters: charFactory(initialConfig),
      items: Common.StringMap.empty,
    }
  };

  let createStateBuilder = (charTypeDicts) => {
    let charFactory = CharFactory.createCharFactory(charTypeDicts);
    stateBuilder(charFactory)
    {pos: [1, 2]}
  }
};

let createStateBuilder  = JsAdapter.createStateBuilder;
