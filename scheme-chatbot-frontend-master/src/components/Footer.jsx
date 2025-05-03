import React from 'react'

const Footer = () => {
  return (
    <div className='bg-[#151B2F] p-7 rounded-xl text-white mb-10'>
        <div className="flex flex-col space-y-8 xl:space-y-0 xl:flex-row justify-start xl:justify-between pb-7 border-0 border-b border-b-white">
            <div className="flex flex-col space-y-4 xl:justify-between">
                <div className="brand flex space-x-5">
                    <div className="w-5 scale-125">
                        {/* <img src="https://banner2.cleanpng.com/lnd/20240424/jf/transparent-meta-logo-logo-design-blue-logo-interlocking-ovals-logo-with-overlapping-ovals-letter-o66298832c312e9.71031057.webp" alt="" /> */}
                    </div>
                    <div className="brandName text-2xl font-semibold">Shashanyaan</div>
                </div>
                <div className="place-contact flex space-x-16 text-sm font-semibold">
                    <div className="place">Mumbai, India</div>
                    <div className="contact">+91 9977886655</div>
                </div>
            </div>
            <div className="flex space-x-20">
                <div className="flex flex-col space-y-3">
                    <div className="text-sm font-semibold">Services</div>
                    <div className="text-sm font-semibold">About</div>
                    <div className="text-sm font-semibold">Testimonials</div>
                    <div className="text-sm font-semibold">Pricing</div>
                    <div className="text-sm font-semibold">FAQ</div>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="text-sm font-semibold">Instagram</div>
                    <div className="text-sm font-semibold">Facebook</div>
                    <div className="text-sm font-semibold">LinkedIn</div>
                    <div className="text-sm font-semibold">X</div>
                    <div className="text-sm font-semibold">Youtube</div>
                </div>
            </div>
        </div>
        <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0  xl:justify-between text-sm font-semibold mt-5">
            <div className="copy-right">&copy; 2024 MyCompany. All rights reserved</div>
            <div className="terms">Terms of Services</div>
        </div>
    </div>
  )
}

export default Footer