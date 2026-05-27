import React from 'react';
import { FaHome } from 'react-icons/fa';

export default function About() {
  return (
    <div className='flex flex-col bg-white'>
      {/* RECONSTRUCTED COVER IMAGE (Based on your photo) */}
      <div 
        className='h-[400px] flex items-center justify-center relative'
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), #C9A04B`,
        }}
      >
          {/* Logo element digitally reconstructed */}
          <div className='flex flex-col items-center gap-3 z-10'>
             <div className='border-[10px] border-green-600 rounded-full p-10 bg-green-50 shadow-xl'>
                 <FaHome className='text-green-700 text-9xl' />
                 <div className='absolute inset-0 flex items-center justify-center'>
                      <span className='text-slate-800 text-8xl font-bold'>B</span>
                 </div>
             </div>
             <p className='text-white text-5xl font-extrabold uppercase tracking-widest'>
                About Us
             </p>
             <p className='text-green-100 text-xl font-bold'>BayLat Properties</p>
          </div>
      </div>

      <div className='py-20 px-4 max-w-6xl mx-auto'>
        <h2 className='text-4xl font-black mb-8 text-slate-900 border-b-4 border-green-600 w-fit pb-3'>
            About BayLat Real Estate
        </h2>
        <p className='mb-6 text-slate-700 text-lg leading-relaxed'>
            <span className='font-bold text-slate-900'>BayLat Real Estate</span> is a leading real estate agency that specializes in helping clients buy, sell, and rent properties in the most desirable neighborhoods. Our team of experienced agents is dedicated to providing exceptional service and making the buying and selling process as smooth as possible.
        </p>
        
        {/* Quote reconstructed from image theme */}
        <div className='my-10 bg-green-50 p-6 rounded-lg border-l-8 border-green-700 shadow-sm'>
            <p className='text-2xl font-semibold italic text-green-900 leading-tight'>
                "We understand that not every treasure is gold & silver. Your perfect home, investment, or plot of land is the real treasure, and we are dedicated to finding it for you."
            </p>
            <p className='text-slate-700 text-right font-medium mt-3'>— BayLat Team</p>
        </div>

        <p className='mb-6 text-slate-700 text-lg leading-relaxed'>
            Our mission is to help our clients achieve their real estate goals by providing expert advice, personalized service, and a deep understanding of the local market. Whether you are looking to buy, sell, or rent a property, we are here to help you every step of the way.
        </p>
        <p className='mb-6 text-slate-700 text-lg leading-relaxed'>
            Our team of agents has a wealth of experience and knowledge in the real estate industry, and we are committed to providing the highest level of service to our clients. We believe that buying or selling a property should be an exciting and rewarding experience, and we are dedicated to making that a reality for each and every one of our clients.
        </p>
      </div>
    </div>
  );
}

