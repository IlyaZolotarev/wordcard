import { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import uuid from "react-native-uuid";
import { useStores } from "@/stores/storeContext";
import { observer } from "mobx-react-lite";

const CameraScreen = () => {
    const { searchStore } = useStores();
    const cameraRef = useRef<any>(null);
    const [facing, setFacing] = useState<"back" | "front">("back");
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraReallyReady, setCameraReallyReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFacing("front");
            setTimeout(() => setFacing("back"), 100);
        }, 300);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (cameraReady) {
            const timeout = setTimeout(() => {
                setCameraReallyReady(true);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [cameraReady]);

    const onTakePicture = async () => {
        if (cameraRef.current && cameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: false });
                const fileName = `${uuid.v4()}.jpg`;
                const newPath = FileSystem.documentDirectory + fileName;

                await FileSystem.copyAsync({
                    from: photo.uri,
                    to: newPath,
                });
                searchStore.setImageUrl(newPath);
                router.replace("/create");
            } catch (err) {
                console.warn("Ошибка при съёмке:", err);
            }
        }
    };

    return (
        <View style={styles.container}>
            {!cameraReallyReady && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}

            <CameraView
                ref={cameraRef}
                style={styles.fullCamera}
                facing={facing}
                onCameraReady={() => setCameraReady(true)}
            >
                {cameraReady && (
                    <View style={styles.bottomControls}>
                        <TouchableOpacity
                            onPress={() => setFacing(prev => (prev === "back" ? "front" : "back"))}
                            style={styles.controlButton}
                        >
                            <MaterialCommunityIcons name="camera-retake-outline" size={28} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onTakePicture} style={styles.captureButton}>
                            <MaterialCommunityIcons name="camera" size={28} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} style={styles.controlButton}>
                            <MaterialCommunityIcons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </CameraView>
        </View>
    );
};

export default observer(CameraScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
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
