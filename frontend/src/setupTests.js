import '@testing-library/jest-dom';

// global test setup
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};
