import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { updateUserStart,updateUserFailure,updateUserSuccess,deleteUserFailure,deleteUserStart,deleteUserSuccess,signOutUserStart,signOutUserFailure,signOutUserSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import {Link} from 'react-router-dom'
function Profile() {
  const dispatch=useDispatch();
  const { currentUser ,loading,error} = useSelector((state) => state.user);
  const fileRef = useRef(null);
const [handleShowListingsError,sethandleShowListingsError]=useState(false)
  const [file, setFile] = useState(undefined);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});
const [updateSuccess,setUpdateSuccess]=useState(false);
const [userListings,setUserListings]=useState([])

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
const handleFileUpload = async (file) => {
   if (file.size > 2 * 1024 * 1024) {
    setFileUploadError(true);
    return;
  }
  const formDataToSend = new FormData();
  formDataToSend.append('image', file);

  // Simulate percentage using a timer
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    setFilePerc(progress);
    if (progress >= 90) clearInterval(interval);
  }, 200);

  try {
    const res = await fetch('/api/auth/upload', {
      method: 'PATCH',
      body: formDataToSend,
    });

    const data = await res.json();

    clearInterval(interval); // stop the fake loading

    if (data.success === false) {
      setFileUploadError(true);
      setFilePerc(0);
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: data.imageUrl }));
    setFileUploadError(false);
    setFilePerc(100);
  } catch (error) {
    clearInterval(interval);
    setFileUploadError(true);
    setFilePerc(0);
    console.error('Cloudinary upload error:', error);
  }
};
const handleChange=(e)=>{
  setFormData({...formData,[e.target.id]:e.target.value})
}
//handleSubmit func is used to send form data to backend
const handleSubmit=async(e)=>{
  e.preventDefault();
  try{
     dispatch(updateUserStart());
     const res= await fetch(`/api/user/update/${currentUser._id}`,{
      method: 'PATCH',
      headers:{
        'Content-Type' : 'application/json'
      },
      credentials: 'include', 
      body:JSON.stringify(formData)
     });
     const data=await res.json();
     if (data.success === false) {
            dispatch(updateUserFailure(data.message));
     
             return;
           }
     
           dispatch(updateUserSuccess(data))
           setUpdateSuccess(true)
  }
  catch(error){
dispatch(updateUserFailure(error.message))
  }
}
const handleListingDelete=async(listingId)=>{
try{
const res=await fetch(`/api/listing/delete/${listingId}`,{
  method: 'DELETE',
})
const data=await res.json();
if(data.success===false){
 console.log(data.message);
  return;
}
setUserListings((prev)=>prev.filter((listing)=>listing._id !== listingId))
}catch(error){
  console.log(error.message);
}
}
const handleDelete=async()=>{
  try{
    dispatch(deleteUserStart());
const res=await fetch(`/api/user/delete/${currentUser._id}`,{
  method: 'DELETE',

})
const data=await res.json();
if(data.success===false){
 dispatch(deleteUserFailure(data.message));
  return;
}
dispatch(deleteUserSuccess(data)) 
  }catch(error){
    dispatch(deleteUserFailure(error.message));
  }
}
const handleSignOut=async()=>{
  try{
dispatch(signOutUserStart());
const res=await fetch('/api/auth/signout')
const data=await res.json();
if(data.success===false){
   dispatch(signOutUserFailure(data.message));
  return;
  }
dispatch(signOutUserSuccess(data))
}
  catch(error){
 return dispatch(signOutUserFailure(error.message));
 
  }}
const handleShowListings=async()=>{
try{
  sethandleShowListingsError(false)
const res=await fetch(`/api/user/listings/${currentUser._id}`);
const data=await res.json();
if(data.success===false){
   sethandleShowListingsError(true)
  return;
  }
  setUserListings(data)
}catch(error){
return dispatch(sethandleShowListingsError(error.message));  
}
}
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error uploading image (must be under 2MB)
            </span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image uploaded successfully!</span>
          ) : filePerc > 0 ? (
            <span className='text-slate-700'>Uploading {filePerc}%</span>
          ) : (
            ''
          )}
        </p>
       <input
  type='text'
  placeholder='username'
  className='border p-3 rounded-lg'
  id='username'
  value={formData.username || currentUser.username}
  onChange={handleChange}
/>

      <input
  type='email'
  placeholder='email'
  className='border p-3 rounded-lg'
  id='email'
  value={formData.email || currentUser.email}
  onChange={handleChange}
/>

      <input
  type='password'
  placeholder='password'
  className='border p-3 rounded-lg'
  id='password'
  onChange={handleChange}
/>

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link className="text-white bg-green-700 text-center p-3 rounded-lg uppercase hover:opacity-85" to={"/create-listing"}>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDelete} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    
       <p className='text-green-700 mt-5'>{updateSuccess ? 'user is updated successfully!' : ''}</p>
       <button onClick={handleShowListings} className='text-green-700 w-full'>Show Listings</button>
       <p className='mt-5 text-red-700'>{handleShowListingsError ? 'Error Listings Show' : ''}</p>
{userListings &&
 userListings.length > 0 && 
<div className='flex flex-col gap-4'>
  <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
 { userListings.map((listing)=> <div key={listing._id} className='border-bottom rounded-lg gap-4 p-3 flex justify-between items-center'>
<Link to={`/listing/${listing._id}`}>
<img src={listing.imageUrls[0]} className='h-16 w-16 object-contain' alt='listing-cover'/>
</Link>
<Link className='flex-1 text-slate-700 font-semibold gap-4 hover:underline truncate' to={`/listing/${listing._id}`}>
<p>{listing.name}</p>
</Link>
<div className='flex flex-col item-center'>
  <button onClick={()=>{handleListingDelete(listing._id)}} className='text-red-700 uppercase '>Delete</button>
  <Link to={`/update-listing/${listing._id}`}>  <button className='text-green-700 uppercase '>Edit</button></Link>
  

</div>
</div>
)}
</div>}
 
    </div>
  );
}

export default Profile;