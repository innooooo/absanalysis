import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import { Route, Routes } from 'react-router-dom'
import UploadPage from './components/UploadPage'
import NotFoundPage from './components/NotFoundPage'


function App() {
  return (
    <Routes>
      <Route path='/' element={<NavBar/>}>
        <Route index element={<HomePage/>}/>
        <Route path='upload' element={<UploadPage/>}/>
        <Route path='*' element={<NotFoundPage/>}/>
      </Route>
    </Routes>
  )
}

export default App
