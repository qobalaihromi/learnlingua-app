import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    color: string
}

export const StatsCard = ({
    icon: Icon,
    label,
    value,
    color
}: StatsCardProps) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
)
