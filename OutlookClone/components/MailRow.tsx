import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { colors, spacing, type } from "../theme/tokens";

export type MailItem = {
  id: string; from: string; subject: string; preview: string; time: string;
  unread?: boolean; avatarUri?: string; initials?: string;
};

const Action = ({ label, bg }: { label: string; bg: string }) => (
  <View style={[styles.action, { backgroundColor: bg }]}> 
    <Text style={styles.actionText}>{label}</Text>
  </View>
);

export default function MailRow({ item, onPress, onArchive, onDelete }:{
  item: MailItem; onPress?:()=>void; onArchive?:()=>void; onDelete?:()=>void;
}) {
  return (
    <Swipeable
      overshootLeft={false} overshootRight={false}
      leftThreshold={28} rightThreshold={28}
      renderLeftActions={() => (
        <View style={{ width: 180, flexDirection: "row" }}>
          <Action label="Archive" bg="#2EAE4E" />
          <Action label="Flag" bg="#F6C751" />
        </View>
      )}
      renderRightActions={() => (
        <View style={{ width: 90, alignItems: "flex-end" }}>
          <Action label="Delete" bg="#D92D20" />
        </View>
      )}
      onSwipeableLeftOpen={onArchive}
      onSwipeableRightOpen={onDelete}
    >
      <Pressable onPress={onPress} style={styles.row}>
        {item.unread ? <View style={styles.bullet} /> : <View style={{ width: 8, marginRight: spacing(1.5) }} />}
        <View style={styles.avatar}>
          {item.avatarUri
            ? <Image source={{ uri: item.avatarUri }} style={StyleSheet.absoluteFill} />
            : <Text style={styles.initials}>{item.initials || "?"}</Text>}
        </View>
        <View style={styles.center}>
          <View style={styles.top}>
            <Text numberOfLines={1} style={[styles.from, item.unread && styles.fromUnread]}>{item.from}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text numberOfLines={1} style={styles.subject}>{item.subject}</Text>
          <Text numberOfLines={1} style={styles.preview}>{item.preview}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    alignItems: "center",
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    backgroundColor: colors.bg,
  },
  bullet: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.unreadDot, marginRight: spacing(1.5),
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#E3EAF5",
    alignItems: "center", justifyContent: "center", marginRight: spacing(1.5),
  },
  initials: { color: "#333", fontWeight: "700" },
  center: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  from: { flex: 1, fontSize: type.body, color: colors.text, fontWeight: "600" },
  fromUnread: { fontWeight: "800" },
  time: { marginLeft: spacing(1), color: colors.subtext, fontSize: type.small },
  subject: { color: colors.text, fontSize: type.body, marginBottom: 2 },
  preview: { color: colors.subtext, fontSize: type.small },
  action: { flex: 1, alignItems: "center", justifyContent: "center" },
  actionText: { color: "#fff", fontWeight: "700" },
});
