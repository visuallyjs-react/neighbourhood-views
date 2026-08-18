import React, { useState, useRef, useMemo } from 'react'
import { SurfaceComponent} from "@visuallyjs/browser-ui-react"
import { HierarchyLayout } from "@visuallyjs/browser-ui"
import { parse } from './data-adapter'
import rawData from './assets/dataset'
import { BaseNode, FormulaNode } from './components'
import './neighbourhood-views.css'
import renderOptions from "./render-options"
import Popup from "./Popup"

const initialData = parse(rawData)

export default function App() {
    const [focusNodeId, setFocusNodeId] = useState(initialData.nodes[0].id)
    const surfaceRef = useRef(null)

    const [popupVisibility, setPopupVisibility] = useState({
        successors: false,
        predecessors: false,
        neighbours: false,
        siblings: false
    })

    const togglePopup = (id) => {
        setPopupVisibility(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const setAllPopups = (hidden) => {
        setPopupVisibility({
            successors: hidden,
            predecessors: hidden,
            neighbours: hidden,
            siblings: hidden
        })
    }

    const mainView = useMemo(() => ({
        nodes: {
            base: {
                jsx: BaseNode,
                events: {
                    tap: (p) => {
                        handleNodeTap(p.obj)
                    }
                }
            },
            formula: {
                jsx: FormulaNode,
                events: {
                    tap: (p) => {
                        handleNodeTap(p.obj)
                    }
                }
            }
        }
    }), [])

    const handleNodeTap = (node) => {
        setFocusNodeId(node.id)
        if (surfaceRef.current) {
            surfaceRef.current.getSurface().centerOn(node.id)
            surfaceRef.current.getModel().setSelection(node.id)
        }
    }

    // Successors: Focus node + all children (and edges between them)
    const successorsData = useMemo(() => {
        if (!focusNodeId) return { nodes: [], edges: [] }
        const focusNode = initialData.nodes.find(n => n.id === focusNodeId)
        const nodes = [focusNode]
        const edges = []
        const stack = [focusNodeId]
        const visited = new Set([focusNodeId])

        while (stack.length > 0) {
            const currId = stack.pop()
            const childEdges = initialData.edges.filter(e => e.source === currId)
            childEdges.forEach(e => {
                edges.push(e)
                if (!visited.has(e.target)) {
                    visited.add(e.target)
                    const targetNode = initialData.nodes.find(n => n.id === e.target)
                    if (targetNode) {
                        nodes.push(targetNode)
                        stack.push(e.target)
                    }
                }
            })
        }
        return { nodes, edges }
    }, [focusNodeId])
    //
    // Predecessors: Focus node + parent (and edge between them)
    const predecessorsData = useMemo(() => {
        if (!focusNodeId) return { nodes: [], edges: [] }
        const focusNode = initialData.nodes.find(n => n.id === focusNodeId)
        const nodes = [focusNode]
        const edges = initialData.edges.filter(e => e.target === focusNodeId)
        edges.forEach(e => {
            const sourceNode = initialData.nodes.find(n => n.id === e.source)
            if (sourceNode) nodes.push(sourceNode)
        })
        return { nodes, edges }
    }, [focusNodeId])
    //
    // Siblings: Focus node + parent + all siblings
    const siblingsData = useMemo(() => {
        if (!focusNodeId) return { nodes: [], edges: [] }
        const focusNode = initialData.nodes.find(n => n.id === focusNodeId)
        const parentEdge = initialData.edges.find(e => e.target === focusNodeId)
        if (!parentEdge) return { nodes: [focusNode], edges: [] }

        const parentNode = initialData.nodes.find(n => n.id === parentEdge.source)
        const siblingEdges = initialData.edges.filter(e => e.source === parentEdge.source)
        const nodes = [parentNode]
        const edges = []

        siblingEdges.forEach(e => {
            edges.push(e)
            const targetNode = initialData.nodes.find(n => n.id === e.target)
            if (targetNode) nodes.push(targetNode)
        })

        return { nodes, edges }
    }, [focusNodeId])
    //
    // Neighbours: Focus node + all immediate neighbours (parents and children)
    const neighboursData = useMemo(() => {
        if (!focusNodeId) return { nodes: [], edges: [] }
        const focusNode = initialData.nodes.find(n => n.id === focusNodeId)
        const nodes = [focusNode]
        const edges = initialData.edges.filter(e => e.source === focusNodeId || e.target === focusNodeId)

        edges.forEach(e => {
            const otherId = e.source === focusNodeId ? e.target : e.source
            const otherNode = initialData.nodes.find(n => n.id === otherId)
            if (otherNode) nodes.push(otherNode)
        })

        return { nodes, edges }
    }, [focusNodeId])

    const successorsLayout = useMemo(() => ({
        type: HierarchyLayout.type,
        options: {
            getRootNode: () => focusNodeId
        }
    }), [focusNodeId])

    const predecessorsLayout = useMemo(() => ({
        type: HierarchyLayout.type,
        options: {
            invert: true,
            getRootNode: () => focusNodeId
        }
    }), [focusNodeId])


    return (
        <div className="vjs-nv-main">
            <div className="taskbar">
                <div className="taskbar-links">
                    <button className={!popupVisibility.successors ? 'active' : ''} onClick={() => togglePopup('successors')}>Successors</button>
                    <button className={!popupVisibility.predecessors ? 'active' : ''} onClick={() => togglePopup('predecessors')}>Predecessors</button>
                    <button className={!popupVisibility.neighbours ? 'active' : ''} onClick={() => togglePopup('neighbours')}>Neighbours</button>
                    <button className={!popupVisibility.siblings ? 'active' : ''} onClick={() => togglePopup('siblings')}>Siblings</button>
                </div>
                <div className="taskbar-actions">
                    <button onClick={() => setAllPopups(false)}>Show All</button>
                    <button onClick={() => setAllPopups(true)}>Hide All</button>
                </div>
            </div>

            <SurfaceComponent
                ref={surfaceRef}
                data={initialData}
                dataType="hierarchical-json"
                renderOptions={renderOptions}
                viewOptions={mainView}
            />

            <Popup id="successors" title="Successors" data={successorsData} layout={successorsLayout} onNodeTap={handleNodeTap} hidden={popupVisibility.successors} onToggle={() => togglePopup('successors')} />
            <Popup id="predecessors" title="Predecessors" data={predecessorsData} layout={predecessorsLayout} onNodeTap={handleNodeTap} hidden={popupVisibility.predecessors} onToggle={() => togglePopup('predecessors')} />
            <Popup id="neighbours" title="Neighbours" data={neighboursData} onNodeTap={handleNodeTap} hidden={popupVisibility.neighbours} onToggle={() => togglePopup('neighbours')} />
            <Popup id="siblings" title="Siblings" data={siblingsData} onNodeTap={handleNodeTap} hidden={popupVisibility.siblings} onToggle={() => togglePopup('siblings')} />
        </div>
    )
}
