import eqTest from './eq'

export default function unitTests (dash, r, connection) {
  describe('Unit Tests', () => {
    eqTest(dash, r, connection)
  })
}