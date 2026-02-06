"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type SortDirection = "asc" | "desc" | null

export interface Column<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  exportable?: boolean
  onExport?: () => void
  emptyMessage?: string
  className?: string
  rowClassName?: string | ((row: T) => string)
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  exportable = false,
  onExport,
  emptyMessage = "No data available",
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const getCellValue = (row: T, column: Column<T>): unknown => {
    if (typeof column.accessor === "function") {
      return column.accessor(row)
    }
    return row[column.accessor]
  }

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data

    const keys = searchKeys || (columns.map((c) => c.accessor).filter((a) => typeof a !== "function") as (keyof T)[])

    return data.filter((row) =>
      keys.some((key) => {
        const value = row[key]
        if (value == null) return false
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, searchKeys, columns])

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    const column = columns.find((c) => c.id === sortColumn)
    if (!column) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, column)
      const bValue = getCellValue(b, column)

      if (aValue == null) return 1
      if (bValue == null) return -1

      const aStr = String(aValue)
      const bStr = String(bValue)

      const comparison = aStr.localeCompare(bStr, undefined, { numeric: true })
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection, columns])

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="ml-1 h-3.5 w-3.5" />
    }
    return <ChevronDown className="ml-1 h-3.5 w-3.5" />
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(searchable || exportable) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {exportable && onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.sortable && "cursor-pointer select-none",
                    column.headerClassName
                  )}
                  onClick={column.sortable ? () => handleSort(column.id) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && <SortIcon columnId={column.id} />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {getCellValue(row, column) as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {sortedData.length} of {data.length} results
        </p>
      )}
    </div>
  )
}
