import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useParser } from "@/app/providers/parser";
import { formatVceText } from "@/lib/vce";
import { saveTextFile } from "@/lib/save-file";

export function ExportOutputButton() {
    const parser = useParser()

    const exportFile = async () => {
        const content = formatVceText(parser.results, {
            excludeRationale: parser.excludeRationale
        })

        try {
            const saved = await saveTextFile(content, { defaultName: "out.txt" })

            if (saved) {
                toast.success("Exported VCE-ready file")
            }
        } catch (err) {
            console.error(err)

            toast.error("Failed to export file", {
                description: err instanceof Error ? err.message : String(err)
            })
        }
    }

    return (
        <Button
            disabled={parser.results.length === 0}
            onClick={exportFile}
        >
            <DownloadIcon />
            <span>Export</span>
        </Button>
    )
}
