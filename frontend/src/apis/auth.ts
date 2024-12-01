import { ILogin, IRegister } from '@/utils/interface'
import axios from 'axios'

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:8000'
const PATH = `${API_URL}/api/users`

const Login = async (data: ILogin) => {
  try {
    const response = await axios.post(`${PATH}/login`, data, { headers: { 'Content-Type': 'application/json' } });
    return response.data
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('Error response:', error.response)
      throw new Error(`Login failed: ${error.response.data.message || error.response.statusText}`)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request)
      throw new Error('Login failed: No response from server')
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message)
      throw new Error('Login failed: ' + error.message)
    }
  }
}

const Register = async (data: IRegister) => {
  try {
    const response = await axios.post(`${PATH}/register`, data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response)
      throw new Error(`Registration failed: ${error.response.data.message || error.response.statusText}`)
    } else if (error.request) {
      console.error('Error request:', error.request)
      throw new Error('Registration failed: No response from server')
    } else {
      console.error('Error message:', error.message)
      throw new Error('Registration failed: ' + error.message)
    }
  }
}

export { Login, Register }
