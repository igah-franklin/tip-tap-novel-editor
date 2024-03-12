
'use client'
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useGetAllResumes } from '../../lib/hooks/useGetAllResumes';

const Resume = () => {
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [resumeItems, setResumeItems] =  useState([]);
    const getAllResumes = useGetAllResumes();

    useEffect(()=>{
        (async function(){
          try {
            setLoadingResumes(true)
            const { status, data } = await getAllResumes();
            if(status===200){
              setResumeItems(data?.data)
            }
          } catch (error) {
            console.log(error)
          }finally{
            setLoadingResumes(false)
          }
        })()
      }, [])
  return (
    <div className="grid grid-cols-2 m-auto">
        {
          loadingResumes ? <h2>loading resumes</h2> :
        <div className='grid grid-cols-1 gap-3'>
          {
            resumeItems.map((resume)=>(
              <div className='h-full bg-blue-400 cursor-pointer' key={resume._id}>
                <Link href={`/resumes/${resume._id}`}>
                    <h1 className="border-b">{resume?.resumetitle}</h1>
                </Link>
                {/* <p>{resume?.content}</p> */}
              </div>
            ))
          }
        </div>
        }
    </div>
  )
}

export default Resume