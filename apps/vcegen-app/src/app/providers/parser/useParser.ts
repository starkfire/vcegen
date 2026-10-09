import { use } from "react";
import { ParserContext } from "./ParserContext";

export function useParser() {
    const context = use(ParserContext)

    if (!context) {
        throw new Error("useParser must be used within a ParserProvider")
    }

    return context
}
