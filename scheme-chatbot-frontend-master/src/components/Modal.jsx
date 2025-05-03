import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { FaHouse } from "react-icons/fa6";
import { BiFemale } from "react-icons/bi";
import { BiMaleFemale } from "react-icons/bi";
import { FaEarthAmericas } from "react-icons/fa6";
import { IoPlay } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";

const  Modal = ({ data, isOpen, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-5 rounded-2xl shadow-lg w-full max-w-md"
          onClick={(e) => e.stopPropagation()} // Prevent click propagation
        >
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
                &times;
            </button>
            <div className="flex flex-col justify-center items-center">
                <div className="image">
                    <div className="p-3 bg-white rounded-full overflow-hidden">
                        <img className="w-[80px] h-[80px] overflow-hidden" src={data.imageLink} alt={data.title} />
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <h2 className="text-xl text-center font-bold ">{data.title}</h2>
                    <div className="text-sm text-center text-[#6E6D8F]">{data.by}</div>
                </div>
            </div>

            <div className="cards flex mt-6 mb-4 space-x-4 w-full justify-between">
                <div className="block bg-[#EDF6FF] p-3 rounded-lg w-full ">
                    <div className="icon px-4 py-4 bg-[#CEE2FC] flex justify-center rounded-lg text-2xl font-bold text-[#0F67FD]">
                        {data.ageGroup}
                    </div>
                    <div className="text text-[#37415C] font-semibold   text-sm text-center mt-2">
                        Age Group
                    </div>
                </div>
                <div className="block bg-[#EDF6FF] p-3 rounded-lg w-full">
                    <div className="icon px-4 py-4 bg-[#CEE2FC] flex justify-center rounded-lg text-3xl text-[#0F67FD]">
                        {
                            data.benefitType ==="monetary"?(<RiMoneyRupeeCircleFill />):(<FaHouse/>)
                        }
                    </div>
                    <div className="text text-[#37415C] font-semibold   text-sm text-center mt-2">
                        Benefit
                    </div>
                </div>
                <div className="block bg-[#EDF6FF] p-3 rounded-lg w-full ">
                    <div className="icon px-4 py-4 bg-[#CEE2FC] flex justify-center rounded-lg text-3xl text-[#0F67FD]">
                        {
                            data.gender ==="F"?(<BiFemale />):(<BiMaleFemale/>)
                        }
                    </div>
                    <div className="text text-[#37415C] font-semibold   text-sm text-center mt-2">
                        Gender
                    </div>
                </div>
            </div>
            <div className="">
                <a href={data.websiteLink} target="another" className="flex space-x-3 weblink px-3 py-3 rounded-lg bg-[#EEF1F6]">
                    <div className="p-[10px] bg-[#3AD0D5] rounded-md text-white "><FaEarthAmericas /></div>
                    <div className="text flex flex-col">
                        <div className="link text-[#02050D] text-[13px] font-semibold">{data.websiteLink}</div>
                    <div className="text-[10px] text-[#6E728D]">The official website link</div>
                </div>
                </a>
                
            </div>
            <ul className="list-disc mt-4 flex flex-col space-y-2 ">
                <div className=" bg-[#EEF1F6] text-[#02050D] flex space-x-2 px-2 py-2 rounded-md font-semibold">
                    <div className="flex items-center text-[#8A3FFC] text-xl"><IoPlay /></div>
                    <div className="">Video Tutorials</div>
                </div>
                {data.youtubeLinks.map((link, index) => (
                <a href={link} target="another" key={index} className="group bg-[#F6F2FF] hover:bg-[#8A3FFC] hover:text-white flex space-x-3  w-full rounded-full px-2 py-2">
                    <div className="icons p-[3px] rounded-full w-fit  bg-[#8A3FFC] group-hover:bg-white text-lg text-white group-hover:text-[#8A3FFC]">
                        <IoMdLink size={15} />

                    </div>
                    <div className="text-xs font-semibold text-[#323A54] group-hover:text-white flex items-center">
                        {link}
                    </div>
                    
                </a>
                ))}
            </ul>
        </div>
      </div>
    );
  };

export default Modal