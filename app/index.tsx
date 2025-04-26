import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"

export default function Index() {
    const { user } = useAuth()
    return <Redirect href={user ? "/homeScreen" : "/loginScreen"} />
}