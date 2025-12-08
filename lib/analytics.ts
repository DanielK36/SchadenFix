// Analytics helper - kann später mit PostHog/GTM verbunden werden
export function trackEvent(
  event: string,
  properties?: Record<string, any>
) {
  // In Produktion: PostHog/GTM Integration
  if (typeof window !== "undefined") {
    console.log(`📊 Analytics Event: ${event}`, properties)
    
    // Stub für PostHog
    // if (window.posthog) {
    //   window.posthog.capture(event, properties)
    // }
    
    // Stub für GTM
    // if (window.dataLayer) {
    //   window.dataLayer.push({ event, ...properties })
    // }
  }
}

export function selectType(type: string) {
  trackEvent("select_type", { type })
}

export function stepChange(stepIndex: number, type: string) {
  trackEvent("step_change", { stepIndex, type })
}

export function photoUpload(count: number, type: string) {
  trackEvent("photo_upload", { count, type })
}

export function submitClaim(
  type: string,
  wish: string[],
  regionPrefix: string,
  hasWorkshopBinding: boolean,
  onlyCallback: boolean
) {
  trackEvent("submit", {
    type,
    wish,
    regionPrefix,
    hasWorkshopBinding,
    onlyCallback,
  })
}

export function dropoffStep(stepIndex: number, type: string) {
  trackEvent("dropoff_step", { stepIndex, type })
}

export function routingTarget(
  partners: Array<{ name: string; email: string }> | null,
  internalOnly: boolean
) {
  trackEvent("routing_target", {
    internalOnly,
    partnerCount: partners?.length || 0,
    partners: partners?.map((p) => p.name) || [],
  })
}

