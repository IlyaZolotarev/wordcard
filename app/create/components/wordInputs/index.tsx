import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
} from "react-native";
import { triggerShake } from "@/lib/utils";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";

type WordInputsHandle = {
    shakeWord: () => void;
    shakeTransWord: () => void;
};

const WordInputs = forwardRef<WordInputsHandle>((_, ref) => {
    const { createStore, searchStore } = useStores();
    const wordInputShake = useRef(new Animated.Value(0)).current;
    const transWordInputShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        createStore.setWord(searchStore.searchText);

        return () => {
            createStore.reset()
        }
    }, []);

    useImperativeHandle(ref, () => ({
        shakeWord: () => triggerShake(wordInputShake),
        shakeTransWord: () => triggerShake(transWordInputShake),
    }));

    return (
        <View style={styles.base}>
            <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: wordInputShake }] }]}>
                <TextInput
                    placeholder="..."
                    value={createStore.word}
                    onChangeText={(text) => createStore.setWord(text)}
                    style={styles.input}
                />
            </Animated.View>

            <TouchableOpacity onPress={createStore.swapWords} style={styles.swapBtn}>
                <Text style={styles.swapText}>⇄</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: transWordInputShake }] }]}>
                <TextInput
                    placeholder="..."
                    value={createStore.transWord}
                    onChangeText={(text) => createStore.setTransWord(text)}
                    style={styles.input}
                />
            </Animated.View>
        </View>
    );
});

export default observer(WordInputs);


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
    swapBtn: {
        paddingHorizontal: 8,
    },
    swapText: {
        fontSize: 26,
        color: "#555",
    },
})