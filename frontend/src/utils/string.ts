import { Params } from './interface'
import { parse, format } from 'date-fns'

export const parseDateString = (dateString: string) => {
  if (!dateString) return
  const [year, month, day] = dateString.split('T')[0].split('-')
  return `${month}/${day}/${year}`
}

export const cleanErrorMessage = (error: string) => {
  const matchResult = error.match(/Detail: (.*)$/)
  return matchResult ? matchResult[1] : null
}

export const highlightError = (
  field: string,
  formErrors: Map<string, string>[],
) => {
  return formErrors.some((error) => error.has(field)) ? 'border-red-500' : ''
}

export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0].split('-').reverse().join('/')
}
// format beautiful name: xxx xxx xx -> Nguyen Van A
export const formatName = (name: string) => {
  return (
    name &&
    name
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}

// get full name from first name and last name
export const getFullName = (firstName: string, lastName: string) => {
  return formatName(`${firstName} ${lastName}`)
}

export const excelDateToJSDate = (excelDate: string | number): string => {
  if (typeof excelDate === 'number') {
    // Handle Excel serial date number
    const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000)
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  } else if (typeof excelDate === 'string') {
    // Handle date string in "YYYY-MM-DD" format
    const date = parse(excelDate, 'yyyy-MM-dd', new Date())
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }
  return ''
}
export const excelDateToJSDateUI = (serial: number): string => {
  if (serial === 0) return ''
  const utc_days = Math.floor(serial - 25569)
  const date_info = new Date(utc_days * 86400 * 1000)

  const fractional_day = serial - Math.floor(serial)
  const total_seconds = Math.floor(86400 * fractional_day)

  const seconds = total_seconds % 60
  const minutes = Math.floor(total_seconds / 60) % 60
  const hours = Math.floor(total_seconds / 3600)

  date_info.setUTCHours(hours, minutes, seconds)

  return date_info.toISOString().split('T')[0]
}

export const getDefaultParams = (): Params => ({
  limit: 10,
  page: 1,
  order_by: 'created_at DESC',
})
