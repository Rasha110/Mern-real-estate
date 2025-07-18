import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import About from './pages/About'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import Header from './components/Header'
import PrivateRouter from './components/PrivateRouter'
import CreateListing from './pages/CreateListing'
function App() {
  return <BrowserRouter>
  <Header/>
  <Routes>
    <Route path='/' element={<Home/>}/>
     <Route path='/sign-in' element={<SignIn/>}/>
      <Route path='/sign-up' element={<SignUp/>}/>
       <Route path='/about' element={<About/>}/>
       <Route element={<PrivateRouter/>}>
 <Route path='/profile' element={<Profile/>}/></Route>
  <Route path='/create-listing' element={<CreateListing/>}/>

  </Routes>
  </BrowserRouter>
}

export default App
