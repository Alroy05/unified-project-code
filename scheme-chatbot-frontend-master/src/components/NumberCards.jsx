import React from 'react'

const NumberCards = ({icon, iconColor, title, number}) => {
  return (
    <div>
        <div className="bg-[#F9FCFE] border border-[#e6f0f5] shadow-sm rounded-xl flex space-x-4 items-center pl-4 pr-8 py-4">
            <div className={`icon bg-[#195AFE] p-3 text-xl flex items-center h-fit rounded-lg`} style={{color:iconColor}} >{icon}</div>
            <div className="textpart flex flex-col justify-between">
                <div className="title text-[13px] font-semibold text-[#5B5B5B]">{title}</div>
                <div className="number text-2xl font-semibold">{number}</div>
            </div>
        </div>
    </div>
  )
}

export default NumberCards