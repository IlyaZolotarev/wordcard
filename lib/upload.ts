import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import uuid from "react-native-uuid";

export async function compressAndUploadImage(
  base64Uri: string,
  userId: string
) {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      base64Uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    const fileName = `${userId}/${uuid.v4()}.jpg`;
    const arrayBuffer = decode(manipResult.base64!);
    const { error } = await supabase.storage
      .from("cards")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data: signed } = await supabase.storage
      .from("cards")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    return signed?.signedUrl ?? null;
  } catch (err) {
    console.error("Ошибка при загрузке:", err);
    return null;
  }
}
