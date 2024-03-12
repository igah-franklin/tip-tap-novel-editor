import axios from "axios"

export const useUpdateResume = () => {
  return async(resumeId, payload)=>{
    try {
        const res = await axios.patch(`http://localhost:5000/api/update-resume/${resumeId}/update`, payload);
        return res;
    } catch (error) {
        console.log(error)
    }
  }
}

