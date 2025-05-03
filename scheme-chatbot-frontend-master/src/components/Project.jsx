import React from 'react'
import ProjectCard from './ProjectCard'

const Project = () => {
  return (
    <div>
        <div className="pt-5 pb-20 bg-[#FEFEFF] flex flex-col items-center">
            <div className="text-part px-10 xl:px-0 flex flex-col items-center">
                {/* <div className=" border border-[#FF9416] w-fit bg-[#f9eee0] text-[#FF9416] px-6 py-2 rounded-full text-sm font-semibold ">Projects</div> */}
                <div className="mt-6 xl:mt-10 font-semibold text-2xl xl:text-5xl xl:w-[75%] text-center text-[#d3d3d4]">WHAT CAN WE <span className='text-black'> DO FOR YOU.</span></div>
                <div className="mt-6 xl:mt-10 text-center xl:w-[55%] text-sm xl:text-lg text-[#737373] ">Discover all your rights and benifits ment for you, get a thorough overview and ask what you are confused about.</div>
            </div>
            <div className="project-cards flex max-w-[450px] xl:max-w-none flex-col items-center xl:flex-row space-y-8 xl:space-y-0 xl:justify-between xl:space-x-5 pt-10  px-10">
                <ProjectCard title="Know What Benifits Government has to offer" description="Monitor the exact location and status of your packages at every stage of their journey" imageLink="https://back.3blcdn.com/sites/default/files/styles/ratio_3_2/public/triplepundit/wide/farmers%20in%20india%20use%20gramhal%20chatbot.jpg?h=ac45411d" redirectLink="/scheme-bot"/>
                <ProjectCard title="Learn About Citizen Rights & Bureaucracy" description="Monitor the exact location and status of your packages at every stage of their journey" imageLink="https://k8school.com/?seraph_accel_gci=wp-content%2Fuploads%2F2021%2F05%2FAdobeStock_367295906-1024x536.jpg&n=CklBKFkZ4a9o10qcIRYaQ" redirectLink="/manage"/>
                <ProjectCard title="Keep yourself updated with all the government functionings" description="Get updated & accurate information at your finger tips, always know your rights and benifits" imageLink="https://futurescot.com/wp-content/uploads/2021/10/shutterstock_1030905133-1200x675.jpg" redirectLink="/verify"/>

            </div>

        </div>
    </div>
  )
}

export default Project