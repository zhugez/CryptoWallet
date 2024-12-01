import { TResponseData, TResponseError } from '@/types/response'
import { autoLogout } from '@/utils/helper'
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  ResponseType,
} from 'axios'

// Lấy API URL từ biến môi trường
const API_URL = import.meta.env.VITE_SERVER_URL

export const axiosPublic = axios.create({
  baseURL: API_URL, // Đặt baseURL thành API_URL từ biến môi trường
  withCredentials: true,
})

axiosPublic.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig) {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  function (e: AxiosError) {
    console.log(e)
  },
)

axiosPublic.interceptors.response.use(
  function (res: AxiosResponse<TResponseData>) {
    return res
  },
  async function (e: AxiosError<TResponseError>) {
    const { response } = e
    console.log('response', response)
    if (response) {
      const {
        data: { message, code, detail },
      } = response

      if (code == 401) {
        autoLogout()
        return
      }

      return {
        data: {
          message,
          code,
          detail,
        },
      }
    }
    return {
      data: {
        message: 'Internal Server Error',
        code: 500,
      },
    }
  },
)

export const apiCaller = (
  method: string,
  path: string,
  data?: unknown,
  params?: Record<string, unknown>,
  responseType: ResponseType = 'json',
) => {
  const config: AxiosRequestConfig = {
    method,
    // headers: {
    //   'Access-Control-Allow-Credentials': true,
    //   'Access-Control-Allow-Origin': '*',
    // },
    url: `${path}`,
    responseType,
    withCredentials: true,
  }

  if (params) {
    config.params = params
  }

  if (data) {
    config.data = data
  }
  return axiosPublic(config)
}

export default apiCaller
