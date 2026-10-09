import type { Result } from "@/app/providers/parser";

export type VceFormatOptions = {
    excludeRationale?: boolean;
};

/**
 *  Serializes parsed results into a VCE Exam Simulator-ready TXT document
 */
export function formatVceText(results: Result[], options: VceFormatOptions = {}): string {
    let content = "";

    for (const row of results) {
        content += `Question NO: ${row.question_number}\n`;
        content += `${row.question_text}\n\n`;

        for (const choice of row.choices) {
            content += `${choice}\n`;
        }

        content += `\nAnswer: ${row.answer}\n\n`;

        if (!options.excludeRationale) {
            content += `Rationale:\n`;

            const rationale = row.rationale;

            if (rationale) {
                row.choices.forEach((choice, idx) => {
                    if (idx < rationale.length) {
                        content += `${choice}: ${rationale[idx]}\n`;
                    } else {
                        content += `${choice}: No associated rationale for choice\n`;
                    }
                });
            } else {
                row.choices.forEach((choice) => {
                    content += `${choice}: No rationale provided\n`;
                });
            }

            content += "\n";
        }

        content += "\n";
    }

    return content;
}
