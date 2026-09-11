import axios from 'axios'
import { ApiError } from './errors'
export const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || '/api',withCredentials:true})
api.interceptors.response.use(response=>response,error=>{
 if(axios.isCancel(error)) return Promise.reject(error)
 if(axios.isAxiosError(error)) {
  const data=error.response?.data?.error
  return Promise.reject(new ApiError(data?.message ?? (error.response ? '요청을 처리하지 못했어요.' : '네트워크 연결을 확인하고 다시 시도해주세요.'),error.response?.status ?? 0,data?.code ?? (error.response ? 'UNKNOWN' : 'NETWORK_ERROR'),data?.fieldErrors))
 }
 return Promise.reject(error)
})
