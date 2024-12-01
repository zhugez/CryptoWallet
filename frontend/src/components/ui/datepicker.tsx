import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function DatePicker({
  date,
  setDate,
  content,
  cln,
  err,
}: {
  date: Date
  setDate: (date: Date) => void
  content: string
  cln: boolean
  err: boolean
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={cln}
          variant='outline'
          className={cn(
            'justify-between text-left font-normal',
            !date && 'text-muted-foreground',
            cln && 'bg-[#b3b3b3] opacity-20 border-none cursor-not-allowed',
            err && 'border-red-500',
          )}
        >
          {date ? format(date, 'PPP') : <span>{content}</span>}
          <CalendarIcon className='mr-2 h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0 bg-white'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(date) => setDate(date!)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
