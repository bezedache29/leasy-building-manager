const staticZiggy = {
  url: 'https://leasy.dev.localhost',
  port: null,
  defaults: {},
  routes: {
    /* ... */
  },
};

const Ziggy =
  typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined'
    ? {
        ...staticZiggy,
        ...window.Ziggy,
        routes: {
          ...staticZiggy.routes,
          ...window.Ziggy.routes,
        },
      }
    : staticZiggy;

export { Ziggy };
