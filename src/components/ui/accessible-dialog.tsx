import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface AccessibleDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  hideTitle?: boolean
  contentClassName?: string
}

const AccessibleDialog = ({ 
  open, 
  onOpenChange, 
  children, 
  title = "Dialog", 
  description,
  hideTitle = false,
  contentClassName = ""
}: AccessibleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          {hideTitle ? (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          )}
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { AccessibleDialog }
