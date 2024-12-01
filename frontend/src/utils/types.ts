import { ChangeEvent, FormEvent } from 'react'

export type FormSubmit = FormEvent<HTMLFormElement>
export type InputChange = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLSelectElement
>
