import React from 'react'
import { Link } from 'react-router-dom'


const Advertisement = () => {
  return (
    <div className='lg:px-10 py-10 bg-[#F5F9FA]'>
        <div className='xl:h-[300px]   flex flex-col-reverse xl:flex-row justify-center items-center bg-[#FFF] rounded-xl shadow-sm'>
            <div className="text-part flex flex-col items-start w-full px-10 py-10">
                <Link to="/dashboard" className=" border cursor-pointer w-fit bg-[#195AFE] text-white px-6 py-2 rounded-lg text-sm font-semibold ">Explore</Link>
                <div className="mt-4 font-semibold text-xl  xl:text-3xl w-[70%] text-left text-black">Overview of all Government schemes at Your Ease </div>
                <div className="mt-4 text-left w-[70%] text-xs xl:text-sm text-[#737373] ">Search for what is meant for you, under different initiatives of your government</div>
            </div>
            <div className="w-[90%] xl:w-[50%] flex justify-start xl:justify-center pr-20  xl:px-10  py-10">
                <img className='rounded-lg' src="https://cdn.dribbble.com/users/130603/screenshots/5685838/ab_bookdemo_anim_dribbble.gif" alt="" />
            </div>
        </div>
    </div>
  )
}

export default Advertisement