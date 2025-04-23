import React, { useState, useRef } from "react";
import { TouchableOpacity, StyleSheet, Modal, View } from "react-native";
import { CameraView } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import uuid from "react-native-uuid";

type cameraModalProps = {
    visible: boolean;
    onTakePicture: (imageUri: string) => void;
    onClose: () => void;
};

const CameraModal = ({ visible, onClose, onTakePicture }: cameraModalProps) => {
    const cameraRef = useRef<any>(null);
    const [facing, setFacing] = useState<"back" | "front">("back");
    const [cameraReady, setCameraReady] = useState(false);

    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    base64: false,
                });
                const fileName = `${uuid.v4()}.jpg`;
                const newPath = FileSystem.documentDirectory + fileName;

                await FileSystem.copyAsync({
                    from: photo.uri,
                    to: newPath,
                });

                onTakePicture(newPath);
                onClose();
            } catch (err) {
                console.warn("Ошибка при съёмке:", err);
            }
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <CameraView
                ref={cameraRef}
                style={styles.fullCamera}
                facing={facing}
                onCameraReady={() => setCameraReady(true)}
            >
                <View style={styles.bottomControls}>
                    <TouchableOpacity
                        onPress={() =>
                            setFacing((prev) => (prev === "back" ? "front" : "back"))
                        }
                        style={styles.controlButton}
                    >
                        <MaterialCommunityIcons
                            name="camera-retake-outline"
                            size={28}
                            color="#000"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                        <MaterialCommunityIcons name="camera" size={28} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                        <MaterialCommunityIcons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </Modal>
    );
};

export default CameraModal;

const styles = StyleSheet.create({
    fullCamera: {
        flex: 1,
        justifyContent: "flex-end",
    },
    bottomControls: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    captureButton: {
        padding: 16,
        backgroundColor: "#ffffffaa",
        borderRadius: 40,
    },
    controlButton: {
        padding: 12,
        backgroundColor: "#ffffffaa",
        borderRadius: 10,
    },
});
