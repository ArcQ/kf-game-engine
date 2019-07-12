/* type itemStateT = { */
/*   isShow: bool, */
/*   pos: Common.position, */
/* }; */
/*  */
/* module RenderState { */
/*   type renderItemStateT = { */
/*     isShow: bool, */
/*     pos: Common.position, */
/*   }; */
/*  */
/*   type charStateT = { */
/*     pos: Common.position, */
/*   }; */
/*  */
/*   [@bs.deriving abstract] */
/*     type pixiSpriteJT; */
/*  */
/*   type charT = { */
/*     state: charStateT, */
/*     sprite: pixiSpriteJT, */
/*     anims: option(pixiSpriteJT), */
/*     charK: string, */
/*   }; */
/*  */
/*   [@bs.deriving abstract] */
/*     type charSpriteConfigJT = { */
/*       pos: Common.position, */
/*       spriteSheetKs: list(string), */
/*       anchor: int, */
/*       size: Common.position, */
/*       animationSpeed: float, */
/*     }; */
/*  */
/*   [@bs.module "@kf/game-utils/dist/pixi/sprite"]  */
/*     external createSpriteForChar : charSpriteConfigJT =>  */
/*       pixiSpriteJT = "createSpriteForChar"; */
/*  */
/*   /* /** */ */
/*   /*  * createChar - creates a character type object */ */
/*   /*  * that has initial state and sprite */ */
/*   /*  * */ */
/*   /*  * @param {charConfig, charType} */ */
/*   /*  * @returns {function} returns a functions that takes instance arguments as an object */ */
/*   /*  */ */ */
/*     let createChar = (charType, charConfig) => { */
/*       let pos = charConfig->posGet; */
/*       let charSpriteConfig = charSpriteConfigJT( */
/*         ~pos = charConfig->posGet, */
/*         ~spriteSheetKs = charType->spriteSheetKsGet, */
/*         ~anchor = charType->anchorGet, */
/*         ~size = charType->sizeGet, */
/*         ~animationSpeed = charType->animationSpeedGet, */
/*       ); */
/*       let sprite = createSpriteForChar(charSpriteConfig); */
/*       { */
/*         state: { pos: pos }, */
/*         sprite: sprite, */
/*         anims: None, */
/*         /* charK: charConfig->charKGet, */ */
/*         charK: "blah", */
/*       } */
/*     } */
/* } */
