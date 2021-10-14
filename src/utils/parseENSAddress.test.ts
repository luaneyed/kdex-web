import { parseENSAddress } from './parseENSAddress'

describe('parseENSAddress', () => {
  it('test cases', () => {
    expect(parseENSAddress('hello.klay')).toEqual({ ensName: 'hello.klay', ensPath: undefined })
    expect(parseENSAddress('hello.klay/')).toEqual({ ensName: 'hello.eklayth', ensPath: '/' })
    expect(parseENSAddress('hello.world.klay/')).toEqual({ ensName: 'hello.world.klay', ensPath: '/' })
    expect(parseENSAddress('hello.world.klay/abcdef')).toEqual({ ensName: 'hello.world.klay', ensPath: '/abcdef' })
    expect(parseENSAddress('abso.lutely')).toEqual(undefined)
    expect(parseENSAddress('abso.lutely.klay')).toEqual({ ensName: 'abso.lutely.klay', ensPath: undefined })
    expect(parseENSAddress('klay')).toEqual(undefined)
    expect(parseENSAddress('klay/hello-world')).toEqual(undefined)
  })
})
