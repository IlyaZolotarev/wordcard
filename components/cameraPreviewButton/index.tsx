import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CameraModal from "@/components/cameraModal";

type Props = {
    onPhoto: (uri: string) => void;
};

export default function CameraPreviewButton({ onPhoto }: Props) {
    const [permission, requestPermission] = useCameraPermissions();
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (isModalVisible) {
                setIsModalVisible(false);
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [isModalVisible]);

    if (!permission) return <ActivityIndicator />;
    if (!permission.granted) {
        return (
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                <MaterialCommunityIcons name="camera" size={24} color="#000" />
            </TouchableOpacity>
        );
    }

    return (
        <>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.previewContainer}>
                <CameraView style={StyleSheet.absoluteFill} facing="back" />
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.iconWrapper}>
                        <MaterialCommunityIcons name="camera-outline" size={36} color="#fff" />
                    </View>
                </BlurView>
            </TouchableOpacity>

            <CameraModal
                visible={isModalVisible}
                onTakePicture={onPhoto}
                onClose={() => setIsModalVisible(false)}
            />
        </>
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
