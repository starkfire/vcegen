import { FileIcon, Loader2, X } from "lucide-react"
import {
    FileListItem,
    FileListHeader,
    FileListAction,
    FileListInfo,
    FileListDescription,
    FileListDescriptionText,
    FileListName,
    FileListIcon,
    FileListSize,
    FileListDescriptionSeparator
} from "@/components/ui/file-list"

type FileItemProps = {
    file: File,
    onCancel?: () => void
}

export function FileItem({ file, onCancel }: FileItemProps) {
    return (
        <FileListItem>
            <FileListHeader>
                <FileListIcon>
                    <FileIcon />
                </FileListIcon>
                <FileListInfo>
                    <FileListName>{file.name}</FileListName>
                    <FileListDescription>
                        <FileListSize>{file.size}</FileListSize>
                        <FileListDescriptionSeparator />
                        <FileListDescriptionText>
                            <Loader2 className="size-3 animate-spin" />
                            Processing document...
                        </FileListDescriptionText>
                    </FileListDescription>
                </FileListInfo>
                <FileListAction onClick={onCancel}>
                    <X className="size-4" />
                    <span className="sr-only">Cancel</span>
                </FileListAction>
            </FileListHeader>
        </FileListItem>
    )
}
