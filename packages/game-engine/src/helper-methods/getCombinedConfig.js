import { pipe, reduce, merge } from 'ramda';

const getCombinedProps = _charProps =>
  pipe(
    reduce((prev, [k, props]) => ({
      ...prev,
      [k]: merge(props.game, props.render),
    }), {}),
    merge({ keys: Object.keys(_charProps) }),
  )(Object.entries(_charProps));
