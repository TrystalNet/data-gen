import {Node} from '@trystal/interfaces'

export interface HelperNode extends Node {
  level?:number,
  isHead?:boolean
  isTail?:boolean
}

