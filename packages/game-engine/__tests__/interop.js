import { createStateBuilder } from '../src/render/State.bs';

test('createStateBuilder', () => {
  const charTypeDicts = {
    assasin: {
      animationSpeed: 0.3,
      spriteSheetKs: ['chars', 'assasins0', '1_IDLE'],
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
      },
    },
    knight: {
      spriteSheetArgs: ['chars', 'knights0', '_IDLE/_IDLE'],
    },
  };
  const initialCharConfig = {
    P1: {
      charK: 'assasin',
      pos: [100, 100],
    },
    P2: {
      charK: 'knight',
      pos: [200, 200],
    },
  };
  const initState = createStateBuilder(charTypeDicts);
  expect(initState({ charConfig: initialCharConfig })).toBe(1);
});
