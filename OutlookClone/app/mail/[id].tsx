import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, MoreHorizontal, Trash2, Archive, ArrowLeft } from 'lucide-react-native'

export default function MailReadScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    subject?: string
    sender?: string
    initials?: string
    avatarColor?: string
    time?: string
  }>()

  const subject = params.subject ?? ''
  const sender = params.sender ?? ''
  const initials = (params.initials as string) || (sender ? sender[0] : '?')
  const avatarColor = (params.avatarColor as string) || '#16A34A'
  const time = (params.time as string) || ''

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Status Bar (custom/faux) */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTime}>12:37</Text>
            <View style={styles.playIcon} />
          </View>
          <View style={styles.statusRight}>
            <View style={styles.signalWrap}>
              <View style={[styles.signalBar, { opacity: 1 }]} />
              <View style={[styles.signalBar, { opacity: 1 }]} />
              <View style={[styles.signalBar, { opacity: 0.5 }]} />
              <View style={[styles.signalBar, { opacity: 0.5 }]} />
            </View>
            <View style={styles.eyeIcon} />
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>82</Text>
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity>
              <MoreHorizontal size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Trash2 size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Archive size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subject */}
        <View style={styles.subjectWrap}>
          <Text style={styles.subject} numberOfLines={2}>{subject}</Text>
        </View>

        {/* Sender Row */}
        <View style={styles.senderRow}>
          <View style={styles.senderLeft}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.senderName}>{sender}</Text>
              <Text style={styles.toText}>To You</Text>
            </View>
          </View>
          <View style={styles.senderRight}>
            {!!time && <Text style={styles.timeText}>{time}</Text>}
            <MoreHorizontal size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Email Content (placeholder) */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* No body text required per request */}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Reply Button (floating) */}
        <View style={styles.replyWrap}>
          <TouchableOpacity style={styles.replyBtn} activeOpacity={0.8}>
            <ArrowLeft size={20} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: {
    flex: 1,
    backgroundColor: '#000',
    maxWidth: 428,
    alignSelf: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusTime: { color: '#fff', fontSize: 14, fontWeight: '600', marginRight: 8 },
  playIcon: {
    width: 16,
    height: 16,
    borderLeftWidth: 8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
  },
  statusRight: { flexDirection: 'row', alignItems: 'center' },
  signalWrap: { flexDirection: 'row', marginRight: 8 },
  signalBar: {
    width: 3,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  eyeIcon: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  unreadBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1F2937',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', columnGap: 16 },
  subjectWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1F2937',
  },
  subject: { color: '#fff', fontSize: 18, fontWeight: '400' },
  senderRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  senderName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  toText: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  senderRight: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  timeText: { color: '#60A5FA', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  replyWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  replyText: { color: '#D1D5DB', fontSize: 16, marginLeft: 10 },
})
