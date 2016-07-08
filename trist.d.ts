declare module "data-gen" {
    export interface Payload {
        id:string
    }

    export interface Node {
        id:string,
        prev?: string
        next?: string
        PV?: string
        NV?: string
        rlevel?: number
        payload?: Payload
    }

    export interface Chain {
        [id:string] : Node
    }

    export interface HelperNode extends Node {
        level?:number,
        isHead?:boolean
        isTail?:boolean
    }

    export function buildChain(nodeSpec:string):Chain 
}
