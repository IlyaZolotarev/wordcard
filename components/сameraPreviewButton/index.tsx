import React, { useRef, useState } from "react"
import { View, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { ActivityIndicator } from "react-native-paper"
import { BlurView } from "expo-blur"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system"
import uuid from "react-native-uuid";
type Props = {
    onPhoto: (uri: string) => void
}

export default function CameraPreviewButton({ onPhoto }: Props) {
    const [permission, requestPermission] = useCameraPermissions()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const cameraRef = useRef<any>(null)
    const [cameraReady, setCameraReady] = useState(false)

    if (!permission) return <ActivityIndicator />
    if (!permission.granted) {
        return (
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                <MaterialCommunityIcons name="camera" size={24} color="#000" />
            </TouchableOpacity>
        )
    }

    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: false })

                const fileName = `${uuid.v4()}.jpg`
                const newPath = FileSystem.documentDirectory + fileName

                await FileSystem.copyAsync({
                    from: photo.uri,
                    to: newPath,
                })

                onPhoto(newPath)
                setIsModalVisible(false)
            } catch (err) {
                console.warn("Ошибка при съёмке:", err)
            }
        }
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

            <Modal visible={isModalVisible} animationType="slide">
                <CameraView
                    ref={cameraRef}
                    style={styles.fullCamera}
                    facing="back"
                    onCameraReady={() => setCameraReady(true)}
                >
                    <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                        <MaterialCommunityIcons name="camera" size={28} color="#000" />
                    </TouchableOpacity>
                </CameraView>
            </Modal>
        </>
    )
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
    fullCamera: {
        flex: 1,
        justifyContent: "flex-end",
    },
    captureButton: {
        alignSelf: "center",
        marginBottom: 40,
        padding: 16,
        backgroundColor: "#ffffffaa",
        borderRadius: 10,
    },
})
