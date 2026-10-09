import * as React from "react"

const MOBILE_BREAKPOINT = 768

const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
    const mql = window.matchMedia(query)

    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
    return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
    return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}

