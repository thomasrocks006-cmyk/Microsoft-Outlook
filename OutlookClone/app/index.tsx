"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native"
import { Home, Bell, Search, Filter, Mail, Calendar, FileText, Grid3X3 } from "lucide-react-native"
import Svg, { Path, LinearGradient, Defs, Stop, Rect } from 'react-native-svg'
import { useRouter } from "expo-router"

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: string
  timestampMs: number
  avatar: string
  isUnread: boolean
  avatarColor: string
  body?: string
}

import { getAvailableMonths, loadMonth, type RawEmail } from "../utils/dataLoader"

const palette = ['#22c55e', '#ec4899', '#f59e0b', '#06b6d4', '#a78bfa']
const colorFor = (name: string) => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const formatListTimestamp = (ms: number) => {
  const d = new Date(ms)
  return dayNames[d.getDay()]
}
const formatDetailTime = (ms: number) => {
  const d = new Date(ms)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const PAGE_SIZE = 200

const Avatar = ({ children, backgroundColor }: { children: string; backgroundColor: string }) => (
  <View style={[styles.avatar, { backgroundColor }]}>
    <Text style={styles.avatarText}>{children}</Text>
  </View>
)

export default function OutlookMobile() {
  const [activeTab, setActiveTab] = useState("Focused")
  const [activeBottomTab, setActiveBottomTab] = useState("Email")
  const router = useRouter()
  const allMonths = useMemo(() => {
    // Sort months descending by year, then month number (from prefix MM_)
    const list = getAvailableMonths()
    const withNum = list.map(m => ({ ...m, ym: parseInt(`${m.year}${(m.monthKey.split('_')[0] || '00')}`, 10) }))
    withNum.sort((a, b) => b.ym - a.ym)
    return withNum.map(({ year, monthKey }) => ({ year, monthKey }))
  }, [])

  const monthCacheRef = useRef<Record<string, RawEmail[]>>({})
  const [monthPos, setMonthPos] = useState(0) // index in allMonths (descending)
  const [monthOffset, setMonthOffset] = useState(0) // how many consumed from current month (descending)
  const [emails, setEmails] = useState<Email[]>([])

  // Helper to get month data in descending timestamp order, with caching
  const getMonthDesc = (year: string, monthKey: string): RawEmail[] => {
    const key = `${year}/${monthKey}`
    let data = monthCacheRef.current[key]
    if (!data) {
      const m = loadMonth(year, monthKey) || []
      data = m.slice().sort((a, b) => b.timestamp - a.timestamp)
      monthCacheRef.current[key] = data
    }
    return data
  }

  const loadNextPage = () => {
    if (monthPos >= allMonths.length) return
    let added = 0
    const next: Email[] = []
    let pos = monthPos
    let offset = monthOffset

    while (added < PAGE_SIZE && pos < allMonths.length) {
      const { year, monthKey } = allMonths[pos]
      const desc = getMonthDesc(year, monthKey)
      const remaining = desc.length - offset
      if (remaining <= 0) {
        pos += 1
        offset = 0
        continue
      }
      const take = Math.min(PAGE_SIZE - added, remaining)
      const slice = desc.slice(offset, offset + take)
      for (const e of slice) {
        const preview = e.body.replace(/\s+/g, ' ').trim().slice(0, 90)
        const initials = (e.fromName || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
        next.push({
          id: e.id,
          sender: e.fromName,
          subject: e.subject,
          preview,
          timestamp: formatListTimestamp(e.timestamp),
          timestampMs: e.timestamp,
          avatar: initials,
          isUnread: !e.isRead,
          avatarColor: colorFor(e.fromName || 'Sender'),
          body: e.body,
        })
      }
      added += take
      offset += take
      if (offset >= desc.length) {
        pos += 1
        offset = 0
      }
    }

    if (next.length > 0) {
      setEmails(prev => [...prev, ...next])
      setMonthPos(pos)
      setMonthOffset(offset)
    }
  }

  useEffect(() => {
    if (emails.length === 0 && allMonths.length > 0) {
      loadNextPage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMonths.length])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.homeIcon}>
            <Home size={20} color="#000000" />
          </View>
          <Text style={styles.headerTitle}>Inbox</Text>
        </View>
        <View style={styles.headerRight}>
          <Bell size={24} color="#ffffff" />
          <Search size={24} color="#ffffff" />
        </View>
      </View>

  {/* Removed Month Selector per design */}

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            onPress={() => setActiveTab("Focused")}
            style={[styles.tabButton, activeTab === "Focused" ? styles.activeTabButton : styles.inactiveTabButton]}
          >
            <Text
              style={[styles.tabButtonText, activeTab === "Focused" ? styles.activeTabText : styles.inactiveTabText]}
            >
              Focused
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("Other")}
            style={[styles.tabButton, activeTab === "Other" ? styles.activeTabButton : styles.inactiveTabButton]}
          >
            <Text style={[styles.tabButtonText, activeTab === "Other" ? styles.activeTabText : styles.inactiveTabText]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color="#ffffff" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Email List */}
      <ScrollView style={styles.emailList}>
        {/* Other Emails Section */}
        <View style={styles.otherEmailsSection}>
          <View style={styles.otherEmailsContent}>
            <View style={styles.otherEmailsLeft}>
              <View style={styles.otherEmailsIcon}>
                <Mail size={20} color="#9ca3af" />
              </View>
              <View>
                <Text style={styles.otherEmailsTitle}>Other Emails</Text>
                <Text style={styles.otherEmailsSubtitle}>Jeremy Jaques, Apple News, Uber Receip...</Text>
              </View>
            </View>
            <Text style={styles.otherEmailsCount}>39</Text>
          </View>
        </View>

        {/* Last Week Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Last Week</Text>
        </View>

        {/* Last Week Emails */}
        <View>
          {emails.slice(0, 2).map((email) => (
            <TouchableOpacity
              key={email.id}
              style={styles.emailItem}
      onPress={() =>
                router.push({
                  pathname: '/mail/[id]',
                  params: {
                    id: email.id,
                    subject: email.subject,
                    sender: email.sender,
                    initials: email.avatar,
                    avatarColor: email.avatarColor,
        time: formatDetailTime(email.timestampMs || Date.now()),
        body: email.body || '',
                  },
                })
              }
            >
              <View style={styles.unreadIndicator}>{email.isUnread && <View style={styles.unreadDot} />}</View>
              <Avatar backgroundColor={email.avatarColor}>{email.avatar}</Avatar>
              <View style={styles.emailContent}>
                <View style={styles.emailHeader}>
                  <Text style={styles.emailSender}>{email.sender}</Text>
                  <Text style={styles.emailTimestamp}>{email.timestamp}</Text>
                </View>
                <Text style={styles.emailSubject} numberOfLines={1}>
                  {email.subject}
                </Text>
                <Text style={styles.emailPreview} numberOfLines={2}>
                  {email.preview}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* This Month Section */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionHeaderText}>This Month</Text>
        </View>

        {/* This Month Emails */}
        <View>
          {emails.slice(2).map((email) => (
            <TouchableOpacity
              key={email.id}
              style={styles.emailItem}
      onPress={() =>
                router.push({
                  pathname: '/mail/[id]',
                  params: {
                    id: email.id,
                    subject: email.subject,
                    sender: email.sender,
                    initials: email.avatar,
                    avatarColor: email.avatarColor,
        time: formatDetailTime(email.timestampMs || Date.now()),
        body: email.body || '',
                  },
                })
              }
            >
              <View style={styles.unreadIndicator}>{email.isUnread && <View style={styles.unreadDot} />}</View>
              <Avatar backgroundColor={email.avatarColor}>{email.avatar}</Avatar>
              <View style={styles.emailContent}>
                <View style={styles.emailHeader}>
                  <Text style={styles.emailSender}>{email.sender}</Text>
                  <Text style={styles.emailTimestamp}>{email.timestamp}</Text>
                </View>
                <Text style={styles.emailSubject} numberOfLines={1}>
                  {email.subject}
                </Text>
                <Text style={styles.emailPreview} numberOfLines={2}>
                  {email.preview}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Load more */}
        { (monthPos < allMonths.length || monthOffset > 0) && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={loadNextPage} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#111827' }}>
              <Text style={{ color: '#60a5fa', fontWeight: '600' }}>Load more conversations</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating New Email Widget (SVG gradient) */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.svgFloatingWidget}
          onPress={() => console.log('New Email clicked!')}
          activeOpacity={0.8}
        >
          <Svg style={StyleSheet.absoluteFill} height="100%" width="100%">
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#3A7BC8" />
                <Stop offset="100%" stopColor="#2B5AA0" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad)" rx="28" ry="28" />
          </Svg>

          <View style={styles.svgContentContainer}>
            <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.svgComposeIcon}>
              <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="black" strokeWidth="2.5" fill="none" />
              <Path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="black" strokeWidth="2.5" fill="none" />
            </Svg>
            <Text style={styles.svgEmailText}>New Email</Text>
            <View style={styles.svgSeparator} />
            <Svg width={16} height={16} viewBox="0 0 24 24" style={styles.svgArrowUp}>
              <Path d="m18 15-6-6-6 6" stroke="black" strokeWidth="2.5" fill="none" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <View style={styles.bottomNavigationContent}>
          <TouchableOpacity
            onPress={() => {
              setActiveBottomTab("Email")
              router.push("/")
            }}
            style={styles.bottomNavItem}
          >
            <Mail size={20} color={activeBottomTab === "Email" ? "#3b82f6" : "#9ca3af"} />
            <Text style={[styles.bottomNavText, { color: activeBottomTab === "Email" ? "#3b82f6" : "#9ca3af" }]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveBottomTab("Calendar")
              router.push("/calendar")
            }}
            style={styles.bottomNavItem}
          >
            <Calendar size={20} color={activeBottomTab === "Calendar" ? "#3b82f6" : "#9ca3af"} />
            <Text style={[styles.bottomNavText, { color: activeBottomTab === "Calendar" ? "#3b82f6" : "#9ca3af" }]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveBottomTab("Feed")} style={styles.bottomNavItem}>
            <FileText size={20} color={activeBottomTab === "Feed" ? "#3b82f6" : "#9ca3af"} />
            <Text style={[styles.bottomNavText, { color: activeBottomTab === "Feed" ? "#3b82f6" : "#9ca3af" }]}>
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveBottomTab("Apps")} style={styles.bottomNavItem}>
            <Grid3X3 size={20} color={activeBottomTab === "Apps" ? "#3b82f6" : "#9ca3af"} />
            <Text style={[styles.bottomNavText, { color: activeBottomTab === "Apps" ? "#3b82f6" : "#9ca3af" }]}>
              Apps
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1f2937",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  homeIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#ffffff",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2937',
    columnGap: 8,
  },
  monthArrow: {
    padding: 6,
    borderRadius: 999,
  },
  monthLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
    textAlign: 'center',
  },
  tabNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1f2937",
  },
  tabButtons: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#374151",
  },
  inactiveTabButton: {
    backgroundColor: "transparent",
  },
  tabButtonText: {
    fontSize: 14,
  },
  activeTabText: {
    color: "#ffffff",
  },
  inactiveTabText: {
    color: "#9ca3af",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterText: {
    color: "#ffffff",
    fontSize: 14,
  },
  emailList: {
    flex: 1,
  },
  otherEmailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  otherEmailsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  otherEmailsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  otherEmailsIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#374151",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  otherEmailsTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  otherEmailsSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  otherEmailsCount: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  emailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    marginTop: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  emailContent: {
    flex: 1,
    minWidth: 0,
  },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emailSender: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  emailTimestamp: {
    color: "#9ca3af",
    fontSize: 12,
  },
  emailSubject: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  emailPreview: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
  },
  floatingButtonContainer: {
    position: "absolute",
  bottom: 28,
  right: 20,
  zIndex: 10,
  },
  svgFloatingWidget: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 160,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  svgContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  svgComposeIcon: {
    flexShrink: 0,
  },
  svgEmailText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.16,
  },
  svgSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
    flexShrink: 0,
  },
  svgArrowUp: {
    flexShrink: 0,
  },
  bottomNavigation: {
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 8,
  zIndex: 1,
  },
  bottomNavigationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomNavItem: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomNavText: {
    fontSize: 12,
  },
  homeIndicatorContainer: {
    alignItems: "center",
    paddingVertical: 8,
  zIndex: 1,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    opacity: 0.6,
  },
})
