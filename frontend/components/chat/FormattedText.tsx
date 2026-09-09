'use client'
import React from 'react'

interface FormattedTextProps {
  content: string
  className?: string
}

/**
 * Lightweight, safe rich-text formatter for AI conversational chat bubbles.
 * Formats **bold**, bulleted lists (- / *), linebreaks, and highlighted currency.
 */
export function FormattedText({ content, className = '' }: FormattedTextProps) {
  if (!content) return null

  // Split content by lines
  const lines = content.split('\n')

  return (
    <div className={`space-y-1.5 leading-relaxed text-sm ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />
        }

        // Check if bullet item
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')
        const isNumbered = /^\d+\.\s/.test(trimmed)
        const textToFormat = isBullet
          ? trimmed.replace(/^[-*•]\s+/, '')
          : isNumbered
          ? trimmed.replace(/^\d+\.\s+/, '')
          : line

        const formattedInline = renderInlineFormatting(textToFormat)

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-[#4A90e2] text-xs mt-1 shrink-0 font-bold">•</span>
              <span className="flex-1">{formattedInline}</span>
            </div>
          )
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\.\s/)
          const num = numMatch ? numMatch[1] : '1'
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-[#4A90e2] text-xs mt-0.5 shrink-0 font-bold tabular-nums">{num}.</span>
              <span className="flex-1">{formattedInline}</span>
            </div>
          )
        }

        return <p key={lineIdx}>{formattedInline}</p>
      })}
    </div>
  )
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex to split by **bold** or `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2)
      return (
        <strong key={i} className="font-bold text-foreground">
          {boldText}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1)
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-[13px] font-mono text-[#4A90e2] font-semibold">
          {codeText}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}
