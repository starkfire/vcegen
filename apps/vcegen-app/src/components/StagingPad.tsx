import { Loader2 } from "lucide-react"
import { useParser } from "@/app/providers/parser";
import {
    Dropzone,
    DropzoneDescription,
    DropzoneGroup,
    DropzoneInput,
    DropzoneTitle,
    DropzoneUploadIcon,
    DropzoneZone
} from "@/components/ui/dropzone"
import { FileList } from "@/components/ui/file-list"
import {
    Tabs,
    TabsList,
    TabsContent,
    TabsTrigger
} from "@/components/ui/tabs"
import { FileItem } from "@/components/parser/FileItem"
import { ResultCard } from "@/components/parser/ResultCard"

type StagingPadProps = {
    title: string;
    description?: string;
    className?: string;
}

export function StagingPad(props: StagingPadProps) {
    const parser = useParser()

    const onValidDrop = (files: File[]) => {
        if (files[0]) {
            void parser.analyzeFile(files[0])
        }
    }

    return (
        <div>
            {
                (!parser.serverReady) && (
                    <div className="flex min-h-[90vh] items-center justify-center">
                        <div className="flex items-center">
                            <Loader2 className="size-3 animate-spin" />
                            <span className="ml-2 text-muted-foreground">Starting the server... This might take a minute or two.</span>
                        </div>
                    </div>
                )
            }
            {
                (!parser.isLoading && !parser.file) && (
                    <Dropzone
                        accept={{
                            "application/pdf": [".pdf"]
                        }}
                        onDropAccepted={onValidDrop}
                        maxFiles={1}
                    >
                        <DropzoneZone className={props.className}>
                            <DropzoneInput />
                            <DropzoneGroup>
                                <DropzoneUploadIcon />
                                <DropzoneGroup>
                                    <DropzoneTitle>
                                        {props.title}
                                    </DropzoneTitle>
                                    <DropzoneDescription>
                                        {props.description}
                                    </DropzoneDescription>
                                </DropzoneGroup>
                            </DropzoneGroup>
                        </DropzoneZone>
                    </Dropzone>
                )
            }
            {
                (parser.isLoading && parser.file) && (
                    <FileList>
                        <FileItem file={parser.file} onCancel={parser.reset} />
                    </FileList>
                )
            }
            {
                (!parser.isLoading && parser.file) && (
                    <Tabs defaultValue="valid">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger className="font-semibold" value="valid">
                                Valid Rows
                            </TabsTrigger>
                            <TabsTrigger className="font-semibold" value="invalid">
                                Invalid Rows
                            </TabsTrigger>
                            <TabsTrigger className="font-semibold" value="source">
                                Source View
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="valid">
                            {
                                parser.results.map((result, idx) => (
                                    <ResultCard
                                        key={`${result.question_number}-${idx}`}
                                        className="my-2"
                                        data={result}
                                    />
                                ))
                            }
                        </TabsContent>
                        <TabsContent value="invalid">
                            {
                                parser.invalidRows.map((row, idx) => (
                                    <ResultCard
                                        key={`${row.question_number}-${idx}`}
                                        className="my-2"
                                        data={row}
                                    />
                                ))
                            }
                        </TabsContent>
                        <TabsContent value="source">

                        </TabsContent>
                    </Tabs>
                )
            }
        </div>
    )
}
