import React, { useState } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, MoreHorizontal, Trash2, Archive, Mail, Calendar, FileText, Grid3X3 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { loadLatestMonth } from '../../utils/dataLoader'
const latest = loadLatestMonth()
const rawMonth = latest?.data || []

function getInitials(input?: string) {
  if (!input) return '?'
  const trimmed = input.trim()
  // If it looks like an email, take the first character of the local part
  if (trimmed.includes('@')) {
    return trimmed[0]?.toUpperCase() ?? '?'
  }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function MailReadScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeBottomTab, setActiveBottomTab] = useState<'Email' | 'Calendar' | 'Feed' | 'Apps'>('Email')

  const params = useLocalSearchParams<{
    subject?: string
    sender?: string
    initials?: string
    avatarColor?: string
    time?: string
    body?: string
    id?: string
  }>()

  const subject = params.subject?.trim() || '(No subject)'
  const sender = params.sender?.trim() || 'Unknown sender'
  const initials = (params.initials as string) || getInitials(sender)
  const avatarColor = (params.avatarColor as string) || '#16A34A'
  const time = (params.time as string) || ''
  const bodyParam = (params.body as string) || ''
  const idParam = (params.id as string) || ''
  const fallbackBody = idParam ? (rawMonth.find((e) => e.id === idParam)?.body ?? '') : ''
  const body = bodyParam || fallbackBody

  return (
    <SafeAreaView style={styles.safe}>
  <StatusBar hidden />
      <View style={[styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="More options"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={22} color="#E5E7EB" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Delete"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={22} color="#E5E7EB" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Archive"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Archive size={22} color="#E5E7EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subject */}
        <View style={styles.subjectWrap}>
          <Text style={styles.subject} numberOfLines={3}>
            {subject}
          </Text>
        </View>

        {/* Sender Row */}
        <View style={styles.senderRow}>
          <View style={styles.senderLeft}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.senderName} numberOfLines={1}>
                {sender}
              </Text>
              <Text style={styles.toText}>To you</Text>
            </View>
          </View>
          <View style={styles.senderRight}>
            {!!time && <Text style={styles.timeText}>{time}</Text>}
            <MoreHorizontal size={20} color="#9CA3AF" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Email Body */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 72, 72) }]}
          showsVerticalScrollIndicator={false}
        >
          {body ? (
            <Text style={styles.bodyText}>{body}</Text>
          ) : (
            <Text style={styles.bodyPlaceholder}>This message has no content.</Text>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <View style={styles.bottomNavigationContent}>
            <TouchableOpacity
              onPress={() => {
                setActiveBottomTab('Email')
                router.push('/')
              }}
              style={styles.bottomNavItem}
            >
              <Mail size={20} color={activeBottomTab === 'Email' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.bottomNavText, { color: activeBottomTab === 'Email' ? '#3b82f6' : '#9ca3af' }]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActiveBottomTab('Calendar')
                router.push('/calendar')
              }}
              style={styles.bottomNavItem}
            >
              <Calendar size={20} color={activeBottomTab === 'Calendar' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.bottomNavText, { color: activeBottomTab === 'Calendar' ? '#3b82f6' : '#9ca3af' }]}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveBottomTab('Feed')} style={styles.bottomNavItem}>
              <FileText size={20} color={activeBottomTab === 'Feed' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.bottomNavText, { color: activeBottomTab === 'Feed' ? '#3b82f6' : '#9ca3af' }]}>Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveBottomTab('Apps')} style={styles.bottomNavItem}>
              <Grid3X3 size={20} color={activeBottomTab === 'Apps' ? '#3b82f6' : '#9ca3af'} />
              <Text style={[styles.bottomNavText, { color: activeBottomTab === 'Apps' ? '#3b82f6' : '#9ca3af' }]}>Apps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
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
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1F2937',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', columnGap: 16 },

  // Subject
  subjectWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  subject: { color: '#fff', fontSize: 22, fontWeight: '600', lineHeight: 28 },

  // Sender
  senderRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  senderName: { color: '#fff', fontSize: 16, fontWeight: '600', maxWidth: 240 },
  toText: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  senderRight: { flexDirection: 'row', alignItems: 'center', columnGap: 8, marginLeft: 8 },
  timeText: { color: '#9CA3AF', fontSize: 12 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1F2937',
  },

  // Body
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  bodyText: { color: '#E5E7EB', fontSize: 15, lineHeight: 22 },
  bodyPlaceholder: { color: '#9CA3AF', fontSize: 14, fontStyle: 'italic' },

  // Reply removed

  // Bottom nav (copied from index for consistency)
  bottomNavigation: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1,
  },
  bottomNavigationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomNavItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomNavText: {
    fontSize: 12,
  },
  homeIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    opacity: 0.6,
  },
})