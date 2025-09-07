export const DEMO_STREAMS = {
  default: {
    // stable public test stream
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    poster: '',
    captions: [{ src: '/captions/en.vtt', srclang: 'en', label: 'English' }],
  },
}

export function getStreamFor(/* item */) {
  // later: map by item.id/type; for demo, return default
  return DEMO_STREAMS.default
}
