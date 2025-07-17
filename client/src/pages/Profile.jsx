import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { updateUserStart,updateUserFailure,updateUserSuccess,deleteUserFailure,deleteUserStart,deleteUserSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
function Profile() {
  const dispatch=useDispatch();
  const { currentUser ,loading,error} = useSelector((state) => state.user);
  const fileRef = useRef(null);

  const [file, setFile] = useState(undefined);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});
const [updateSuccess,setUpdateSuccess]=useState(false);

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

const handleDelete=async()=>{
  try{
    dispatch(deleteUserStart());
const res=await fetch(`/api/user/delete/${currentUser._id}`,{
  method: 'DELETE',

})
const data=await res.json();
if(data.success===false){
  return dispatch(deleteUserFailure(data.message));
  return;
}
dispatch(deleteUserSuccess(data)) 
  }catch(error){
    dispatch(deleteUserFailure(error.message));
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
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDelete} className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    
       <p className='text-green-700 mt-5'>{updateSuccess ? 'user is updated successfully!' : ''}</p>
    </div>
  );
}

export default Profile;
