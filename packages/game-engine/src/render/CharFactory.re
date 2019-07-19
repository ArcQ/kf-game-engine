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
      anchor: Js.Nullable.t(int),
      size: Js.Nullable.t(Common.position),
      animationSpeed: Js.Nullable.t(float),
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
      let pos = charConfig->InputJsTypes.posGet;
      let charSpriteConfig = charSpriteConfigJ(
        ~pos=pos,
        ~spriteSheetKs=charType->InputJsTypes.spriteSheetKsGet,
        ~anchor=Js.Nullable.fromOption(charConfig->InputJsTypes.anchorGet), 
        ~size=Js.Nullable.fromOption(charType->InputJsTypes.sizeGet),
        ~animationSpeed=Js.Nullable.fromOption(charType->InputJsTypes.animationSpeedGet),
      );
      Js.log(charSpriteConfig);
      let sprite = createSpriteForChar(charSpriteConfig);
      let createChar: char = {
        charState: { pos: pos },
        sprite: sprite,
        anims: None,
        charK: charConfig->InputJsTypes.charKGet,
      };
      createChar
    }
}

let createCharFactory = (
  charTypeDicts: Js.Dict.t(InputJsTypes.charTypeDictJ), 
  charConfigs: Js.Dict.t(InputJsTypes.initialCharConfigJ),
) => {
  Js.Dict.entries(charConfigs) 
    |> Array.fold_left((acc, (k, charConfig)) => {
      switch (Js.Dict.get(charTypeDicts, charConfig->InputJsTypes.charKGet)) {
        | None => acc
        | Some(charTypeDict) => (acc |> Common.StringMap.add(k, CharCreator.createChar(charTypeDict, charConfig))) 
        }

    }, Common.StringMap.empty)
};
