import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { StagingPad } from "@/components/StagingPad";
import { ParserProvider } from "@/app/providers/parser"
import { ResetParserButton } from "@/components/ResetParserButton";
import { ExportOutputButton } from "@/components/ExportOutputButton";

export default function ParserPage() {
    return (
        <ParserProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
                        <div>
                            <SidebarTrigger className="-ml-1" />
                        </div>
                        <div className="flex items-center gap-2">
                            <ResetParserButton />
                            <ExportOutputButton />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <StagingPad
                            className="flex min-h-[90vh] items-center justify-center"
                            title="Upload Exam PDF"
                            description="Click this area or drag and drop a file to this pad to upload your file"
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ParserProvider>
    );
}
