#Kf Game Engine

Another JS game engine using pixijs as a rendering enginge.
It provides helper utilities to load wasm (rust or c++) as main game logic.

Api Documentation coming soon.

##C++ (recommended)
Install emscripten emsdk and em++.

Copy code build into public folder for example if using create react app (refer to create react app docs), and import js file.
```
em++ ./src/Game.cpp --source-map-base localhost:3000 -O0 -g4 --emit-symbol-map -s WASM=1 -o build/game-wasm.js
```


##Rust Usage:
During the development of the engine, it was hard to incorporate webpack using wasm_bindgen.
Therefore, it is recommended to use the browser - no es6 modules build.

###Example
Have rust code build into public folder for example if using create react app (refer to create react app docs), and import js file.
```
wasm-pack build --target no-modules
rm ./pkg/battle_rust.d.ts
rm ./pkg/battle_rust_bg.d.ts
cp -rf ./pkg/* ../js/public/game-wasm/
```

Load this script after you load the wasm file in index.html
```
// the `wasm_bindgen` global is set to the exports of the Rust module
// we'll defer our execution until the wasm is ready to go
function run(mod) {
  window.wasm = mod;
  window.wasmLoaded = true;
  const event = new Event('wasm_load');
  document.dispatchEvent(event);
}

window.wasm_bindgen('game-wasm/battle_rust_bg.wasm').then(run);
```
This will dispatch an event to the game engine, for the game engine to register the correct handlers in wasm.

```
import engine from @kf/game-engine;
engine.start(config.game, mainGameViewRef, storeFn(store), assetDicts);
```

##Character Concepts

Sprite: Actual Sprite entity
CharType: A type of character that includes sprites and traits
A entity shoudl be created using a character factory to create a particular type of char
Character: A playable entity that is a character type with sprite and pos attributes

You will need to define a characterdict, use createCharacters(config, charFactoryDict)

For use development use locally in other libraries:

lerna bootstrap --npm -client=yarn
lerna link
yarn in each package

yarn link package in dependent project
