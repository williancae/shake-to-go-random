"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter()

    useEffect(() => {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated")
      if (isAuthenticated !== "true") {
        router.push("/login")
      }
    }, [router])

    return <WrappedComponent {...props} />
  }

  return Wrapper
}

export default withAuth
