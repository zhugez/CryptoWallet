'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IUser } from '@/utils/interface'
import { parseDateString } from '@/utils/string'

export function DataTableUser({
  users,
  setSelectedUsers,
}: {
  users: IUser[]
  setSelectedUsers: React.Dispatch<React.SetStateAction<IUser[]>>
}) {
  const columns: ColumnDef<IUser>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            handleRowClick(row.getValue('id'))
            row.toggleSelected(!!value)
          }}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: () => <div className='ml-20 w-20'>ID</div>,
      cell: ({ row }) => <div className='ml-20 w-20'>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'node_id',
      header: () => <div className='mx-10'>Node Id</div>,
      cell: ({ row }) => <div className='mx-10'>{row.getValue('node_id')}</div>,
    },
    {
      accessorKey: 'email',
      header: () => <div className='mx-10'>Email</div>,

      cell: ({ row }) => (
        <div className='lowercase'>
          {row.getValue('email') ? row.getValue('email') : 'Not updated yet'}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => (
        <div>{parseDateString(row.getValue('created_at'))}</div>
      ),
    },
  ]
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  const handleRowClick = (id: string) => {
    setSelectedUsers((prev) => {
      const user = users.find((u) => u.id === id)
      if (user) {
        if (prev.some((selectedUser) => selectedUser.id === id)) {
          return prev.filter((selectedUser) => selectedUser.id !== id)
        } else {
          return [...prev, user]
        }
      }
      return prev
    })
  }
  const handleSelectAll = (value: boolean) => {
    if (value) {
      setSelectedUsers(users)
    } else {
      setSelectedUsers([])
    }
    table.toggleAllPageRowsSelected(value)
  }

  return (
    <div className='w-full'>
      <div className='rounded-md border mr-4'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if (header.id === 'select') {
                  return (
                    <TableHead key={header.id}>
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => handleSelectAll(!!value)}
                        aria-label='Select all'
                      />
                    </TableHead>
                  )
                }
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            className='cursor-pointer'
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </div>
    </div>
  )
}
