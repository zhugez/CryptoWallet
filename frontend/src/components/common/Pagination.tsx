import React from 'react'
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'
interface IPagination {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<IPagination> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    if (totalPages < 4) {
      return [...Array(totalPages)].map((_, i) => (
        <div
          key={i + 1}
          className={`${
            currentPage === i + 1 ? 'bg-main text-white' : 'text-main'
          } border py-1 px-3 hover:bg-main hover:text-white cursor-pointer transition-all`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </div>
      ))
    } else {
      return (
        <>
          <div
            className={`${
              currentPage === 1 ? 'bg-main text-white' : 'text-main'
            } border py-1 px-3 hover:bg-main hover:text-white cursor-pointer transition-all`}
            onClick={() => onPageChange(1)}
          >
            1
          </div>
          {currentPage > 2 && currentPage <= totalPages && (
            <div className='flex items-end px-2'>...</div>
          )}
          {currentPage > 1 && currentPage < totalPages && (
            <div className='bg-main text-white border py-1 px-3 cursor-pointer'>
              {currentPage}
            </div>
          )}
          {currentPage < totalPages - 1 && (
            <div className='flex items-end px-2'>...</div>
          )}
          <div
            className={`${
              currentPage === totalPages ? 'bg-main text-white' : 'text-main'
            } border py-1 px-3 hover:bg-main hover:text-white cursor-pointer transition-all`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </div>
        </>
      )
    }
  }

  return (
    <div className='flex w-full justify-end'>
      <button
        className={`${
          currentPage === 1
            ? 'cursor-not-allowed'
            : 'text-main hover:text-white hover:bg-main'
        } border p-1 px-3 rounded-l-md`}
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        <IoChevronBackOutline />
      </button>
      <div className='flex'>{renderPageNumbers()}</div>
      <button
        className={`${
          currentPage === totalPages
            ? 'cursor-not-allowed'
            : 'text-main hover:text-white hover:bg-main'
        } border p-1 px-3 rounded-r-md`}
        disabled={currentPage === totalPages}
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
      >
        <IoChevronForwardOutline />
      </button>
    </div>
  )
}

export default Pagination
