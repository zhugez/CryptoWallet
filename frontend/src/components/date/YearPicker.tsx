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
import { TimeYear } from '@/utils/interface'

interface YearPickerProps {
  setDateProps: (date: TimeYear) => void
}

const YearPicker = ({ setDateProps }: YearPickerProps) => {
  const [date, setDate] = useState<Date | null>()
  const [yearRange, setYearRange] = useState(() => {
    const currentYear = new Date().getFullYear()
    return { start: currentYear - 10, end: currentYear + 9 }
  })

  const handleYearSelect = (year: number) => {
    const newDate = new Date(date || new Date())
    newDate.setFullYear(year)
    setDate(newDate)
    setDateProps({
      year: newDate.getFullYear(),
    })
  }

  const handleNext = () => {
    setYearRange((prev) => ({ start: prev.start + 20, end: prev.end + 20 }))
  }

  const handleBack = () => {
    setYearRange((prev) => ({ start: prev.start - 20, end: prev.end - 20 }))
  }

  const selectedYear = date ? date.getFullYear() : new Date().getFullYear()
  console.log(selectedYear)
  const isFutureYear = (year: number) => {
    const currentYearCompare = new Date().getFullYear()

    return year > currentYearCompare
  }

  const years = Array.from(
    { length: yearRange.end - yearRange.start + 1 },
    (_, i) => yearRange.start + i,
  )

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
          {date ? format(date, 'yyyy') : <span>Pick a year</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='flex w-auto flex-col space-y-2 p-2'>
        <div className='flex justify-between mb-2'>
          <Button
            variant='outline'
            onClick={handleBack}
            className='text-xl hover:bg-gray-200'
          >
            <MdOutlineNavigateBefore />
          </Button>
          <Button
            variant='outline'
            onClick={handleNext}
            className='text-xl hover:bg-gray-200'
          >
            <MdOutlineNavigateNext />
          </Button>
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {years.map((year) => (
            <Button
              key={year}
              variant='outline'
              onClick={() => handleYearSelect(year)}
              disabled={isFutureYear(year)}
              className={cn(year === selectedYear ? 'bg-black text-white' : '')}
            >
              {year}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default YearPicker
