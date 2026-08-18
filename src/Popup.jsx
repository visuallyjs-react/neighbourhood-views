import {useMemo} from "react";
import {BaseNode, FormulaNode} from "./components";
import renderOptions from "./render-options"
import { PaperComponent} from "@visuallyjs/browser-ui-react"

export default function Popup({ id, title, data, layout, onNodeTap, hidden, onToggle }) {

    const popupRenderOptions = useMemo(() => ({
        ...renderOptions,
        layout: layout || renderOptions.layout,
        wheel: { zoom: false },
        enablePan: false,
        zoomToFit: true
    }), [layout])

    const popupView = useMemo(() => ({
        nodes: {
            base: {
                jsx: BaseNode,
                events: {
                    tap: (p) => onNodeTap(p.obj)
                }
            },
            formula: {
                jsx: FormulaNode,
                events: {
                    tap: (p) => onNodeTap(p.obj)
                }
            }
        }
    }), [onNodeTap])

    return (
        <div id={id} className="popup" data-hidden={hidden}>
            <div className="title" onClick={onToggle}>
                {title}
                <div className="toggle-btn">{hidden ? '+' : '_'}</div>
            </div>
            {!hidden && (
                <div className="content">
                    <PaperComponent data={data} renderOptions={popupRenderOptions} viewOptions={popupView} />
                </div>
            )}
        </div>
    )
}
