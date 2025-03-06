declare module 'graphology' {
  export interface NodeAttributes {
    [key: string]: any;
  }

  export interface EdgeAttributes {
    [key: string]: any;
  }

  export interface GraphAttributes {
    [key: string]: any;
  }

  export class MultiDirectedGraph<
    N extends NodeAttributes = NodeAttributes,
    E extends EdgeAttributes = EdgeAttributes,
    G extends GraphAttributes = GraphAttributes
  > {
    addNode(node: string, attributes?: N): string;
    addDirectedEdge(source: string, target: string, attributes?: E): string;
    addEdge(source: string, target: string, attributes?: E): string;
    clear(): void;
    forEachNode(callback: (node: string, attributes: N) => void): void;
    forEachEdge(callback: (edge: string, attributes: E, source: string, target: string) => void): void;
    forEachNeighbor(node: string, callback: (neighbor: string, attributes: N) => void): void;
    getNodeAttribute(node: string, attribute: string): any;
    setNodeAttribute(node: string, attribute: string, value: any): void;
  }
} 