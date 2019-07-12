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

  type itemStateT = {
    isShow: bool,
    pos: Common.position,
  };

  type state = {
    characters: Common.StringMap.t(CharFactory.CharCreator.charT),
    items: itemStateT,
  }
  
  module StringMap = Map.Make(String);
  
  let stateBuilder = (charFactory, initialConfig) => {
    charFactory(initialConfig);
  };

  let createStateBuilder = (charTypeDicts) => {
    let charFactory = CharFactory.createCharFactory(charTypeDicts);
    stateBuilder(charFactory)
  }
};

let createStateBuilder  = JsAdapter.createStateBuilder;
