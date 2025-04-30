import { useState, useEffect, useMemo } from "react";
import {
    Modal,
    FlatList,
    TouchableOpacity,
    Text,
    View,
    TextInput,
    StyleSheet,
    Pressable,
    BackHandler,
} from "react-native";
import CountryFlag from "react-native-country-flag";

const countries = [
    { code: "us", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Deutschland" },
    { code: "UA", name: "Україна" },
    { code: "PL", name: "Polska" },
    { code: "IT", name: "Italia" },
    { code: "ES", name: "España" },
    { code: "JP", name: "日本" },
    { code: "CN", name: "中国" },
    { code: "KR", name: "대한민국" },
    { code: "BR", name: "Brasil" },
    { code: "AR", name: "Argentina" },
    { code: "CA", name: "Canada" },
    { code: "MX", name: "México" },
    { code: "IN", name: "भारत" },
    { code: "PT", name: "Portugal" },
    { code: "NL", name: "Nederland" },
    { code: "TR", name: "Türkiye" },
    { code: "SE", name: "Sverige" },
    { code: "FI", name: "Suomi" },
    { code: "NO", name: "Norge" },
    { code: "DK", name: "Danmark" },
    { code: "CH", name: "Schweiz" },
    { code: "BE", name: "België" },
    { code: "AT", name: "Österreich" },
    { code: "GR", name: "Ελλάδα" },
    { code: "TH", name: "ประเทศไทย" },
    { code: "VN", name: "Việt Nam" },
    { code: "ID", name: "Indonesia" },
    { code: "PH", name: "Pilipinas" },
    { code: "SA", name: "المملكة العربية السعودية" },
    { code: "AE", name: "الإمارات العربية المتحدة" },
    { code: "IL", name: "ישראל" },
    { code: "EG", name: "مصر" },
    { code: "RU", name: "Россия" },
    { code: "BY", name: "Беларусь" },
    { code: "KZ", name: "Қазақстан" },
    { code: "AU", name: "Australia" },
    { code: "NZ", name: "New Zealand" },
    { code: "ZA", name: "South Africa" },
];

interface Props {
    defaultCountryCode?: string;
    onSelect: (code: string) => void;
}

export default function CountrySelect({ defaultCountryCode = "US", onSelect }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selected, setSelected] = useState(
        countries.find((c) => c.code === defaultCountryCode) || countries[0]
    );

    const closeModal = () => setModalVisible(false);

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (modalVisible) {
                closeModal();
                return true;
            }
            return false;
        });

        return () => sub.remove();
    }, [modalVisible]);

    useEffect(() => {
        onSelect(defaultCountryCode)
    }, []);

    const filtered = useMemo(() => {
        return countries.filter(c =>
            c.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText]);

    const handleSelect = (country: typeof countries[0]) => {
        setSelected(country);
        onSelect(country.code);
        closeModal();
    };

    return (
        <View>
            <TouchableOpacity style={styles.selectWrapper} onPress={() => setModalVisible(true)}>
                <View style={styles.select}>
                    <CountryFlag isoCode={selected.code} size={16} />
                    <Text style={styles.arrow}>▼</Text>
                </View>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
                <Pressable style={styles.overlay} onPress={closeModal}>
                    <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.header}>
                            <TextInput
                                style={styles.search}
                                placeholder="Search country..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={styles.close}>×</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                                    <CountryFlag isoCode={item.code} size={20} />
                                    <Text style={styles.country}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    selectWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100
    }
    ,
    select: {
        flexDirection: "row",
        alignItems: "center",
        position: 'relative',
    },
    arrow: {
        position: 'absolute',
        right: -16,
        fontSize: 10,
        color: "#666",
        marginLeft: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: "#00000088",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "80%",
        maxHeight: "70%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    search: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    close: {
        fontSize: 26,
        marginLeft: 12,
        color: "#666",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
    },
    country: {
        marginLeft: 12,
        fontSize: 16,
        color: "#333",
    },
});
