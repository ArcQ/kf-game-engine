type position = array(int);

[@bs.deriving abstract]
type renderItemState = {
  isShow: bool,
  pos: position,
};

[@bs.deriving abstract]
type charEntityState = {
  pos: position,
  charK: string,
}

let filterWasmConfig = (keys: list(string)) => {
  let wasmConfig = Js.Dict.empty();
  List.map(
    k => Js.Dict.set(wasmConfig, k, "1"), 
    keys,
  ) -> ignore;
  wasmConfig
};

let charEntities = [
  ("P1", [|100, 100|], "assasin"),
  ("P2", [|200, 200|], "knight")];

let getInitialGameState = () => {
  let dict = Js.Dict.empty();
  Js.Dict.set(dict, "P1", charEntityState(
    ~pos=[|100, 100|],
    ~charK="assasin",
  ));
  Js.Dict.set(dict, "P2", charEntityState(
    ~pos=[|200, 200|],
    ~charK="knight",
  ));
  dict
}
/*  */
/* let resetState = () => { */
/*   // TODO, state should include whether idle or moving, and if moving, point of movement */
/*   getInitialGameState() */
/* } */

/* function getInitialGameState() { */
/*   const charProps = { */
/*     P1: createCharConfig({ */
/*       charK: 'assasin', */
/*     }, { */
/*       pos: [100, 100], */
/*     }), */
/*     P2: createCharConfig({ */
/*       charK: 'knight', */
/*     }, { */
/*       pos: [200, 200], */
/*     }), */
/*   }; */
/*  */
/*   const getCombinedProps = _charProps => Object.entries(_charProps) */
/*     .reduce((prev, [k, props]) => ({ */
/*       ...prev, */
/*       [k]: merge(props.game, props.render), */
/*     }), {}); */
/*  */
/*   const initialGameState = { */
/*     charEntities: getCombinedProps(charProps), */
/*     moveTargetCircle: { */
/*       isShow: false, */
/*       pos: [100, 100], */
/*     }, */
/*   }; */
/*  */
/*   return initialGameState; */
/* } */
/*  */
/* export function resetState() { */
/*   // TODO, state should include whether idle or moving, and if moving, point of movement */
/*   return { */
/*     P1: { */
/*       pos: setRandPos(), */
/*     }, */
/*     P2: { */
/*       pos: setRandPos(), */
/*     }, */
/*     moveTargetCircle: { */
/*       pos: [0, 0], */
/*     }, */
/*   }; */
/* } */
