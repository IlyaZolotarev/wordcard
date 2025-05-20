import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"

export default function Index() {
    const { user } = useAuth()
    const [onboarded, setOnboarded] = useState<boolean>(false)

    useEffect(() => {
        AsyncStorage.getItem("onboarding_done").then((value) =>
            setOnboarded(value === "1")
        )
    }, [])

    if (!onboarded) return <Redirect href="/onboardingScreen" />
    return <Redirect href={user ? "/homeScreen" : "/loginScreen"} />
}
