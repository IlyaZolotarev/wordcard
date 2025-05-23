import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    Animated,
} from "react-native";
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { triggerShake } from "@/lib/utils";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";
import CountrySelect from "@/components/countrySelect";

type WordInputsHandle = {
    shakeWord: () => void;
    shakeTransWord: () => void;
};

const WordInputs = forwardRef<WordInputsHandle>((_, ref) => {
    const { createStore, searchStore, userStore } = useStores();
    const wordShake = useRef(new Animated.Value(0)).current;
    const transShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        createStore.setWord(searchStore.searchText);
        return () => createStore.reset();
    }, []);

    useImperativeHandle(ref, () => ({
        shakeWord: () => triggerShake(wordShake),
        shakeTransWord: () => triggerShake(transShake),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.column}>
                <CountrySelect
                    disabled
                    defaultCountryCode={userStore.nativeLangCode}
                />
                <Animated.View
                    style={[
                        styles.inputWrapper,
                        { transform: [{ translateX: wordShake }] },
                    ]}
                >
                    <TextInput
                        value={createStore.word}
                        onChangeText={createStore.setWord}
                        placeholder="..."
                        style={styles.input}
                    />
                </Animated.View>
            </View>
            <TouchableOpacity onPress={createStore.swapWords}>
                <Text style={styles.swapText}>⇄</Text>
            </TouchableOpacity>
            <View style={styles.column}>
                <CountrySelect
                    disabled
                    defaultCountryCode={userStore.learnLangCode}
                />
                <Animated.View
                    style={[
                        styles.inputWrapper,
                        { transform: [{ translateX: transShake }] },
                    ]}
                >
                    <TextInput
                        value={createStore.transWord}
                        onChangeText={createStore.setTransWord}
                        placeholder="..."
                        style={styles.input}
                    />
                </Animated.View>
            </View>
        </View>
    );
});

export default observer(WordInputs);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    column: {
        alignItems: "center",
        flex: 1,
    },
    inputWrapper: {
        marginTop: 8,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        width: "90%",
    },
    input: {
        fontSize: 20,
        textAlign: "center",
        paddingVertical: 6,
    },
    swapText: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
});
