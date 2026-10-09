import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { http } from "@/lib/http";
import {
    ParserContext,
    type ParserContextType,
    type Result,
    type Strategy,
    type AnalyzeResponse,
    type UploadOptions
} from "./ParserContext";

import type { PropsWithChildren } from "react"

const SERVER_TIMEOUT_SECONDS = 180
const KEEP_ALIVE_INTERVAL_MS = 1000 * 60 * 2

export function ParserProvider(props: PropsWithChildren) {
    const [file, setFile] = useState<File | null>(null)
    const [strategy, setStrategy] = useState<Strategy>("standard")
    const [results, setResults] = useState<Result[]>([])
    const [invalidRows, setInvalidRows] = useState<Result[]>([])
    const [serverReady, setServerReady] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [boxedChoices, setBoxedChoices] = useState<boolean>(false)
    const [excludeRationale, setExcludeRationale] = useState<boolean>(false)
    const [lastPingTime, setLastPingTime] = useState<number | null>(null)

    const [axios] = useState(() => http())

    const uploadController = useRef<AbortController | null>(null)

    const createForm = (file: File) => {
        const data = new FormData()

        data.append("file", file)
        data.append("strategy", strategy)
        if (boxedChoices) data.append("boxed_choices", "true")
        if (excludeRationale) data.append("exclude_rationale", "true")

        return data
    }

    const startServer = (timeoutSeconds: number = SERVER_TIMEOUT_SECONDS) => {
        const controller = new AbortController()

        return axios.get("/", {
            timeout: timeoutSeconds * 1000,
            signal: controller.signal
        })
    }

    const uploadFile = (file: File, options: UploadOptions = {}) => {
        const { timeoutSeconds = SERVER_TIMEOUT_SECONDS, signal = new AbortController().signal } = options

        return axios.post<AnalyzeResponse>(
            "/analyze",
            createForm(file), {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                timeout: timeoutSeconds * 1000,
                signal
            }
        )
    }

    const analyzeFile = async (file: File) => {
        uploadController.current?.abort()

        const controller = new AbortController()
        uploadController.current = controller

        setFile(file)
        setResults([])
        setInvalidRows([])
        setIsLoading(true)

        try {
            const res = await uploadFile(file, { signal: controller.signal })

            if (controller.signal.aborted) {
                return
            }

            if (res.data) {
                setResults(res.data.results ?? [])
                setInvalidRows(res.data.invalid ?? [])
            }
        } catch (err) {
            if (controller.signal.aborted) {
                return
            }

            console.error(err)

            toast.error("Failed to process document", {
                description: err instanceof Error ? err.message : "An unexpected error occurred."
            })

            setFile(null)
            setResults([])
            setInvalidRows([])
        } finally {
            if (uploadController.current === controller) {
                uploadController.current = null
                setIsLoading(false)
            }
        }
    }

    const reset = () => {
        uploadController.current?.abort()
        uploadController.current = null

        setFile(null)
        setResults([])
        setInvalidRows([])
        setIsLoading(false)
    }

    useEffect(() => {
        startServer().then(() => {
            setServerReady(true)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // keep the server awake
    useEffect(() => {
        const wakeTimer = setTimeout(() => {
            startServer().then(() => {
                setServerReady(true)
            }).catch(() => {
                setServerReady(false)
            }).finally(() => {
                setLastPingTime(Math.floor(Date.now() / 1000))
            })
        }, KEEP_ALIVE_INTERVAL_MS)

        return () => clearTimeout(wakeTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastPingTime])

    // abort any in-flight upload on unmount
    useEffect(() => {
        return () => uploadController.current?.abort()
    }, [])

    const value: ParserContextType = {
        file,
        strategy,
        results,
        invalidRows,
        isLoading,
        serverReady,
        boxedChoices,
        excludeRationale,
        setFile,
        setStrategy,
        setResults,
        setInvalidRows,
        setIsLoading,
        setServerReady,
        setBoxedChoices,
        setExcludeRationale,
        uploadFile,
        analyzeFile,
        reset
    }

    return (
        <ParserContext value={value}>
            {props.children}
        </ParserContext>
    );
}
