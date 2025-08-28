import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from "react-native"
import { useRouter } from "expo-router"

// Icon components (you'll need to install react-native-vector-icons or similar)
const MenuIcon = () => <Text style={styles.icon}>☰</Text>
const SearchIcon = () => <Text style={styles.icon}>🔍</Text>
const CalendarIcon = () => <Text style={styles.icon}>📅</Text>
const MailIcon = () => <Text style={styles.icon}>✉️</Text>
const FileIcon = () => <Text style={styles.icon}>📄</Text>
const GridIcon = () => <Text style={styles.icon}>⊞</Text>
const PlusIcon = () => <Text style={styles.icon}>+</Text>
const ChevronUpIcon = () => <Text style={styles.icon}>⌃</Text>

export default function CalendarApp() {
  const router = useRouter()
  const currentDate = new Date(2024, 7, 28) // August 28, 2024

  const calendarDays = [
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true, isToday: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
  ]

  const upcomingDays = [
    { label: "Today • Thursday, 28 August", isToday: true },
    { label: "Tomorrow • Friday, 29 August", isToday: false },
    { label: "Saturday, 30 August", isToday: false },
    { label: "Sunday, 31 August", isToday: false },
    { label: "Monday, 1 September", isToday: false },
    { label: "Tuesday, 2 September", isToday: false },
    { label: "Wednesday, 3 September", isToday: false },
    { label: "Thursday, 4 September", isToday: false },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.calendarIconContainer}>
              <CalendarIcon />
            </View>
            <Text style={styles.headerTitle}>August</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <MenuIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <SearchIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subtle grey divider bar below header */}
        <View style={styles.headerDivider} />
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day headers */}
        <View style={styles.dayHeadersContainer}>
          {["M", "Tu", "W", "Th", "F", "Sa", "Su"].map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.calendarDaysContainer}>
          {calendarDays.map((date, index) => (
            <View key={index} style={styles.calendarDayWrapper}>
              <View style={[styles.calendarDay, date.isToday && styles.todayCircle]}>
                <Text style={[styles.calendarDayText, date.isToday && styles.todayText]}>{date.day}</Text>
              </View>
              {date.isToday && <View style={styles.todayIndicator} />}
            </View>
          ))}
        </View>
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsList}>
        {upcomingDays.map((day, index) => (
          <View key={index} style={[styles.eventRow, { backgroundColor: index % 2 === 0 ? "#000000" : "#1f2937" }]}>
            <Text style={[styles.eventLabel, { color: day.isToday ? "#d1d5db" : "#9ca3af" }]}>{day.label}</Text>
            <Text style={styles.eventText}>No events</Text>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <View style={styles.fab}>
          <PlusIcon />
          <ChevronUpIcon />
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavContent}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/")}>
            <MailIcon />
            <Text style={styles.navItemTextInactive}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <CalendarIcon />
            <Text style={styles.navItemTextActive}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FileIcon />
            <Text style={styles.navItemTextInactive}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <GridIcon />
            <Text style={styles.navItemTextInactive}>Apps</Text>
          </TouchableOpacity>
        </View>

        {/* Home indicator */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
        </View>
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
    backgroundColor: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calendarIconContainer: {
    width: 32,
    height: 32,
  backgroundColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "white",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerDivider: {
    marginTop: 8,
    height: 2,
    backgroundColor: "#374151",
    borderRadius: 1,
  },
  calendarContainer: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dayHeadersContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayHeaderText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  calendarDaysContainer: {
    flexDirection: "row",
  },
  calendarDayWrapper: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  calendarDay: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    backgroundColor: "#374151",
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  todayText: {
    color: "white",
  },
  todayIndicator: {
    position: "absolute",
    bottom: -4,
    width: 24,
    height: 2,
    backgroundColor: "#374151",
    borderRadius: 1,
  },
  eventsList: {
    flex: 1,
  },
  eventRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  eventText: {
    color: "#6b7280",
    fontSize: 14,
  },
  fabContainer: {
    position: "absolute",
    bottom: 96,
    right: 16,
  },
  fab: {
    backgroundColor: "#374151",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottomNavContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  navItemTextActive: {
    fontSize: 12,
    color: "#d1d5db",
  },
  navItemTextInactive: {
    fontSize: 12,
    color: "#6b7280",
  },
  homeIndicatorContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
  },
  icon: {
    fontSize: 20,
    color: "white",
  },
})
