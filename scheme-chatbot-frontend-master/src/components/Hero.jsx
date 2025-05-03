import React from 'react'

const Hero = () => {
  return (
    <div className='hero bg-white px-5 xl:px-10 py-10 flex space-x-5 '>
        <div className="text-part flex flex-col space-y-8">
            <div className="flex flex-col justify-left items-start   ">
                <div className="headline font-semibold text-2xl xl:text-[44px] leading-[44px]  text-start  mb-6 text-black">For Understanding Government <span className='text-[#0846D1]'> Operations</span> & <span className='text-[#0846D1]'>Schemes</span></div>
                <div className="tagline text-sm xl:text-lg w-[80%] text-start  text-[#ABB0BC]">Empowering Citizens with Clear Insights and Comprehensive Understanding of Government Operations and Schemes</div>
            </div>

            <div className="buttons flex items-center  justify-start  space-x-3 text-xs xl:text-sm font-semibold">
                <div className="">
                    <button className='bg-gradient-to-b from-[#014CD3] to-[#256FEF] text-white px-5 py-2 rounded-lg hover:bg-white'>Try for Free</button>
                </div>
                <div className="">
                    <button className='border bg-[#FFF]  border-[#D1ECFF] text-black  px-5 py-2 rounded-lg'>Contact Us</button>
                </div>
            </div>
        </div>
        <div className="">
            <img className='xl:w-[500px] rounded-xl' src="https://proeffico.com/wp-content/uploads/2023/09/Hand-Work.gif" alt="" />
        </div>
    </div>
  )
}

export default Hero