Character Concepts

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
