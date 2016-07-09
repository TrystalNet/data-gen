"use strict";
var _ = require('lodash');
function matchToNode(match) {
    var _a = /^(\(?)(\.*)([a-zA-Z0-9]+)(\)?)$/.exec(match), P1 = _a[1], dots = _a[2], id = _a[3], P2 = _a[4];
    var P = { id: id };
    var node = { id: id, level: dots.length, payload: { id: id } };
    if (P1 === '(')
        node.isHead = true;
    if (P2 === ')')
        node.isTail = true;
    return node;
}
function addPV(helperNodes) {
    var stack = [];
    helperNodes.forEach(function (hn) {
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
    return helperNodes.reduce(function (acc, item) {
        acc[item.id] = item;
        return acc;
    }, {});
}
function addNV(helperNodes, chain) {
    helperNodes.filter(function (HN) { return !!HN.PV; }).forEach(function (item) { return chain[item.PV].NV = item.id; });
}
function addRLevels(helperNodes, chain) {
    helperNodes.forEach(function (item) {
        if (item.PV)
            item.rlevel = item.level - chain[item.PV].level;
        else if (item.prev)
            item.rlevel = item.level - chain[item.prev].level;
        else
            item.rlevel = item.level;
    });
    helperNodes.forEach(function (item) {
        delete item.level;
        delete item.isHead;
        delete item.isTail;
    });
}
function buildChain(nodeSpec) {
    if (_.isEmpty(nodeSpec))
        return {};
    var helperNodes = nodeSpec
        .match(/(\(?\.*[A-Z]\)?)/ig)
        .map(function (M) { return matchToNode(M); });
    var ids = helperNodes.map(function (item) { return item.id; });
    helperNodes.forEach(function (item, index) { item.prev = (index > 0) ? ids[index - 1] : null; });
    helperNodes.forEach(function (item, index) { item.next = (index < (helperNodes.length - 1)) ? ids[index + 1] : null; });
    helperNodes = addPV(helperNodes);
    var chain = convertToChain(helperNodes);
    addNV(helperNodes, chain);
    addRLevels(helperNodes, chain);
    return chain;
}
exports.buildChain = buildChain;
