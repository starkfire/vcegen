import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useParser, type Strategy } from "@/app/providers/parser";

import type { ComponentProps } from "react";

type OptionRowProps = {
    id: string;
    label: string;
    checked: boolean;
    className?: string;
    onChange?: (checked: boolean) => void
}

function OptionRow(props: OptionRowProps) {
    return (
        <div className={cn("flex items-center gap-2", props.className)}>
            <Checkbox
                id={props.id}
                checked={props.checked}
                onCheckedChange={(checked) => props.onChange?.(checked === true)}
            />
            <Label htmlFor={props.id}>
                {props.label}
            </Label>
        </div>
    )
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
    const parser = useParser()

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-display font-semibold">vcegen</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="gap-4 p-2 pt-4">
                <div>
                    <Label className="mb-2 block text-sm leading-tight font-semibold">
                        Parsing Strategy
                    </Label>
                    <Select
                        value={parser.strategy}
                        onValueChange={(value) => parser.setStrategy(value as Strategy)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Strategy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Strategy</SelectLabel>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="pymupdf">PyMuPDF</SelectItem>
                                <SelectItem value="triplecolumn">Triple Column</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="mb-2 block text-sm leading-tight font-semibold">
                        Options
                    </Label>
                    <div className="space-y-4 py-2">
                        <OptionRow
                            id="boxed-choices"
                            label="Boxed Choices"
                            checked={parser.boxedChoices}
                            onChange={parser.setBoxedChoices}
                        />
                        <OptionRow
                            id="exclude-rationale"
                            label="Exclude Rationale"
                            checked={parser.excludeRationale}
                            onChange={parser.setExcludeRationale}
                        />
                    </div>
                </div>
                <div>
                    <Label className="mb-2 block text-sm leading-tight font-semibold">
                        Results
                    </Label>
                    {
                        (!parser.file && !parser.isLoading) ? (
                            <p className="text-sm">No file attached to staging area</p>
                        ) : (
                            <p className="text-sm">
                                <span className="font-semibold tracking-tight">Detected Invalid: </span>
                                {parser.invalidRows.length}
                            </p>
                        )
                    }
                </div>
            </SidebarContent>
            <SidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}
