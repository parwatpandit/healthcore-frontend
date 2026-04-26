// import { Outlet } from 'react-router-dom'
// import Sidebar from './Sidebar'

// const Layout = () => {
//   return (
//     <div className="flex min-h-screen" style={{ background: '#080b11' }}>
//       <Sidebar />
//       <main className="flex-1 ml-60 p-8">
//         <Outlet />
//       </main>
//     </div>
//   )
// }

// export default Layout

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="flex min-h-screen" style={{ background: '#080b11' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout