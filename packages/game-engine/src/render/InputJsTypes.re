[@bs.deriving abstract]
type animsConfigJ;
[@bs.deriving abstract]
type charTypeDictJ = {
  spriteSheetKs: list(string),
  [@bs.optional] anims: animsConfigJ,
  [@bs.optional] size: Common.position,
  [@bs.optional] animationSpeed: float,
};

[@bs.deriving abstract]
type initialCharConfigJ = {
  charK: string,
  pos: Common.position,
  [@bs.optional] anchor: int,
};

[@bs.deriving abstract]
type initialConfigJ = {
  charConfig: Js.Dict.t(initialCharConfigJ),
};
