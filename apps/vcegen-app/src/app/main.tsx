import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";

import router from "@/app/router";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/globals.css"

createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <RouterProvider router={router} />
            <Toaster richColors closeButton />
        </ThemeProvider>
    </StrictMode>
);
