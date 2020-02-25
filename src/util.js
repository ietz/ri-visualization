export const conjoin = (...fns) => (...args) => {
  return fns.reduce((acc, fn) => (acc && fn(...args)), true);
};

// eslint-disable-next-line no-undefined
export const withDefault = (value, defaultValue) => ((value === undefined) ? defaultValue : value);
