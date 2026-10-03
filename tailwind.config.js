export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        messenger: {
          blue: '#0084FF',
          bubble: '#F0F0F0',
          surface: '#F0F2F5',
          hover: '#F2F2F2',
          text: '#050505',
          muted: '#65676B',
          online: '#31A24C',
          divider: '#E4E6EB',
          dot: '#90949C',
        },
        gpt: {
          text: '#0D0D0D',
          muted: '#5D5D5D',
          placeholder: '#8F8F8F',
          sidebar: '#F9F9F9',
          hover: '#EFEFEF',
          active: '#E3E3E3',
          bubble: '#F4F4F4',
          border: '#E5E5E5',
        },
      },
    },
  },
};
