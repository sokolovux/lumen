import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const AppChromeContext = createContext<HTMLElement | null>(null)

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(ref.current)
  }, [])

  return (
    <AppChromeContext.Provider value={container}>
      <div
        ref={ref}
        data-slot="app-chrome"
        className="relative flex min-w-0 flex-1 overflow-hidden"
      >
        {children}
      </div>
    </AppChromeContext.Provider>
  )
}

export function useAppChromeContainer() {
  return useContext(AppChromeContext)
}
