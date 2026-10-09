import { createBrowserRouter } from "react-router"

import ParserPage from "@/pages/ParserPage"

import type { RouteObject } from "react-router"

const routes: RouteObject[] = [
    {
        path: "/",
        element: <ParserPage />
    }
]

export default createBrowserRouter(routes)
