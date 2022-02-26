import { RedirectDx, getHistory, WithRouterRedirectDx /*RedirectDxProps*/ } from '../src'
import * as React from 'react'

describe('Instantiate', () => {
  it('finds RedirectDx', () => {
    expect(RedirectDx).toBeTruthy()
    expect(getHistory).toBeDefined()
    expect(React.createElement(WithRouterRedirectDx)).toBeDefined()
  })
})
