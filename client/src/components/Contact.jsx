import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
export default function Contact({listing}) {
    const [landlord,setLandlord]=useState(null);
    const [message,setMessage]=useState('')
    const onChange=(e)=>{
      setMessage(e.target.value)
    }
    useEffect(()=>{
const fetchLandLord=async()=>{
  try{
const res=await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/${listing.userRef}`);
const data=await res.json();
setLandlord(data);
  }
  catch(error){
console.log(error);
  }
}
fetchLandLord();
    },[listing.userRef])
  return (
    <>
    {landlord && (
      <div className='flex flex-col gap-3'>
        <p className=''>Contact <span className='font-semibold'>{landlord.username}</span>for <span  className='font-semibold'>{listing.name.toLowerCase()}</span></p>
        <textarea placeholder='Enter your message here...' className='w-full p-3 border rounded-lg ' name='message' id='message' cols="33" rows="10" value={message} onChange={onChange}></textarea>
    <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
          >
            Send Message          
          </Link>
      </div>
    )}  
    </>
  )
}


