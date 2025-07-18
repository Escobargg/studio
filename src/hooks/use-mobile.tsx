"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false) // Default to false on the server

  React.useEffect(() => {
    // This code only runs on the client
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set the initial value on the client
    checkIsMobile()

    // Add event listener for window resize
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)

    // Cleanup the event listener on component unmount
    return () => mql.removeEventListener("change", checkIsMobile)
  }, [])

  return isMobile
}
