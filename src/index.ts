import * as _ from 'lodash'
import {Payload, Node, Chain, HelperNode} from './types'

function matchToNode(match:string):HelperNode {
  const [,P1,dots,id,P2] = /^(\(?)(\.*)([a-zA-Z0-9]+)(\)?)$/.exec(match)
  const P = <Payload>{id}
  const node:HelperNode = {id, level:dots.length, payload:{id}}
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
  helperNodes.filter(HN => !!HN.PV).forEach(item => chain[item.PV].NV = item.id)
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

  let helperNodes = nodeSpec
    .match(/(\(?\.*[A-Z]\)?)/ig)
    .map(M => matchToNode(M))

  const ids = helperNodes.map(item => item.id)
  helperNodes.forEach((item, index) => { item.prev = (index > 0) ? ids[index-1] : null })
  helperNodes.forEach((item, index) => { item.next = (index < (helperNodes.length - 1)) ? ids[index+1]: null })
  helperNodes = addPV(helperNodes)

  const chain = convertToChain(helperNodes)
  addNV(helperNodes, chain)
  addRLevels(helperNodes, chain)



  return chain
}
