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
let x = Js.Dict.empty();
Js.Dict.set(x, "test", "test");

let stateBuilder = (charFactory, initialConfig) => {
  let gameState = {
    characters: charFactory(initialConfig->InputJsTypes.charConfigGet),
    items: Common.StringMap.empty,
  };
  Common.StringMap.find("P1", gameState.characters)
};

let createStateBuilder = (charTypeDicts) => {
  let charFactory = CharFactory.createCharFactory(charTypeDicts);
  stateBuilder(charFactory)
}

