import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    colors: {
      brandBg: '#000000',
      brandCard: '#0C121E',
      blueSlate: '#495867',
      glaucous: '#577399',
      paleSky: '#BDD5EA',
      ghostWhite: '#F7F7FF',
      coral: '#FE5F55',
    },
  },
})
