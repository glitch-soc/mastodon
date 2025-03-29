import { useEffect, useState } from 'react';

import { animated, useSpring, config } from '@react-spring/web';

import { reduceMotion } from '../initial_state';

import { ShortNumber } from './short_number';

const obfuscatedCount = (count: number) => {
  if (count < 0) {
    return 0;
  } else if (count <= 1) {
    return count;
  } else {
    return '1+';
  }
};

interface Props {
  value: number;
  obfuscate?: boolean;
}
export const AnimatedNumber: React.FC<Props> = ({ value, obfuscate }) => {
  const [previousValue, setPreviousValue] = useState(value);
  const direction = value > previousValue ? -1 : 1;

  const [styles, api] = useSpring(
    () => ({
      from: { transform: `translateY(${100 * direction}%)` },
      to: { transform: 'translateY(0%)' },
      onRest() {
        setPreviousValue(value);
      },
      config: { ...config.gentle, duration: 200 },
      immediate: true, // This ensures that the animation is not played when the component is first rendered
    }),
    [value, previousValue],
  );

  // When the value changes, start the animation
  useEffect(() => {
    if (value !== previousValue) {
      void api.start({ reset: true });
    }
  }, [api, previousValue, value]);

  if (reduceMotion) {
    return obfuscate ? (
      <>{obfuscatedCount(value)}</>
    ) : (
      <ShortNumber value={value} />
    );
  }

  return (
    <span className='animated-number'>
      <animated.span style={styles}>
        {obfuscate ? obfuscatedCount(value) : <ShortNumber value={value} />}
      </animated.span>
      {value !== previousValue && (
        <animated.span
          style={{
            ...styles,
            position: 'absolute',
            top: `${-100 * direction}%`, // Adds extra space on top of translateY
          }}
          role='presentation'
        >
          <ShortNumber value={previousValue} />
          {obfuscate ? (
            obfuscatedCount(previousValue)
          ) : (
            <ShortNumber value={previousValue} />
          )}
        </animated.span>
      )}
    </span>
  );
};
