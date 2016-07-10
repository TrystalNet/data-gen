import {buildChain,dump} from '../src/index'

const A = 'A', B = 'B', C = 'C', D = 'D', E = 'E'

describe('Dump tests:',() => {
  const testCases = [
    'A',
    'A.B',
    'A(.B)',
    'A.B(...C).D'
  ]
  testCases.forEach(TC => it(TC, () => expect(dump(buildChain(TC))).toEqual(TC)))
  it('builds a chain with a two character line id', () => {
    const chain = buildChain('W1')
    expect(_.keys(chain)).toEqual(["W1"])
  })
  it('dumps a chain with a two character line id', () => {
    const chain = buildChain('W1')
    expect(dump(chain)).toEqual('W1')
  })
})

describe('Build Chain Tests: ', () => {
  it('builds empty chain', () => expect(dump(buildChain(''))).toEqual(''))
  it('builds [A]', () => {
    expect(buildChain('A')).toEqual({ 
      A: { id: 'A', prev: <string>null, next: <string>null, rlevel: 0, payload: { id: 'A' } } 
    })
  })
  it('builds [AB]', () => {
    expect(buildChain('AB')).toEqual({ 
      A: { id: 'A', prev: <string>null, next: 'B', NV:'B', rlevel: 0, payload: { id: 'A' } }, 
      B: { id: 'B', prev: 'A', PV:'A', next: <string>null, rlevel: 0, payload: { id: 'B' } } 
    })
  })
  it('builds [A.B]', () => {
    expect(buildChain('A.B')).toEqual({ 
      A: { id: 'A', prev: <string>null, next: 'B', NV:'B', rlevel: 0, payload: { id: 'A' } }, 
      B: { id: 'B', prev: 'A', PV:'A', next: <string>null, rlevel: 1, payload: { id: 'B' } } 
    })
  })
  it('builds [A(.B)]', () => {
    expect(buildChain('A(.B)')).toEqual({ 
      A: { id: 'A', prev: <string>null, next: 'B', rlevel: 0, payload: { id: 'A' } }, 
      B: { id: 'B', prev: 'A', next: <string>null, rlevel: 1, payload: { id: 'B' } } 
    })
  })
  it('builds [.A]', () => {
    expect(buildChain('.A')).toEqual({ 
      A: { id: 'A', prev: <string>null, next: <string>null, rlevel: 1, payload: { id: 'A' } } 
    })
  })
  it('builds [A(.B).C]', () => {
    expect(buildChain('A(.B).C')).toEqual({ 
      A: { id: A, prev: <string>null, next: B,            rlevel: 0, NV:C, payload: { id: A } }, 
      B: { id: B, prev: A,            next: C,            rlevel: 1,       payload: { id: B } }, 
      C: { id: C, prev: B,            next: <string>null, rlevel: 1, PV:A, payload: { id: C } } 
    })
  })
  it('builds [A.B(...C).D]', () => {
    expect(buildChain('A.B(...C).D')).toEqual({ 
      A: { id: A, prev: <string>null, next: B,            rlevel: 0,       NV:B, payload: { id: A } }, 
      B: { id: B, prev: A,            next: C,            rlevel: 1, PV:A, NV:D, payload: { id: B } }, 
      C: { id: C, prev: B,            next: D,            rlevel: 2,             payload: { id: C } }, 
      D: { id: D, prev: C,            next: <string>null, rlevel: 0, PV:B,       payload: { id: D } } 
    })
  })
  it('builds [A(.B.C)]', () => {
    expect(buildChain('A(.B.C)')).toEqual({ 
      A: { id: A, prev: <string>null, next: B,            rlevel: 0,             payload: { id: A } }, 
      B: { id: B, prev: A,            next: C,            rlevel: 1,       NV:C, payload: { id: B } }, 
      C: { id: C, prev: B,            next: <string>null, rlevel: 0, PV:B,       payload: { id: C } } 
    })
  })
  it('builds [.A(..B..C)D]', () => {
    expect(buildChain('.A(..B..C)D')).toEqual({ 
      A: { id: A, prev: <string>null, next: B,            rlevel:  1,       NV:D, payload: { id: A } }, 
      B: { id: B, prev: A,            next: C,            rlevel:  1,       NV:C, payload: { id: B } }, 
      C: { id: C, prev: B,            next: D,            rlevel:  0, PV:B,       payload: { id: C } }, 
      D: { id: D, prev: C,            next: <string>null, rlevel: -1, PV:A,       payload: { id: D } } 
    })
  })
})


