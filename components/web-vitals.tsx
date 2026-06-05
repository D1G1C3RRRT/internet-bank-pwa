'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Round to 2 decimal places for better readability
    const value = Math.round(metric.value * 100) / 100

    switch (metric.name) {
      case 'FCP':
        console.log(`[Web Vitals] FCP (First Contentful Paint): ${value}ms`)
        break
      case 'LCP':
        console.log(`[Web Vitals] LCP (Largest Contentful Paint): ${value}ms`)
        break
      case 'CLS':
        console.log(`[Web Vitals] CLS (Cumulative Layout Shift): ${value}`)
        break
      case 'FID':
        console.log(`[Web Vitals] FID (First Input Delay): ${value}ms`)
        break
      case 'TTFB':
        console.log(`[Web Vitals] TTFB (Time to First Byte): ${value}ms`)
        break
      case 'INP':
        console.log(`[Web Vitals] INP (Interaction to Next Paint): ${value}ms`)
        break
      default:
        console.log(`[Web Vitals] ${metric.name}: ${value}`)
        break
    }
  })

  return null
}
