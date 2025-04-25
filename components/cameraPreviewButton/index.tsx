import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CameraPreviewButton() {
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();

    if (!permission) return <ActivityIndicator />;
    if (!permission.granted) {
        return (
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                <MaterialCommunityIcons name="camera" size={24} color="#000" />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={() => router.push("/camera")} style={styles.previewContainer}>
            <CameraView style={StyleSheet.absoluteFill} facing="back" />
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
                <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons name="camera-outline" size={36} color="#fff" />
                </View>
            </BlurView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    permissionButton: {
        backgroundColor: "#ddd",
        padding: 20,
        alignItems: "center",
        borderRadius: 10,
    },
    previewContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        maxHeight: 200,
        borderRadius: 12,
        overflow: "hidden",
    },
    iconWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
