export type TResponseData<T = unknown> = {
  data?: T
  message: string
  code: number
  page?: number
  limit?: number
  total?: number
}

export type TResponseError = {
  message: string
  code: number
  detail?: string
  stack?: string
}
