import { createContext } from "react";
import type { AxiosResponse } from "@/lib/http";

import type { Dispatch, SetStateAction } from "react"

export type Result = {
    question_number: string,
    question_text: string,
    answer: string,
    choices: string[],
    rationale?: string[]
}

export type AnalyzeResponse = {
    results: Result[],
    invalid: Result[]
}

export type Strategy = "triplecolumn" | "standard" | "pymupdf"

export type UploadOptions = {
    timeoutSeconds?: number,
    signal?: AbortSignal
}

export type ParserContextType = {
    file: File | null,
    strategy: Strategy,
    results: Result[],
    invalidRows: Result[],
    isLoading: boolean,
    serverReady: boolean,
    boxedChoices: boolean,
    excludeRationale: boolean,
    setFile: Dispatch<SetStateAction<File | null>>,
    setStrategy: Dispatch<SetStateAction<Strategy>>,
    setResults: Dispatch<SetStateAction<Result[]>>,
    setInvalidRows: Dispatch<SetStateAction<Result[]>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    setServerReady: Dispatch<SetStateAction<boolean>>,
    setBoxedChoices: Dispatch<SetStateAction<boolean>>,
    setExcludeRationale: Dispatch<SetStateAction<boolean>>,
    uploadFile: (file: File, options?: UploadOptions) => Promise<AxiosResponse<AnalyzeResponse>>,
    analyzeFile: (file: File) => Promise<void>,
    reset: () => void,
}

export const ParserContext = createContext<ParserContextType | undefined>(undefined)
