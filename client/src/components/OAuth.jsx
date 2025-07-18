import React from 'react'
import {GoogleAuthProvider, signInWithPopup,getAuth} from 'firebase/auth'
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
function OAuth() {
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const handleGoogleClick=async()=>{
try{
const provider=new GoogleAuthProvider();
const auth=getAuth(app)
const result=await signInWithPopup(auth,provider);
//now we want to send info to backend
const res=await fetch("/api/auth/google",{
    method:'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({name:result.user.displayName,email:result.user.email,photo:result.user.photoURL}),
})
const data=await res.json();
dispatch(signInSuccess(data))
navigate("/");
}catch(error){
  console.log('Could not sign in with google',error);  
}
    }
  return (
    <button onClick={handleGoogleClick} type='button' className='text-white bg-red-700  p-3 rounded-lg uppercase hover:opacity-95'>Continue with google</button>
  )
}

export default OAuth
