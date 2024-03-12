import axios from "axios"

export const useGetAllResumes = () => {
  return async()=>{
    try {
        const res = await axios.get('http://localhost:5000/api/all-resumes');
        return res;
    } catch (error) {
        console.log(error)
    }
  }
}

