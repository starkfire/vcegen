import { isTauri } from "@tauri-apps/api/core";

export type SaveTextFileOptions = {
    defaultName?: string;
};

export async function saveTextFile(content: string, options: SaveTextFileOptions = {}): Promise<boolean> {
    const defaultName = options.defaultName ?? "out.txt";

    if (isTauri()) {
        const [{ save }, { writeTextFile }] = await Promise.all([
            import("@tauri-apps/plugin-dialog"),
            import("@tauri-apps/plugin-fs"),
        ]);

        const path = await save({
            defaultPath: defaultName,
            filters: [{ name: "Text", extensions: ["txt"] }],
        });

        if (!path) {
            return false;
        }

        await writeTextFile(path, content);

        return true;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = defaultName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
}
