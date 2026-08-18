import React from 'react'

export function Formula({ formula }) {
    const parts = (formula || '').match(/([A-Z]+)|([0-9]+)|-/g) || []
    return (
        <div className="formula-value">
            {parts.map((c, i) => {
                const val = parseInt(c)
                if (isNaN(val)) {
                    return <span key={i} data-c={c}>{c}</span>
                } else {
                    return <sub key={i}>{c}</sub>
                }
            })}
        </div>
    )
}

export function BaseNode({ data }) {
    return <div className="base">{data.label}</div>
}

export function FormulaNode({ data }) {
    return (
        <div className="formula">
            <div className="title">{data.label}</div>
            <Formula formula={data.formula} />
        </div>
    )
}
