"use client"

import { motion } from "framer-motion"

interface SkillData {
    name: string
    level: number // 0-100
    color: string
}

interface SkillRadarProps {
    skills?: SkillData[]
}

const defaultSkills: SkillData[] = [
    { name: "Speaking", level: 65, color: "#22c55e" },
    { name: "Listening", level: 80, color: "#8b5cf6" },
    { name: "Reading", level: 90, color: "#3b82f6" },
    { name: "Writing", level: 55, color: "#f97316" },
    { name: "Vocabulary", level: 75, color: "#ec4899" },
    { name: "Grammar", level: 60, color: "#06b6d4" },
]

export function SkillRadar({ skills = defaultSkills }: SkillRadarProps) {
    const size = 200
    const center = size / 2
    const maxRadius = size / 2 - 20

    const angleStep = (2 * Math.PI) / skills.length
    const startAngle = -Math.PI / 2 // Start from top

    const getPoint = (level: number, index: number) => {
        const angle = startAngle + index * angleStep
        const radius = (level / 100) * maxRadius
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        }
    }

    const getLabelPoint = (index: number) => {
        const angle = startAngle + index * angleStep
        const radius = maxRadius + 15
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        }
    }

    // Generate polygon path for skills
    const polygonPath = skills
        .map((skill, i) => {
            const point = getPoint(skill.level, i)
            return `${point.x},${point.y}`
        })
        .join(" ")

    // Generate grid lines
    const gridLevels = [25, 50, 75, 100]

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Grid circles */}
                {gridLevels.map((level) => (
                    <circle
                        key={level}
                        cx={center}
                        cy={center}
                        r={(level / 100) * maxRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        strokeWidth={1}
                    />
                ))}

                {/* Axis lines */}
                {skills.map((_, i) => {
                    const point = getPoint(100, i)
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={point.x}
                            y2={point.y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    )
                })}

                {/* Skill polygon */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    points={polygonPath}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                />

                {/* Skill points */}
                {skills.map((skill, i) => {
                    const point = getPoint(skill.level, i)
                    return (
                        <motion.circle
                            key={skill.name}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 0.3 }}
                            cx={point.x}
                            cy={point.y}
                            r={5}
                            fill={skill.color}
                            stroke="white"
                            strokeWidth={2}
                            className="cursor-pointer"
                        />
                    )
                })}

                {/* Labels */}
                {skills.map((skill, i) => {
                    const point = getLabelPoint(i)
                    return (
                        <text
                            key={skill.name}
                            x={point.x}
                            y={point.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs fill-muted-foreground"
                        >
                            {skill.name}
                        </text>
                    )
                })}
            </svg>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: skill.color }}
                        />
                        <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
