import * as React from "react"
import { Slot } from "radix-ui"
import { Ban, CheckCircle2, Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import * as DropzonePrimitive from "@/components/ui/dropzone-primitive"

export const Dropzone = DropzonePrimitive.Root

export const DropzoneInput = DropzonePrimitive.Input

export const DropzoneTrigger = DropzonePrimitive.Trigger

export const DropzoneAccepted = DropzonePrimitive.Accepted

export const DropzoneRejected = DropzonePrimitive.Rejected

type AsChildProps = { asChild?: boolean }

export function DropzoneZone({
  className,
  ...props
}: React.ComponentProps<typeof DropzonePrimitive.Zone>) {
  return (
    <DropzonePrimitive.Zone
      className={cn(
        "cursor-pointer rounded-md border-2 border-dashed border-input p-6 shadow-sm transition-colors outline-none hover:border-accent-foreground/50 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:border-inherit data-[disabled]:bg-inherit data-[disabled]:opacity-50 data-[drag-active]:border-accent-foreground/50 data-[drag-active]:bg-accent data-[drag-reject]:cursor-no-drop data-[drag-reject]:border-destructive data-[drag-reject]:bg-destructive/30 data-[no-click]:cursor-default",
        className
      )}
      {...props}
    />
  )
}

export function DropzoneUploadIcon({
  className,
  ...props
}: React.ComponentProps<typeof Upload>) {
  return (
    <>
      <DropzonePrimitive.DragAccepted>
        <CheckCircle2 className={cn("size-8", className)} {...props} />
      </DropzonePrimitive.DragAccepted>
      <DropzonePrimitive.DragRejected>
        <Ban className={cn("size-8", className)} {...props} />
      </DropzonePrimitive.DragRejected>
      <DropzonePrimitive.DragDefault>
        <Upload className={cn("size-8", className)} {...props} />
      </DropzonePrimitive.DragDefault>
    </>
  )
}

export function DropzoneGroup({
  className,
  asChild,
  ...props
}: React.ComponentProps<"div"> & AsChildProps) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="dropzone-group"
      className={cn("grid place-items-center gap-1.5", className)}
      {...props}
    />
  )
}

export function DropzoneTitle({
  className,
  asChild,
  ...props
}: React.ComponentProps<"h3"> & AsChildProps) {
  const Comp = asChild ? Slot.Root : "h3"

  return (
    <Comp
      data-slot="dropzone-title"
      className={cn("leading-none font-medium tracking-tight", className)}
      {...props}
    />
  )
}

export function DropzoneDescription({
  className,
  asChild,
  ...props
}: React.ComponentProps<"p"> & AsChildProps) {
  const Comp = asChild ? Slot.Root : "p"

  return (
    <Comp
      data-slot="dropzone-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}
