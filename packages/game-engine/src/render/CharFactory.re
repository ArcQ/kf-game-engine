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
  type renderItemStateT = {
    isShow: bool,
    pos: Common.position,
  };

  type charStateT = {
    pos: Common.position,
  };

  [@bs.deriving abstract]
    type pixiSpriteJT;

  type charT = {
    state: charStateT,
    sprite: pixiSpriteJT,
    anims: option(pixiSpriteJT),
    charK: string,
  };

  [@bs.deriving abstract]
    type charSpriteConfigJT = {
      pos: Common.position,
      spriteSheetKs: list(string),
      anchor: int,
      size: Common.position,
      animationSpeed: float,
    };

  [@bs.module "@kf/game-utils/dist/pixi/sprite"] 
    external createSpriteForChar : charSpriteConfigJT => 
      pixiSpriteJT = "createSpriteForChar";

  /* /** */
  /*  * createChar - creates a character type object */
  /*  * that has initial state and sprite */
  /*  * */
  /*  * @param {charConfig, charType} */
  /*  * @returns {function} returns a functions that takes instance arguments as an object */
  /*  */ */
    let createChar = (charType, charConfig) => {
      let pos = charConfig->posGet;
      let charSpriteConfig = charSpriteConfigJT(
        ~pos = charConfig->posGet,
        ~spriteSheetKs = charType->spriteSheetKsGet,
        ~anchor = charType->anchorGet,
        ~size = charType->sizeGet,
        ~animationSpeed = charType->animationSpeedGet,
      );
      let sprite = createSpriteForChar(charSpriteConfig);
      {
        state: { pos: pos },
        sprite: sprite,
        anims: None,
        /* charK: charConfig->charKGet, */
        charK: "blah",
      }
    }
}

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
    type charConfigJT = {
      pos: Common.position,
      anchor: int,
      charK: string,
    };
  
  module StringMap = Map.Make(String);
  
  let charFactory = (charTypeDicts, charConfigs) => {
    Js.Dict.entries(charConfigs) 
     |> Array.fold_left((acc, (k, charConfig)) => {
       switch (Js.Dict.get(charTypeDicts, k)) {
         | None => acc
         | Some(charTypeDict) => (acc |> StringMap.add(k, CharCreator.createChar(charTypeDict, charConfig))) 
       }

     }, StringMap.empty)
  };

  let createCharFactory = (charTypeDicts) => {
    charFactory(charTypeDicts);
  }
};

let createCharFactory = JsAdapter.createCharFactory;

/* /** */
/*  * createCharEntities */
/*  * */
/*  * @param config {Object} object with character keys and position as and attribute */
/*  * @returns {Object} character object */
/*  */ */
/* export function createCharEntities(charConfig, charTypeDict) { */
/*   const getCharK = v => v.charK; */
/*   return Object.entries(charConfig).reduce((acc, [k, initialStateObj]) => */
/*     ({ */
/*       ...acc, */
/*       [k]: pipe( */
/*         getCharK, */
/*         charK => charTypeDict[charK], */
/*         curry(createCharFactory)(initialStateObj), */
/*       )(initialStateObj), */
/*     }), {}); */
/* } */
/*  */




/*  */
/* let createCharConfig = (charConfigs: list(charConfigT), charTypeDicts: list(charTypeDictT)) => { */
/*   let charK = (charConfig) => charConfig.charK;   */
/*   let nl = List.fold_left( */
/*     (acc: Js.Dict.t(charConfigT), charConfig) => Js.Dict.set(acc,  charConfig),  */
/*     Js.Dict.empty(),  */
/*     charConfigs) */
/*   /* let wasmConfig = Js.Dict.empty(); */ */
/*   /* List.map( */ */
/*   /*   k => Js.Dict.set(wasmConfig, k, "1"),  */ */
/*   /*   charTypeDicts, */ */
/*   /* ) -> ignore; */ */
/*   /* wasmConfig */ */
/* }; */
/*  */
/* let filterWasmConfig = (keys: list(string)) => { */
/*   let wasmConfig = Js.Dict.empty(); */
/*   List.map( */
/*     k => Js.Dict.set(wasmConfig, k, "1"),  */
/*     keys, */
/*   ) -> ignore; */
/*   wasmConfig */
/* }; */
/*  */
/* type document; /* abstract type for a document object */ */
/* [@bs.send] external getElementById: (document, string) => Dom.element = "getElementById"; */
/* [@bs.val] external doc : document = "document"; */
/*  */
/* let el = getElementById(doc, "myId"); */
/*  */
/*  */
/* /* var el = document.getElementById("myId"); */ */
/* module Sprite = { */
/*   /* type Anims = { }; */ */
/*   /* let charEntitiesList = []; */ */
/*   /* let createAnimsForChar = (anims) => { */ */
/*   /*   Array.map */ */
/*   /*      */ */
/*   /* }; */ */
/* }; */
/*  */
/* /* function createAnimsForChar(anims) { */ */
/* /*   const defaultAnims = { */ */
/* /*     spriteHandler: (sprite) => { */ */
/* /*       sprite.loop = true; */ */
/* /*     }, */ */
/* /*   }; */ */
/* /*   return map( */ */
/* /*     v => (Array.isArray(v) */ */
/* /*       ? { ...defaultAnims, frames: () => getSpriteSheetFrames(...v) } */ */
/* /*       : { ...defaultAnims, ...v }), */ */
/* /*     anims, */ */
/* /*   ); */ */
/* /* } */ */
/*  */
/* /* module CharType = { */ */
/* /*   type CharType = { }; */ */
/* /*   let charEntitiesList = []; */ */
/* /*   let create = (x, y, z) => x + y + z; */ */
/* /* } */ */
/* /*  */ */
/* /* module CharDef = { */ */
/* /*   type CharDef = { */ */
/* /*  */ */
/* /*   }; */ */
/* /*   let charEntitiesList = []; */ */
/* /*   let create = (x, y, z) => x + y + z; */ */
/* /* } */ */
/* /*  */ */
/* /* let createCharacters = (charConfig, charTypeDict) => { */ */
/* /*    */ */
/* /* } */ */
/* /*  */ */
/* /*  */ */
/* /* /** */ */
/* /*  * createAnimsForChar note should document defaults */ */
/* /*  * */ */
/* /*  * @param anims */ */
/* /*  * @returns {undefined} */ */
/* /*  */ */ */
/* /* function createAnimsForChar(anims) { */ */
/* /*   const defaultAnims = { */ */
/* /*     spriteHandler: (sprite) => { */ */
/* /*       sprite.loop = true; */ */
/* /*     }, */ */
/* /*   }; */ */
/* /*   return map( */ */
/* /*     v => (Array.isArray(v) */ */
/* /*       ? { ...defaultAnims, frames: () => getSpriteSheetFrames(...v) } */ */
/* /*       : { ...defaultAnims, ...v }), */ */
/* /*     anims, */ */
/* /*   ); */ */
/* /* } */ */
/* /*  */ */
/* /* /** */ */
/* /*  * getSpritesFromCharEntities */ */
/* /*  * @param charEntities {Array[charEntity]} an array of entity objects {} */ */
/* /*  * */ */
/* /*  * @returns {undefined} */ */
/* /*  */ */ */
/* /* export const getSpritesFromCharEntities = pipe( */ */
/* /*   values, */ */
/* /*   map(v => v.sprite), */ */
/* /* ); */ */
