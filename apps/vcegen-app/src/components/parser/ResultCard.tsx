import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import type { Result } from "@/app/providers/parser"

type ResultCardProps = {
    data: Result,
    className?: string
}

export function ResultCard({ data, className }: ResultCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="font-display text-base font-bold tracking-tight">
                    {data.question_number ?? "[NO NUMBER ATTACHED]"}. {data.question_text ?? "[NO QUESTION ATTACHED]"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        {data.choices.map((choice, idx) => (
                            <p key={idx}>{choice}</p>
                        ))}
                    </div>
                    <div>
                        <p>
                            <span className="font-semibold tracking-tight">Answer: </span>
                            {data.answer ?? "[NO ANSWER ATTACHED]"}
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold tracking-tight">Rationale:</p>
                        {data.rationale?.map((rationale, idx) => (
                            <p key={idx}>{rationale}</p>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
