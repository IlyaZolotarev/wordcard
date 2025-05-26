import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { Redirect } from "expo-router"

export default function Index() {
    const [onboarded, setOnboarded] = useState<boolean>(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        AsyncStorage.getItem("onboarding_done").then((value) => {
            setOnboarded(value === "1")
            setChecking(false)
        })
    }, [])

    if (checking) return null;

    if (!onboarded) return <Redirect href="/onboardingScreen" />
    return <Redirect href={"/homeScreen"} />

}
