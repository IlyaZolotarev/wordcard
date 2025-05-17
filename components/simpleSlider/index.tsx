import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

type Props = {
    min: number;
    max: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
};

const SimpleSlider = ({ min, max, defaultValue = min, onChange }: Props) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        onChange?.(value);
    }, [value]);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.value}>{value}</Text>
            <Slider
                style={styles.slider}
                minimumValue={min}
                maximumValue={max}
                step={1}
                value={value}
                onValueChange={setValue}
                minimumTrackTintColor="#000"
                maximumTrackTintColor="#000"
                thumbTintColor="#000"
            />
        </View>
    );
};

export default SimpleSlider;

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
    },
    slider: {
        width: 240,
        height: 40,
    },
    value: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
    },
});
