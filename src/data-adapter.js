import {uuid} from "@visuallyjs/browser-ui";

export function parse(data) {
    const nodes = []
    const edges = []

    function _one(d) {
        const type = d.formula == null ? "base" : "formula"
        const node = {
            id: uuid(),
            label: d.label,
            type,
            formula: d.formula
        }
        nodes.push(node)

        if (d.children) {
            for (let c in d.children) {
                const childNode = _one(d.children[c])
                edges.push({source: node.id, target: childNode.id})
            }
        }
        return node
    }

    for (let root in data) {
        _one(data[root])
    }

    return { nodes, edges }
}
