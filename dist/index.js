"use strict";
const _ = require('lodash');
function chainOps(chain) {
    const first = () => _.first(_.values(chain));
    const pid = (id) => chain[id].prev;
    const nid = (id) => chain[id].next;
    const pvid = (id) => chain[id].PV;
    const nvid = (id) => chain[id].NV;
    function hid(id) {
        let nextId = pvid(id) || pid(id);
        if (!nextId)
            return id;
        return hid(nextId);
    }
    const rlevel = (id) => chain[id].rlevel;
    const head = () => first() ? hid(first().id) : null;
    function ids(id) {
        const NID = nid(id);
        if (!NID)
            return [id];
        return [id, ...ids(NID)];
    }
    function level(id) {
        const nextId = pvid(id) || pid(id);
        const RLEVEL = rlevel(id) || 0;
        if (!nextId)
            return RLEVEL;
        return RLEVEL + level(nextId);
    }
    return {
        head, ids, level, pvid, nvid, pid, nid
    };
}
function matchToNode(match) {
    const [, P1, dots, id, P2] = /^(\(?)(\.*)([a-zA-Z0-9]+)(\)?)$/.exec(match);
    const payload = { id, trystup: id };
    const node = { id, level: dots.length, payload };
    if (P1 === '(')
        node.isHead = true;
    if (P2 === ')')
        node.isTail = true;
    return node;
}
function addPV(helperNodes) {
    const stack = [];
    helperNodes.forEach(hn => {
        if (hn.isHead || _.isEmpty(stack))
            stack.push(hn);
        else {
            hn.PV = _.last(stack).id;
            stack[stack.length - 1] = hn;
        }
        if (hn.isTail)
            stack.pop();
    });
    return helperNodes;
}
function convertToChain(helperNodes) {
    return helperNodes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
}
function addNV(helperNodes, chain) {
    helperNodes.filter(HN => !!HN.PV).forEach(item => chain[item.PV].NV = item.id);
}
function addRLevels(helperNodes, chain) {
    helperNodes.forEach((item) => {
        if (item.PV)
            item.rlevel = item.level - chain[item.PV].level;
        else if (item.prev)
            item.rlevel = item.level - chain[item.prev].level;
        else
            item.rlevel = item.level;
    });
    helperNodes.forEach(item => {
        delete item.level;
        delete item.isHead;
        delete item.isTail;
    });
}
function buildChain(nodeSpec) {
    if (_.isEmpty(nodeSpec))
        return {};
    let helperNodes = nodeSpec.match(/(\(?\.*[A-Z][0-9]*\)?)/ig).map(M => matchToNode(M));
    const ids = helperNodes.map(item => item.id);
    helperNodes.forEach((hn, index) => { hn.prev = (index > 0) ? ids[index - 1] : undefined; });
    helperNodes.forEach((hn, index) => { hn.next = (index < (helperNodes.length - 1)) ? ids[index + 1] : undefined; });
    helperNodes = addPV(helperNodes);
    const chain = convertToChain(helperNodes);
    addNV(helperNodes, chain);
    addRLevels(helperNodes, chain);
    return chain;
}
exports.buildChain = buildChain;
function dump(chain) {
    let COPS = chainOps(chain);
    const H = COPS.head();
    const ids = H ? COPS.ids(H) : [];
    let stackSize = 0;
    return ids.map((id) => {
        const level = COPS.level(id);
        let str = _.repeat('.', level) + id;
        if (!COPS.pvid(id) && !!COPS.pid(id)) {
            str = '(' + str;
            stackSize++;
        }
        if (!COPS.nvid(id) && !!COPS.nid(id) && stackSize > 0) {
            str = str + ')';
            stackSize--;
        }
        return str;
    }).join('') + _.repeat(')', stackSize);
}
exports.dump = dump;
