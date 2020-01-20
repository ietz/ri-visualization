export const conjoin = (...fns) => (...args) => {
  return fns.reduce((acc, fn) => (acc && fn(...args)), true);
};
