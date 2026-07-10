import { describe, it, expect } from 'vitest'
import { detectPageType } from '../../utils/page-type'

describe('detectPageType', () => {
  it('detects blog from path', () => {
    expect(
      detectPageType({
        pathname: '/blog/my-post',
        wordCount: 100,
        headings: [],
        jsonLd: [],
        html: '',
      }),
    ).toBe('blog')
  })

  it('detects homepage', () => {
    expect(
      detectPageType({
        pathname: '/',
        wordCount: 50,
        headings: [],
        jsonLd: [],
        html: '',
      }),
    ).toBe('homepage')
  })

  it('detects utility pages', () => {
    expect(
      detectPageType({
        pathname: '/thank-you',
        wordCount: 20,
        headings: [],
        jsonLd: [],
        html: '',
      }),
    ).toBe('utility')
  })

  it('detects product from schema', () => {
    expect(
      detectPageType({
        pathname: '/item/1',
        wordCount: 100,
        headings: [],
        jsonLd: [{ '@type': 'Product', name: 'Shoes' }],
        html: '',
      }),
    ).toBe('product')
  })
})
