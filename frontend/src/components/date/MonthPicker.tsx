import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md'
import { TimeMonth } from '@/utils/interface'

interface MonthPickerProps {
  setDateProps: (date: TimeMonth) => void
}

const MonthPicker = ({ setDateProps }: MonthPickerProps) => {
  const [date, setDate] = useState<Date | null>(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(date || new Date())
    newDate.setFullYear(currentYear)
    newDate.setMonth(month)
    setDate(newDate)
    setDateProps({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
    })
  }

  const handleNextYear = () => {
    setCurrentYear((prevYear) => prevYear + 1)
  }

  const handlePreviousYear = () => {
    setCurrentYear((prevYear) => prevYear - 1)
  }

  const currentMonth = date ? date.getMonth() : new Date().getMonth()
  const isFutureMonth = (month: number) => {
    const currentYearCompare = new Date().getFullYear()
    const currentMonthCompare = new Date().getMonth()

    return (
      currentYear > currentYearCompare ||
      (currentYear === currentYearCompare && month > currentMonthCompare)
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon />
          {date ? format(date, 'MMM yyyy') : <span>Pick a month</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='flex w-auto flex-col space-y-2 p-2'>
        <div className='flex justify-between mb-2'>
          <Button
            variant='outline'
            onClick={handlePreviousYear}
            className='text-xl hover:bg-gray-200'
          >
            <MdOutlineNavigateBefore />
          </Button>
          <span className='self-center'>{currentYear}</span>
          <Button
            variant='outline'
            onClick={handleNextYear}
            className='text-xl hover:bg-gray-200'
          >
            <MdOutlineNavigateNext />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {Array.from({ length: 12 }).map((_, index) => (
            <Button
              key={index}
              variant='outline'
              onClick={() => handleMonthSelect(index)}
              className={cn(
                index === currentMonth ? 'bg-black text-white' : '',
              )}
              disabled={isFutureMonth(index)}
            >
              {format(new Date(0, index), 'MMM')}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MonthPicker
