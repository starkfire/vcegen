import { RefreshCwIcon } from "lucide-react";
import { useParser } from "@/app/providers/parser";
import { Button } from "@/components/ui/button";

export function ResetParserButton() {
    const parser = useParser()

    return (
        <Button 
            disabled={!parser.file} 
            onClick={parser.reset}
        >
            <RefreshCwIcon />
            <span>Reset</span>
        </Button>
    )
}