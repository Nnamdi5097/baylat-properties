 import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function AdminDashboard() {
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        // Fetching all listings from the database
        const res = await fetch('/api/listing/get?limit=100'); 
        const data = await res.json();
        setAllListings(data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching listings:", error);
        setLoading(false);
      }
    };
    fetchAllListings();
  }, []);

  const handleDelete = async (listingId) => {
    if (window.confirm("ARE YOU SURE? As an Admin, this will permanently delete this property from the website.")) {
      try {
        const res = await fetch(`/api/listing/delete/${listingId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        
        if (data.success === false) {
          alert(data.message);
          return;
        }
        
        // Update the UI immediately
        setAllListings((prev) => prev.filter((listing) => listing._id !== listingId));
        alert("Property deleted successfully.");
      } catch (error) {
        alert("Failed to delete. Check connection.");
      }
    }
  };

  if (loading) return <p className='text-center my-10 text-xl font-semibold'>Loading Property Database...</p>;

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-black text-center my-10 text-slate-900 uppercase tracking-tight'>
        Baylat <span className='text-green-600'>Admin Manager</span>
      </h1>
      
      <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mb-8'>
        <p className='text-blue-700 text-sm'>
          <strong>Admin Mode:</strong> You are seeing every listing on the platform. Use "Force Delete" to remove old or incorrect entries.
        </p>
      </div>

      {allListings.length === 0 ? (
        <p className='text-center text-slate-500'>No properties found in the database.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allListings.map((listing) => (
            <div key={listing._id} className='flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-4'>
                <img 
                  src={listing.imageUrls[0]} 
                  alt="property" 
                  className='w-20 h-20 object-cover rounded-xl shadow-inner' 
                />
                <div>
                  <p className='font-bold text-slate-800 text-lg leading-tight'>{listing.name}</p>
                  <p className='text-xs text-slate-400 mt-1 uppercase font-semibold'>Listing ID: {listing._id}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(listing._id)} 
                className='bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase transition-colors'
              >
                Force Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}