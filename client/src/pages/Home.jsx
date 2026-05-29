 import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
import { FaHome, FaSeedling, FaMapMarkedAlt, FaLock } from 'react-icons/fa';
import { useSelector } from 'react-redux'; // Added to check for admin status

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [plotListings, setPlotListings] = useState([]);
  const [acreListings, setAcreListings] = useState([]);
  
  const { currentUser } = useSelector((state) => state.user); // Get the current user

  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
        fetchPlotListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchPlotListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=plot&limit=4');
        const data = await res.json();
        setPlotListings(data);
        fetchAcreListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchAcreListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=acre&limit=4');
        const data = await res.json();
        setAcreListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <div className='relative w-full h-[650px] bg-white border-t-8 border-green-700 flex items-center overflow-hidden'>
        <div className='absolute -right-20 -bottom-20 opacity-10 rotate-12 z-0 scale-150'>
            <div className='border-8 border-green-600 rounded-full p-20'>
               <FaHome className='text-green-700 text-[300px]' />
               <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-slate-800 text-[200px] font-bold'>B</span>
               </div>
            </div>
        </div>

        <div className='flex flex-col md:flex-row gap-10 p-28 px-6 max-w-7xl mx-auto z-10 items-center'>
          <div className='flex flex-col gap-6 flex-1'>
            <h1 className='text-3xl lg:text-6xl font-extrabold uppercase' style={{ color: '#C9A04B' }}>
              Not Every<br /> Treasure<br /> <span className='text-slate-900'>Is Gold & Silver</span>
            </h1>
            
            <div className='text-green-800 font-medium text-lg leading-relaxed max-w-[500px] bg-green-50 p-4 rounded-lg border-l-4 border-green-600'>
              BayLat Real Estate believes the true treasure is the perfect space for your family or investment. We find the real gems in the local market.
            </div>
            
            <div className='flex flex-wrap gap-4'>
              <Link to={'/search'} className='text-white bg-green-700 hover:bg-green-800 px-8 py-4 rounded-full font-bold uppercase w-fit transition-all shadow-md'>
                Discover Your Treasure
              </Link>

              {/* ADMIN ACCESS BUTTON: Only visible to logged-in Admin */}
              {currentUser && currentUser.role === 'admin' && (
                <Link to={'/admin-manager'} className='flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full font-bold uppercase w-fit transition-all shadow-md'>
                  <FaLock /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className='flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 rounded-3xl shadow-inner border border-slate-200'>
              <div className='relative w-[300px] h-[300px] bg-white p-6 rounded-full border-4 border-slate-300 shadow-xl'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-[#C9A04B] rounded-full opacity-30 blur-3xl'></div>
                  <div className='absolute bottom-0 left-0 w-32 h-32 bg-green-300 rounded-full opacity-30 blur-3xl'></div>
                  
                  <div className='relative z-10 flex flex-col items-center gap-2'>
                     <div className='border-[10px] border-green-600 rounded-full p-6 bg-green-50 shadow-lg'>
                         <FaHome className='text-green-700 text-8xl' />
                         <div className='absolute inset-0 flex items-center justify-center'>
                              <span className='text-slate-800 text-6xl font-bold'>B</span>
                         </div>
                     </div>
                     <p className='text-slate-900 text-2xl font-black uppercase tracking-tight'>BayLat Properties</p>
                     <p className='text-slate-600 text-sm'>The Real Wealth is Real Estate</p>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* SWIPER */}
      <Swiper navigation className='max-w-6xl mx-auto rounded-lg overflow-hidden shadow-2xl mb-16'>
        {offerListings && offerListings.length > 0 && offerListings.map((listing) => (
          <SwiperSlide key={listing._id}>
            <div style={{ background: `url(${listing.imageUrls[0]}) center no-repeat`, backgroundSize: 'cover' }} className='h-[500px]'></div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* LISTINGS SECTIONS */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        
        {offerListings && offerListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Show more offers</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (<ListingItem listing={listing} key={listing._id} />))}
            </div>
          </div>
        )}

        {rentListings && rentListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (<ListingItem listing={listing} key={listing._id} />))}
            </div>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>Show more places for sale</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (<ListingItem listing={listing} key={listing._id} />))}
            </div>
          </div>
        )}

        {/* NEW SECTION: PLOTS */}
        {plotListings && plotListings.length > 0 && (
          <div className=''>
            <div className='my-3 flex items-center gap-2'>
              <FaMapMarkedAlt className='text-green-700' />
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Plots available</h2>
              <Link className='text-sm text-blue-800 hover:underline ml-auto' to={'/search?type=plot'}>Show more plots</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {plotListings.map((listing) => (<ListingItem listing={listing} key={listing._id} />))}
            </div>
          </div>
        )}

        {/* NEW SECTION: ACRES */}
        {acreListings && acreListings.length > 0 && (
          <div className=''>
            <div className='my-3 flex items-center gap-2'>
              <FaSeedling className='text-green-700' />
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Acres of land</h2>
              <Link className='text-sm text-blue-800 hover:underline ml-auto' to={'/search?type=acre'}>Show more acres</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {acreListings.map((listing) => (<ListingItem listing={listing} key={listing._id} />))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}