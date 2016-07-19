import * as _ from 'lodash'
import {Node, Chain, Payload} from '@trystal/interfaces'

interface HelperNode extends Node {
  level?:number,
  isHead?:boolean
  isTail?:boolean
}

type StringU = string | undefined
type StringUN = string | undefined | null 

function chainOps(chain:Chain) {
  const first = ():Node => <Node>_.first(_.values(chain))

  const pid    = (id:string):StringU => chain[id].prev
  const nid    = (id:string):StringU => chain[id].next
  const pvid   = (id:string):StringU => chain[id].PV
  const nvid   = (id:string):StringU => chain[id].NV
  
  function hid(id:string):string {
    let nextId = pvid(id) || pid(id) 
    if(!nextId) return id
    return hid(nextId)
  }

  const rlevel = (id:string):number|undefined => chain[id].rlevel

  const head   = ():StringUN => first() ? hid(first().id) : null
  function ids(id:string):string[] {
    const NID = nid(id)
    if(!NID) return [id]
    return [id,...ids(NID)] 
  }
  function level(id:string):number {
    const nextId = pvid(id) || pid(id)
    const RLEVEL = rlevel(id) || 0
    if(!nextId) return RLEVEL 
    return RLEVEL + level(nextId)
  }

  return {
    head, ids, level, pvid, nvid, pid, nid
  }
}
function matchToNode(match:string):HelperNode {
  const [,P1,dots,id,P2] = <string[]>/^(\(?)(\.*)([a-zA-Z0-9]+)(\)?)$/.exec(match)
  const payload = <Payload>{id, trystup:id}
  const node:HelperNode = {id, level:dots.length, payload}
  if(P1 === '(') node.isHead = true
  if(P2 === ')') node.isTail = true
  return node
}
function addPV(helperNodes:HelperNode[]):HelperNode[] {
  const stack = <HelperNode[]>[]
  helperNodes.forEach(hn => {
    if(hn.isHead || _.isEmpty(stack)) stack.push(hn)
    else {
      hn.PV = _.last(stack).id
      stack[stack.length - 1] = hn
    }
    if(hn.isTail) stack.pop()
  })
  return helperNodes
}
function convertToChain(helperNodes:HelperNode[]):Chain {
  return helperNodes.reduce((acc, item) => {
    acc[item.id] = item 
    return acc 
  }, {})
}
function addNV(helperNodes:HelperNode[], chain:Chain) {
  helperNodes.filter(HN => !!HN.PV).forEach(item => chain[item.PV!].NV = item.id)
}
function addRLevels(helperNodes:HelperNode[], chain:Chain) {
  helperNodes.forEach((item:HelperNode) => {
    if(item.PV) item.rlevel = item.level - (<HelperNode>chain[item.PV]).level
    else if(item.prev) item.rlevel = item.level - (<HelperNode>chain[item.prev]).level
    else item.rlevel = item.level
  })
  helperNodes.forEach(item => {
    delete item.level
    delete item.isHead
    delete item.isTail
  })
}
export function buildChain(nodeSpec:string):Chain {
  if(_.isEmpty(nodeSpec)) return {}

  let helperNodes = (<string[]>nodeSpec.match(/(\(?\.*[A-Z][0-9]*\)?)/ig)).map(M => matchToNode(M)) 
  const ids = helperNodes.map(item => item.id)
  helperNodes.forEach((hn, index) => { hn.prev = (index > 0) ? ids[index-1] : undefined })
  helperNodes.forEach((hn, index) => { hn.next = (index < (helperNodes.length - 1)) ? ids[index+1]: undefined })
  helperNodes = addPV(helperNodes)

  const chain = convertToChain(helperNodes)
  addNV(helperNodes, chain)
  addRLevels(helperNodes, chain)

  return chain
}
export function dump(chain:Chain):string {
  let COPS = chainOps(chain)
  const H = COPS.head()
  const ids = H ? COPS.ids(H) : []
  let stackSize = 0
  return ids.map((id:string) => {
    const level = COPS.level(id)
    let str = _.repeat('.', level) + id
    if(!COPS.pvid(id) && !!COPS.pid(id)) { str = '(' + str; stackSize++ }
    if(!COPS.nvid(id) && !!COPS.nid(id) && stackSize > 0) { str = str + ')'; stackSize-- }
    return str
  }).join('') + _.repeat(')', stackSize)

} 
