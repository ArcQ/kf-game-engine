import {
  buffer, bufferCount, map,
} from 'rxjs/operators';

/**
 * getFps - Average every 10 Frames to calculate our FPS
 * @param frames$ - frame obs created by createGameLoop
 * @example
  .subscribe((avg) => {
    fps.innerHTML = Math.round(avg) + '';
  })
 * @returns {Observable}
 */
export function getFPS(frames$) {
  return frames$
    .pipe(
      bufferCount(10),
      map((frames) => {
        const total = frames
          .reduce((acc, curr) => acc + curr, 0);

        return 1 / (total / frames.length);
      }),
    );
}

/**
 * clampToFPS(frame)
 *
 * @param frame - the frame data to check if we need to clamp to max of
 *  30fps time.
 *
 * If we get sporadic LONG frames (browser was navigated away or some other reason the frame
 * takes a while) we want to throttle that so we don't JUMP ahead in any deltaTime calculations
 * too far.
 * @returns function
 */
export const clampToFPS = fps => (frame) => {
  if (frame.deltaTime > (1 / fps)) {
    frame.deltaTime = 1 / fps;
  }
  return frame;
};
