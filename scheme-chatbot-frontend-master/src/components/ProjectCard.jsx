import React from 'react'
import { MdRocketLaunch } from "react-icons/md";
import { FaAddressBook } from "react-icons/fa6";
import { Link } from 'react-router-dom';


const ProjectCard = ({title, description, imageLink, redirectLink}) => {
  return (
    <div className='p-5 flex flex-col bg-[#fff]  shadow-lg shadow-[#DFF0F6] rounded-xl'>
        <div className="image-part rounded-xl w-[100%]">
            <img className='w-[100%] h-[200px] rounded-2xl' src={imageLink} alt="" />
        </div>
        <div className="text-part mt-5">
            <div className="title text-[22px] text-black font-semibold">{title}</div>
            <div className="text-[#737373] text-sm mt-2">{description}</div>
        </div>
        <div className="buttons flex mt-4 space-x-3 pb-1">
            <Link to={redirectLink} className='bg-[#195AFE] flex space-x-2 items-center text-white text-xs font-semibold px-4 py-2 rounded-lg'>
                <div className="font-semibold text-lg flex items-center"><MdRocketLaunch /></div>
                <div className="">Launch</div>
            </Link>
            <button className='border border-white flex space-x-2 items-center text-white text-xs font-semibold px-4 py-2 rounded-lg '>
                <div className="font-semibold  text-lg flex items-center"><FaAddressBook /></div>
                <div className="">Guide</div>
            </button>
        </div>

    </div>
  )
}

export default ProjectCard