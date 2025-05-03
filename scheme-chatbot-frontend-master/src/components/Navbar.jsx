import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using react-router for navigation
import { RxCross2 } from "react-icons/rx";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className=" bg-white sticky top-0 ">
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        {/* Brand Logo and Name */}
        <div className="text-2xl font-bold text-black">
          <Link to="/">
          <div className="flex space-x-2 ">
            <div className="w-9 scale-125">
              <img src="https://bcassetcdn.com/public/blog/wp-content/uploads/2022/06/22195542/Meta.png" alt="" />
            </div>
            <div className="brand-name flex items-end">
              Shashanyaan
            </div>
          </div>
          </Link>
        </div>

        {/* Navigation Items for Desktop */}
        <div className="hidden xl:flex space-x-8">
          <Link to="/" className="text-black hover:text-[#014CD3]">Home</Link>
          <Link to="/scheme-bot" className="text-black hover:text-[#014CD3]">SchemeBot</Link>
          <Link to="/constituition-bot" className="text-black hover:text-[#014CD3]">ConstitutionBot</Link>
          <Link to="/learn" className="text-black hover:text-[#014CD3]">Learn</Link>
          <Link to="/create" className="text-black hover:text-[#014CD3]">Create</Link>
          <a href="https://scheme-flask-api.onrender.com/" target='another' className="text-black hover:text-[#014CD3]">API</a>
        </div>

        {/* Auth Buttons */}
        <div className="hidden xl:flex space-x-4 text-sm font-semibold">
          <Link to="/login" className="bg-gradient-to-b from-[#014CD3] to-[#256FEF] text-white px-4 py-2 rounded-full ">Login</Link>
          <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">Sign Up</Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="xl:hidden">
          <button onClick={toggleMobileMenu} className="focus:outline-none">
            {isMobileMenuOpen?
            (<div className=''><RxCross2 /></div>)
            :
            (
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-light-grey px-5 py-2 font-semibold">
          <Link to="/" className="block text-black py-2 hover:text-[#014CD3]">Home</Link>
          <Link to="/about" className="block text-black py-2 hover:text-[#014CD3]">SchemeBot</Link>
          <Link to="/services" className="block text-black py-2 hover:text-[#014CD3]">ConstitutionBot</Link>
          <Link to="/portfolio" className="block text-black py-2 hover:text-[#014CD3]">Learn</Link>
          <Link to="/contact" className="block text-black py-2 hover:text-[#014CD3]">Create</Link>
          <div className="mt-4 flex flex-col space-y-3">
            <Link to="/login" className="flex justify-center bg-gradient-to-b from-[#014CD3] to-[#256FEF] text-white px-4 py-2 rounded-full ">Login</Link>
            <Link to="/signup" className="flex justify-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;