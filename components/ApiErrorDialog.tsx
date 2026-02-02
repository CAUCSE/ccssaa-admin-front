"use client"

import { createContext, useCallback, useContext, useState } from "react"
import {
  AlertDialogRoot,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getApiErrorMessage } from "@/lib/api-error"

type ShowApiError = (error: unknown) => void

const ApiErrorDialogContext = createContext<ShowApiError | null>(null)

export function useApiErrorDialog(): ShowApiError | null {
  return useContext(ApiErrorDialogContext)
}

export function ApiErrorDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  const showError = useCallback((error: unknown) => {
    setMessage(getApiErrorMessage(error))
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setMessage("")
  }, [])

  return (
    <ApiErrorDialogContext.Provider value={showError}>
      {children}
      <AlertDialogRoot open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>요청 실패</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="whitespace-pre-wrap text-left">{message}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </ApiErrorDialogContext.Provider>
  )
}
