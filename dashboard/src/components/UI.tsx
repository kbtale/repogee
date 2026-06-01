import type { JSX } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  href?: string
  target?: string
  rel?: string
  children: JSX.Element
}

export function Button(props: ButtonProps) {
  const base = "py-3.5 px-6 rounded-full font-montserrat font-bold text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer active:opacity-90 inline-flex items-center justify-center gap-3 no-underline"
  
  const styles = {
    primary: "bg-theme-accent text-[#070A13] hover:bg-theme-primary hover:text-theme-bg",
    secondary: "bg-theme-primary text-theme-bg hover:bg-theme-accent hover:text-[#070A13]",
    outline: "bg-transparent border border-theme-border text-theme-primary hover:bg-theme-primary hover:text-theme-bg"
  }
  
  const combinedClass = () => `${base} ${styles[props.variant || 'primary']} ${props.class || ''}`

  return (
    <span class="contents">
      {props.href ? (
        <a
          href={props.href}
          target={props.target}
          rel={props.rel}
          class={combinedClass()}
        >
          {props.children}
        </a>
      ) : (
        <button
          {...props}
          class={combinedClass()}
        >
          {props.children}
        </button>
      )}
    </span>
  )
}

interface CardProps {
  children: JSX.Element
  class?: string
}

export function Card(props: CardProps) {
  return (
    <div class={`bg-theme-card border border-theme-border rounded-3xl p-8 transition-colors duration-200 ${props.class || ''}`}>
      {props.children}
    </div>
  )
}

interface PillHeaderProps {
  children: JSX.Element
  class?: string
}

export function PillHeader(props: PillHeaderProps) {
  return (
    <header class={`max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 mt-2 sm:mt-4 sticky top-0 z-50 ${props.class || ''}`}>
      <div class="border border-theme-border rounded-full py-2.5 px-4 sm:px-8 flex justify-between items-center bg-theme-card/90 backdrop-blur-md transition-colors duration-200 shadow-sm">
        {props.children}
      </div>
    </header>
  )
}
