import * as React from "react"
import { FileText } from "lucide-react"
import prettyBytes from "pretty-bytes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function FileList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="file-list" className={cn("grid gap-4", className)} {...props} />
  )
}

export function FileListItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-item"
      className={cn(
        "grid gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function FileListHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-header"
      className={cn("flex items-center gap-4", className)}
      {...props}
    />
  )
}

export function FileListIcon({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-icon"
      className={cn(
        "flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground [&>svg]:size-5",
        className
      )}
      {...props}
    >
      {children ?? <FileText />}
    </div>
  )
}

export function FileListInfo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-info"
      className={cn("grid flex-1 gap-1", className)}
      {...props}
    />
  )
}

export function FileListName({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="file-list-name"
      className={cn("text-sm leading-none font-medium tracking-tight", className)}
      {...props}
    />
  )
}

export function FileListDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-description"
      className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FileListDescriptionSeparator({
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span data-slot="file-list-description-separator" {...props}>
      {children ?? "•"}
    </span>
  )
}

export interface FileListSizeProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  children: number
}

export function FileListSize({ children, ...props }: FileListSizeProps) {
  return (
    <span data-slot="file-list-size" {...props}>
      {prettyBytes(children)}
    </span>
  )
}

export function FileListProgress({
  className,
  ...props
}: React.ComponentProps<typeof Progress>) {
  return <Progress className={cn("h-1", className)} {...props} />
}

export function FileListDescriptionText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="file-list-description-text"
      className={cn("flex items-center gap-1.5 [&>svg]:size-3", className)}
      {...props}
    />
  )
}

export function FileListContent(props: React.ComponentProps<"div">) {
  return <div data-slot="file-list-content" {...props} />
}

export function FileListActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-list-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

export function FileListAction({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="file-list-action"
      variant={variant}
      size={size}
      className={cn("size-7 [&_svg]:size-3.5", className)}
      {...props}
    />
  )
}
