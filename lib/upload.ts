import * as ImageManipulator from "expo-image-manipulator";
import { decode } from "base64-arraybuffer";
import uuid from "react-native-uuid";

export async function compressImage(base64Uri: string, userId: string) {
  try {
    const compressedImage = await ImageManipulator.manipulateAsync(
      base64Uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    const fileName = `${userId}/${uuid.v4()}.jpg`;
    const arrayBuffer = decode(compressedImage.base64!);

    return { fileName, arrayBuffer };
  } catch (err) {
    console.error("Ошибка при попытке компресии");
    return null;
  }
}
