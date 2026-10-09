import * as React from "react"
import {
  useDropzone,
  type DropzoneOptions,
  type DropzoneState,
  type FileRejection,
  type FileWithPath,
} from "react-dropzone"

export type DropzoneContextProps = DropzoneState & DropzoneOptions

const DropzoneContext = React.createContext<DropzoneContextProps>(
  {} as DropzoneContextProps
)

export const useDropzoneContext = () => React.use(DropzoneContext)

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  userHandler?: (event: E) => void,
  ownHandler?: (event: E) => void
) {
  return (event: E) => {
    userHandler?.(event)

    if (!event.defaultPrevented) {
      ownHandler?.(event)
    }
  }
}

export interface DropzoneProps extends DropzoneOptions {
  children: React.ReactNode | ((state: DropzoneContextProps) => React.ReactNode)
}

export function Dropzone({ children, ...props }: DropzoneProps) {
  const state = useDropzone(props)

  const context = { ...state, ...props }

  return (
    <DropzoneContext value={context}>
      {typeof children === "function" ? children(context) : children}
    </DropzoneContext>
  )
}

export function DropzoneInput(props: React.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDropzoneContext()

  return (
    <input data-slot="dropzone-input" {...getInputProps({ disabled, ...props })} />
  )
}

export function DropzoneZone(props: React.ComponentProps<"div">) {
  const {
    getRootProps,
    isFocused,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFileDialogActive,
    preventDropOnDocument,
    noClick,
    noKeyboard,
    noDrag,
    noDragEventsBubbling,
    disabled,
  } = useDropzoneContext()

  return (
    <div
      data-slot="dropzone-zone"
      data-prevent-drop-on-document={preventDropOnDocument ? true : undefined}
      data-no-click={noClick ? true : undefined}
      data-no-keyboard={noKeyboard ? true : undefined}
      data-no-drag={noDrag ? true : undefined}
      data-no-drag-events-bubbling={noDragEventsBubbling ? true : undefined}
      data-disabled={disabled ? true : undefined}
      data-focused={isFocused ? true : undefined}
      data-drag-active={isDragActive ? true : undefined}
      data-drag-accept={isDragAccept ? true : undefined}
      data-drag-reject={isDragReject ? true : undefined}
      data-file-dialog-active={isFileDialogActive ? true : undefined}
      {...getRootProps(props)}
    />
  )
}

export function DropzoneTrigger({
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { open } = useDropzoneContext()

  return (
    <button
      data-slot="dropzone-trigger"
      type="button"
      onClick={composeEventHandlers(onClick, () => open())}
      {...props}
    />
  )
}

export interface DropzoneDragAcceptedProps {
  children?: React.ReactNode
}

export function DropzoneDragAccepted({ children }: DropzoneDragAcceptedProps) {
  const { isDragAccept } = useDropzoneContext()

  if (!isDragAccept) {
    return null
  }

  return children
}

export interface DropzoneDragRejectedProps {
  children?: React.ReactNode
}

export function DropzoneDragRejected({ children }: DropzoneDragRejectedProps) {
  const { isDragReject } = useDropzoneContext()

  if (!isDragReject) {
    return null
  }

  return children
}

export interface DropzoneDragDefaultProps {
  children?: React.ReactNode
}

export function DropzoneDragDefault({ children }: DropzoneDragDefaultProps) {
  const { isDragActive } = useDropzoneContext()

  if (isDragActive) {
    return null
  }

  return children
}

export interface DropzoneAcceptedProps {
  children: (acceptedFiles: Readonly<FileWithPath[]>) => React.ReactNode
}

export function DropzoneAccepted({ children }: DropzoneAcceptedProps) {
  const { acceptedFiles } = useDropzoneContext()

  return children(acceptedFiles)
}

export interface DropzoneRejectedProps {
  children: (fileRejections: Readonly<FileRejection[]>) => React.ReactNode
}

export function DropzoneRejected({ children }: DropzoneRejectedProps) {
  const { fileRejections } = useDropzoneContext()

  return children(fileRejections)
}

export {
  Dropzone as Root,
  DropzoneInput as Input,
  DropzoneZone as Zone,
  DropzoneTrigger as Trigger,
  DropzoneDragAccepted as DragAccepted,
  DropzoneDragRejected as DragRejected,
  DropzoneDragDefault as DragDefault,
  DropzoneAccepted as Accepted,
  DropzoneRejected as Rejected,
}
