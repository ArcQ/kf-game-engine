open Jest;

describe("Expect", () => {
  open Expect;

  test("toBe", () =>
    expect(1 + 2) |> toBe(3))
});

describe("Get Initial Game State Should Return The Right Object", () => {
    open Expect;
    open ExpectJs;

    let dict = Js.Dict.empty();
    Js.Dict.set(dict, "P1", GameStateBuilder.charEntityState(
        ~pos=[|100, 100|],
        ~charK="assasin",
    ));
    Js.Dict.set(dict, "P2", GameStateBuilder.charEntityState(
        ~pos=[|200, 200|],
        ~charK="knight",
    ));

    test("correct return", () =>
      expect(GameStateBuilder.getInitialGameState()) |> toEqual(dict))
  }
);
