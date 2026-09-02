"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

function ActivatePageContent() {
  const t = useTranslations("Auth.activate")
  const searchParams = useSearchParams()
  const key = searchParams.get("key")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!key) {
      setStatus("error")
      return
    }

    const activateAccount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/activate?key=${key}`)
        if (response.ok) {
          setStatus("success")
        } else {
          setStatus("error")
        }
      } catch (error) {
        setStatus("error")
      }
    }

    activateAccount()
  }, [key])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-white/5 rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-[#00BFA6] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("loading")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("successTitle")}</h2>
            <p className="text-gray-500 dark:text-white/50 mb-6">
              {t("successDescription")}
            </p>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-[#00BFA6] hover:bg-[#00908A] text-white font-bold py-3 rounded-xl">
                {t("login")}
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("errorTitle")}</h2>
            <p className="text-gray-500 dark:text-white/50 mb-6">
              {t("errorDescription")}
            </p>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full py-3 rounded-xl">
                {t("backHome")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivatePage() {
  const t = useTranslations("Auth.activate")
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-transparent flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-white/5 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-[#00BFA6] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("loading")}</h2>
            </div>
          </div>
        </div>
      }
    >
      <ActivatePageContent />
    </Suspense>
  )
}
