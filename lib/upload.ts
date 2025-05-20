import * as ImageManipulator from "expo-image-manipulator";
import { decode } from "base64-arraybuffer";
import uuid from "react-native-uuid";
import * as FileSystem from "expo-file-system";

export const IMAGE_MODE = {
  UPLOAD: "upload",
  LOCAL: "local",
} as const;

export type Mode = (typeof IMAGE_MODE)[keyof typeof IMAGE_MODE];

export async function compressImage(
  base64Uri: string,
  mode: Mode,
  userId?: string
) {
  try {
    const isUpload = mode === "upload";

    const compressedImage = await ImageManipulator.manipulateAsync(
      base64Uri,
      [{ resize: { width: 800 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: isUpload,
      }
    );

    if (isUpload) {
      const fileName = `${userId}/${uuid.v4()}.jpg`;
      const arrayBuffer = decode(compressedImage.base64!);
      return { fileName, arrayBuffer };
    } else {
      const localFileName = `${uuid.v4()}.jpg`;
      const localPath = FileSystem.documentDirectory + localFileName;

      await FileSystem.copyAsync({
        from: compressedImage.uri,
        to: localPath,
      });

      return localPath;
    }
  } catch (err) {
    console.error("Ошибка при компрессии изображения", err);
    return null;
  }
}
