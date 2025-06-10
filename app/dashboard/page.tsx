"use client"

import { useEffect, useState, useContext } from "react"
import { getAllQuestionBanks } from "@/lib/db"
import { ModalContext } from "@/components/modals/model-provider"
import { useRouter } from "next/navigation";
import { BANKPREFIX_URL } from "@/lib/client-constants"
import LoadingScreen from "@/components/loading-screen"
import { WelcomeTour } from "@/components/welcome-tour";

export default function DashboardPage() {
  const router = useRouter();
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await getAllQuestionBanks()
        if (banks.length === 0) {
          setShowAddWorkspaceModal(true)
        }
        else {
          router.push(`${BANKPREFIX_URL}/${banks[0].id}`)
        }
      } catch (error) {
        console.error("Failed to fetch question banks:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBanks()
  }, [router, setShowAddWorkspaceModal])

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  return (
    <>
      <WelcomeTour />
    </>
  )
}