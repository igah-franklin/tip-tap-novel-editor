import axios from "axios"

export const useGetResume = () => {
  return async(resumeId)=>{
    try {
        const res = await axios.get(`http://localhost:5000/api/single-resume/${resumeId}`);
        return res;
    } catch (error) {
        console.log(error)
    }
  }
}

