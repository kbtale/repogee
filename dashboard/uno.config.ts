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
      theme: {
        bg: 'var(--theme-bg)',
        card: 'var(--theme-card)',
        border: 'var(--theme-border)',
        borderSub: 'var(--theme-border-sub)',
        primary: 'var(--theme-primary)',
        secondary: 'var(--theme-secondary)',
        accent: 'var(--theme-accent)',
        glaucous: 'var(--theme-glaucous)',
      },
      blueSlate: '#495867',
      glaucous: '#577399',
      paleSky: '#BDD5EA',
      ghostWhite: '#F7F7FF',
      coral: '#FE5F55',
    },
  },
})
