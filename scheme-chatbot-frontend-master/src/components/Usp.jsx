import React from 'react'
import { IoBookSharp } from "react-icons/io5";
import { TbBulbFilled } from "react-icons/tb";
import { BsFillPersonFill } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { FaGlobeAmericas } from "react-icons/fa";

const Usp = () => {
  return (
    <div className='flex flex-col items-center px-5 bg-[#151B2F] py-16'>
        <div className="text-2xl font-semibold text-center text-white">Multiple Advantages Working with us</div>
        <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 px-10 xl:px-0  w-full mt-[56px]">
          <div className="flex justify-between w-full xl:px-20 text-3xl xl:text-6xl text-[#FAFAFB]">
              <div className="flex flex-col items-center justify-center">
                <div className="icon"><TbBulbFilled /></div>
                <div className="text-sm  mt-2 font-semibold">Knowledge</div>
              </div>  
              <div className="flex flex-col items-center justify-center">
                <div className="icon"><IoBookSharp /></div>
                <div className="text-sm  mt-2 font-semibold">Learn</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="icon"><BsFillPersonFill /></div>
                <div className="text-sm  mt-2 font-semibold">Empower</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="icon"><AiOutlineStock/></div>
                <div className="text-sm  mt-2 font-semibold">Grow </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="icon"><FaGlobeAmericas/></div>
                <div className="text-sm  mt-2 font-semibold">Global</div>
              </div>
          </div>
        </div>
    </div>
  )
}

export default Usp