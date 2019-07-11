import { createCharFactory } from '../src/render/CharFactory';

jest.mock('kf-utils/dist/pixi/sprite');

test('createCharFactory', () => {
  const charTypeDicts = {
    assasin: {
      anims: {
        IDLE: ['chars', 'assasins0', '1_IDLE'],
        MOVE: ['chars', 'assasins0', '2_WALK'],
        SPOT_ATTACK: {
          frames: jest.fn(),
          spriteHandler: (sprite) => {
            sprite.loop = false;
          },
          onComplete: () => jest.fn(),
        },
        spriteSheetArgs: ['chars', 'assasins0', '1_IDLE'],
        knight: {
          spriteSheetArgs: ['chars', 'knights0', '_IDLE/_IDLE'],
        },
      },
    },
  };
  const charType = {
    P1: {
      charK: 'assasin',
      pos: [100, 100],
    },
    P2: {
      charK: 'knight',
      pos: [200, 200],
    },
  }
  console.log(createCharFactory(charTypeDicts, charType));
  expect().toBe();
});

