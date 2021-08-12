import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};


export const useResizeObserver = ref => {
  const [dimensions, setDimensions] = useState(null);

  const debounced = useDebounce(dimensions, 1000);
  useEffect(() => {
    const observingTarget = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;

      setDimensions({ width, height });
    });

    resizeObserver.observe(observingTarget);

    return () => {
      resizeObserver.unobserve(observingTarget);
    };
  }, [ref]);

  return debounced;
};
