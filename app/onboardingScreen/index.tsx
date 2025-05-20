import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, BackHandler, StyleSheet } from "react-native"
import CountrySelect from "@/components/countrySelect"
import { router } from "expo-router"
import * as Localization from "expo-localization"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

export default function OnboardingScreen() {
    const [step, setStep] = useState(0)
    const [nativeLang, setNativeLang] = useState<string | null>(null)
    const [learnLang, setLearnLang] = useState("FR")

    useEffect(() => {
        const locales = Localization.getLocales()
        const countryFromLocale = locales?.[0]?.languageCode?.toUpperCase() || "US"
        setNativeLang(countryFromLocale)
    }, [])

    useEffect(() => {
        const handleBackPress = () => {
            if (step === 1) {
                setStep(0)
                return true
            }
            return false
        }
        const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress)
        return () => subscription.remove()
    }, [step])

    const next = async () => {
        if (step === 1 && nativeLang && learnLang) {
            await AsyncStorage.setItem("onboarding_done", "1")
            router.replace("/homeScreen")
        } else {
            setStep((s) => s + 1)
        }
    }

    const prev = () => {
        if (step > 0) setStep((s) => s - 1)
    }

    const title = step === 0
        ? "Выберите язык, на котором вы говорите"
        : "Выберите язык, который хотите выучить"
    console.log(step === 0 ? nativeLang : learnLang)
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                {step === 0
                    ? <MaterialIcons name="record-voice-over" size={32} />
                    : <MaterialIcons name="school" size={32} />
                }
            </View>

            <Text style={styles.title}>{title}</Text>

            {nativeLang && (
                <CountrySelect
                    defaultCountryCode={step === 0 ? nativeLang : learnLang}
                    onSelect={(val) => step === 0 ? setNativeLang(val) : setLearnLang(val)}
                />
            )}

            <View style={[styles.actions, step === 0 ? styles.actionsOneButton : null]}>
                {step > 0 && (
                    <TouchableOpacity hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }} onPress={prev} style={styles.leftIcon}>
                        <Ionicons name="chevron-back" size={28} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }} onPress={next} style={styles.rightIcon}>
                    {step === 1
                        ? <Ionicons name="checkmark" size={28} />
                        : <Ionicons name="chevron-forward" size={28} />
                    }
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center"
    },
    iconWrapper: {
        alignItems: "center",
        marginBottom: 10
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: "center"
    },
    actions: {
        flexDirection: "row",
        marginTop: 30,
        paddingHorizontal: 20,
    },
    actionsOneButton: {
        justifyContent: "flex-end"
    },
    leftIcon: {
        marginRight: "auto"
    },
    rightIcon: {
        marginLeft: "auto"
    }
})
