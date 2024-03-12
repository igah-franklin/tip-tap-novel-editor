import axios from "axios"

export const useCreateResume = () => {
  return async(payload)=>{
    try {
        const res = await axios.post('http://localhost:5000/api/create-resume', payload);
        return res;
    } catch (error) {
        console.log(error)
    }
  }
}

