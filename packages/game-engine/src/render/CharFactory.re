/*
 * # CharFactory
 *
 * Creates characters given a dictionary of characters and character types.
 *
 * Here's how to use it:
 * ```js
 * createChars(charConfig, charTypeDict);
 * ```
 */

/* [@bs.module "../helper-methods"] external helperMethods : string = "default"; */
type anchorT = int;
type spriteSheetKsT = list(string);

module CharCreator {
  [@bs.deriving jsConverter]
  type charState = {
    pos: Common.position,
  };

  [@bs.deriving abstract]
    type pixiSpriteJ;

  [@bs.deriving jsConverter]
  type char = {
    charState,
    sprite: pixiSpriteJ,
    anims: option(pixiSpriteJ),
    charK: string,
  };

  [@bs.deriving abstract]
    type charSpriteConfigJ = {
      pos: Common.position,
      spriteSheetKs: list(string),
      anchor: int,
      size: Common.position,
      animationSpeed: float,
    };

  [@bs.module "@kf/game-utils/dist/pixi/sprite"] 
    external createSpriteForChar : charSpriteConfigJ => 
      pixiSpriteJ = "createSpriteForChar";

  /* /** */
  /*  * createChar - creates a character type object */
  /*  * that has initial state and sprite */
  /*  * */
  /*  * @param {charConfig, charType} */
  /*  * @returns {function} returns a functions that takes instance arguments as an object */
  /*  */ */
    let createChar = (charType, charConfig) => {
      let pos = charConfig->posGet;
      let charSpriteConfig = charSpriteConfigJ(
        ~pos = charConfig->posGet,
        ~spriteSheetKs = charType->spriteSheetKsGet,
        ~anchor = charType->anchorGet,
        ~size = charType->sizeGet,
        ~animationSpeed = charType->animationSpeedGet,
      );
      let sprite = createSpriteForChar(charSpriteConfig);
      {
        charState: { pos: pos },
        sprite: sprite,
        anims: None,
        /* charK: charConfig->charKGet, */
        charK: "blah",
      }
    }
}

module JsAdapter {
  let createCharFactory = (charTypeDicts, charConfigs) => {
    Js.Dict.entries(charConfigs) 
     |> Array.fold_left((acc, (k, charConfig)) => {
       switch (Js.Dict.get(charTypeDicts, k)) {
         | None => acc
         | Some(charTypeDict) => (acc |> Common.StringMap.add(k, CharCreator.createChar(charTypeDict, charConfig))) 
       }

     }, Common.StringMap.empty)
  };
};

let createCharFactory = JsAdapter.createCharFactory;
