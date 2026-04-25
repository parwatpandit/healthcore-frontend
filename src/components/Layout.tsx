import { ReactNode } from 'react'
import Sidebar from './Sidebar'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen" style={{ background: '#080b11' }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  )
}

export default Layout