import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleImageSubmit = async () => {
  setImageUploadError(false);

  // ✅ 1. Check how many files + existing
  if (files.length === 0) {
    setImageUploadError('Please select at least one image');
    return;
  }

  if (files.length + formData.imageUrls.length > 6) {
    setImageUploadError('You can only upload up to 6 images');
    return;
  }

  // ✅ 2. Check each file size (< 2MB = 2 * 1024 * 1024)
  for (let file of files) {
    if (file.size > 2 * 1024 * 1024) {
       setImageUploadError(error.message || 'Image upload failed');
      return;
    }
  }

  // ✅ 3. Upload if all OK
  setUploading(true);
  try {
    const promises = files.map(storeImage);
    const urls = await Promise.all(promises);
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...urls],
    }));
  } catch (err) {
    console.error(err);
    setImageUploadError('Image upload failed (check format or size)');
  } finally {
    setUploading(false);
  }
};


  const storeImage = async (file) => {
    console.log('Cloudinary preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
formData.append('upload_preset', 'real_estate_upload');
console.log("Upload preset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    fetch('https://api.cloudinary.com/v1_1/dpgxclwry/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Cloudinary response:', data); // ✅ Debug log
        if (data.secure_url) resolve(data.secure_url);
        else reject(new Error(data.error?.message || 'Upload failed'));
      })
      .catch((err) => {
        console.log('Cloudinary error:', err); // ✅ Debug log
        reject(err);
      });
  });
};


  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

const handleChange = (e) => {
  const { id, value, checked, type } = e.target;

  setFormData((prev) => {
    let updatedData;

    if (id === 'sale' || id === 'rent') {
      updatedData = { ...prev, type: id };
    } else if (id === 'parking' || id === 'furnished' || id === 'offer') {
      updatedData = { ...prev, [id]: checked };
    } else if (type === 'text' || type === 'number' || type === 'textarea') {
      updatedData = { ...prev, [id]: value };
    } else {
      updatedData = prev; // fallback
    }

    console.log('Updated form data:', updatedData); // 👈 shows current data
    return updatedData;
  });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);

   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/listing/create`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${currentUser.token}`, // ✅ send token
  },
  body: JSON.stringify({ ...formData, userRef: currentUser._id }),
});

      const data = await res.json();
      setLoading(false);
      if (data.success === false) return setError(data.message);
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input type='text' id='name' placeholder='Name' className='border p-3 rounded-lg' maxLength='62' minLength='10' required onChange={handleChange} value={formData.name} />
          <textarea id='description' placeholder='Description' className='border p-3 rounded-lg' required onChange={handleChange} value={formData.description} />
          <input type='text' id='address' placeholder='Address' className='border p-3 rounded-lg' required onChange={handleChange} value={formData.address} />

          <div className='flex gap-6 flex-wrap'>
            {['sale', 'rent', 'parking', 'furnished', 'offer'].map((item) => (
              <div className='flex gap-2 items-center' key={item}>
                <input type='checkbox' id={item} className='w-5 h-5' onChange={handleChange} checked={formData[item] || formData.type === item} />
                <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap gap-4'>
            {['bedrooms', 'bathrooms', 'regularPrice'].map((field) => (
              <div className='flex items-center gap-2' key={field}>
                <input type='number' id={field} min='1' max='1000000' required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData[field]} />
                <p>{field.charAt(0).toUpperCase() + field.slice(1)}</p>
              </div>
            ))}
            {formData.offer && (
              <div className='flex items-center gap-2'>
                <input type='number' id='discountPrice' min='0' max='10000000' required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData.discountPrice} />
                <p>Discounted Price</p>
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images: <span className='font-normal text-gray-600 ml-2'>(max 6 - first is cover)</span>
          </p>

          <div className='flex gap-4'>
            <input onChange={(e) => setFiles(Array.from(e.target.files))} className='p-3 border border-gray-300 rounded w-full' type='file' accept='image/*' multiple />
            <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>

          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div key={index} className='flex justify-between p-3 border items-center'>
                <img src={url} alt='listing' className='w-20 h-20 object-contain rounded-lg' />
                <button type='button' onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>Delete</button>
              </div>
            ))}

          <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>

          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}

export default CreateListing;
