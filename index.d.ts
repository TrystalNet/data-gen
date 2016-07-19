import {Node,Chain} from '@trystal/interfaces'

export interface HelperNode extends Node {
    level?:number,
    isHead?:boolean
    isTail?:boolean
}

export function buildChain(nodeSpec:string):Chain
export function dump(chain:Chain):string 
