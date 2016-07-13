declare module "@trystal/data-gen" {
    import {IMM} from '@trystal/interfaces'
    import {JS} from '@trystal/interfaces'
    
    export interface HelperNode extends JS.Node {
        level?:number,
        isHead?:boolean
        isTail?:boolean
    }

    export function buildChain(nodeSpec:string):JS.Chain
    export function dump(chain:JS.Chain):string 
}
