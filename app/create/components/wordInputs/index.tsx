import { useRef, useEffect } from "react"
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
} from "react-native"
import { triggerShake } from '@/lib/utils';
import { useStores } from "@/stores/storeContext"
import { useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite"
import { forwardRef, useImperativeHandle } from "react"

type wordInputsProps = {
    hasError: boolean
}

const WordInputs = forwardRef(({ hasError }: wordInputsProps, ref) => {
    const { createStore } = useStores()
    const { word: rawWord } = useLocalSearchParams();
    const initialWord = Array.isArray(rawWord) ? rawWord[0] : rawWord ?? "";
    const wordShake = useRef(new Animated.Value(0)).current
    const transShake = useRef(new Animated.Value(0)).current

    useEffect(() => {
        createStore.setWord(initialWord)
    }, [])

    useImperativeHandle(ref, () => ({
        shakeWord: () => triggerShake(wordShake),
        shakeTransWord: () => triggerShake(transShake),
    }))

    return (
        <View style={styles.base}>
            <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: wordShake }] }]}>
                <TextInput
                    placeholder="..."
                    value={createStore.word}
                    onChangeText={(text) => createStore.setWord(text)}
                    style={[styles.input, hasError && styles.inputError]}
                />
            </Animated.View>

            <TouchableOpacity onPress={createStore.swapWords} style={styles.swapBtn}>
                <Text style={styles.swapText}>⇄</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: transShake }] }]}>
                <TextInput
                    placeholder="..."
                    value={createStore.transWord}
                    onChangeText={(text) => createStore.setTransWord(text)}
                    style={styles.input}
                />
            </Animated.View>
        </View>
    )
})

export default observer(WordInputs)

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "transparent",
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center'
    },
    inputError: {
        borderColor: "red",
    },
    swapBtn: {
        paddingHorizontal: 8,
    },
    swapText: {
        fontSize: 26,
        color: "#555",
    },
})