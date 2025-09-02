"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { Home, Bell, Search, Filter, Mail, Calendar, FileText, Grid3X3 } from 'lucide-react-native'
import Svg, { Path, LinearGradient, Defs, Stop, Rect } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { useNavigation } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { getAvailableMonths, loadMonth, type RawEmail } from '../utils/dataLoader'
import { formatRightCell } from './dateBuckets'
import dayjs from 'dayjs'

interface Email { id: string; sender: string; subject: string; preview: string; timestamp: string; timestampMs: number; avatar: string; isUnread: boolean; avatarColor: string; body?: string; labels: string[]; attachments?: number; threadId?: string }
interface ThreadedEmail extends Email { threadCount: number; anyUnread: boolean; latestTimestamp: number }

const palette = ['#22c55e','#ec4899','#f59e0b','#06b6d4','#a78bfa']
const colorFor = (name: string) => { let h=0; for (let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0; return palette[h%palette.length] }
const pad2 = (n:number)=> n<10?`0${n}`:`${n}`
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const formatListTimestamp = (ms:number)=> dayNames[new Date(ms).getDay()]
const PAGE_SIZE = 200
const formatDetailTime = (ms:number)=>{ const d=new Date(ms); return new Intl.DateTimeFormat('en-AU',{hour:'numeric',minute:'2-digit'}).format(d) }

const Avatar = ({children, backgroundColor}:{children:string;backgroundColor:string}) => (
  <View style={[styles.avatar,{backgroundColor}]}> 
    <Text style={styles.avatarText}>{children}</Text>
  </View>
)

export default function OutlookMobile(){
  const [activeTab,setActiveTab]=useState('Focused')
  const [activeBottomTab,setActiveBottomTab]=useState('Email')
  const router=useRouter()
  const navigation = useNavigation()
  const allMonths=useMemo(()=>{ 
    const monthNum=(mk:string)=>{ const part=mk.split('_')[0]; return parseInt(part,10)||0 };
    const list=getAvailableMonths();
    return list.sort((a,b)=>{ 
      if(a.year===b.year) return monthNum(b.monthKey)-monthNum(a.monthKey); 
      return parseInt(b.year,10)-parseInt(a.year,10); 
    });
  },[])
  const monthCacheRef=useRef<Record<string,RawEmail[]>>({})
  const [monthPos,setMonthPos]=useState(0)
  const [monthOffset,setMonthOffset]=useState(0)
  const [emails,setEmails]=useState<Email[]>([])

  const nowTs=Date.now()
  const getMonthDesc=(year:string,monthKey:string)=>{const key=`${year}/${monthKey}`;let data=monthCacheRef.current[key];if(!data){const m=loadMonth(year,monthKey)||[];data=m.filter(e=>e.timestamp<=nowTs).slice().sort((a,b)=>b.timestamp-a.timestamp);monthCacheRef.current[key]=data}return data}

  const loadNextPage=()=>{ if(monthPos>=allMonths.length) return; let added=0; const next:Email[]=[]; let pos=monthPos; let offset=monthOffset; while(added<PAGE_SIZE && pos<allMonths.length){ const {year,monthKey}=allMonths[pos]; const desc=getMonthDesc(year,monthKey); const remaining=desc.length-offset; if(remaining<=0){pos++; offset=0; continue} const take=Math.min(PAGE_SIZE-added,remaining); const slice=desc.slice(offset,offset+take); for(const e of slice){ const preview=e.body.replace(/\s+/g,' ').trim().slice(0,90); const initials=(e.fromName||'?').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase(); next.push({ id:e.id, sender:e.fromName, subject:e.subject, preview, timestamp:formatListTimestamp(e.timestamp), timestampMs:e.timestamp, avatar:initials, isUnread:!e.isRead, avatarColor:colorFor(e.fromName||'Sender'), body:e.body, labels:e.labels||[], attachments:(e.attachments&&e.attachments.length)||0, threadId:e.threadId }) } added+=take; offset+=take; if(offset>=desc.length){pos++; offset=0} } if(next.length){ setEmails(p=>[...p,...next]); setMonthPos(pos); setMonthOffset(offset);} }

  useEffect(()=>{ if(!emails.length && allMonths.length) loadNextPage() },[allMonths.length])

  const displayedEmails:ThreadedEmail[]=useMemo(()=>{ 
    const map:Record<string,ThreadedEmail>={};
    for(const e of emails){
      const key=e.threadId||e.id;
      const existing=map[key];
      if(!existing){
        map[key]={...e,threadCount:1,anyUnread:e.isUnread,latestTimestamp:e.timestampMs};
      }else{
        existing.threadCount++;
        if(e.timestampMs>existing.latestTimestamp){
          if(e.subject.startsWith('RE:')||e.subject.startsWith('Fw:')) existing.subject=e.subject;
          existing.preview=e.preview;
          existing.sender=e.sender;
          existing.latestTimestamp=e.timestampMs;
          existing.timestampMs=e.timestampMs;
          existing.body=e.body;
          existing.avatar=e.avatar;
          existing.avatarColor=e.avatarColor;
          existing.isUnread=e.isUnread;
        }
        existing.anyUnread=existing.anyUnread||e.isUnread;
      }
    }
    const arr=Object.values(map);
    arr.sort((a,b)=> b.latestTimestamp - a.latestTimestamp);
    arr.forEach(t=>{ t.timestamp = formatRightCell(new Date(t.latestTimestamp).toISOString()); });
    return arr;
  },[emails])

  // Build dynamic date sections (Today / Yesterday / Last 7 Days / Current Month / Older)
  const sections=useMemo(()=>{
    const now=dayjs();
    const startToday=now.startOf('day');
    const startYesterday=startToday.subtract(1,'day');
    const start7=startToday.subtract(7,'day');
    const startMonth=now.startOf('month');
    const groups:{[k:string]:ThreadedEmail[]}={today:[],yesterday:[],last7:[],month:[],older:[]};
    displayedEmails.forEach(e=>{ const d=dayjs(e.latestTimestamp); if(d.isSame(startToday,'day')||d.isAfter(startToday)) groups.today.push(e); else if(d.isAfter(startYesterday)) groups.yesterday.push(e); else if(d.isAfter(start7)) groups.last7.push(e); else if(d.isAfter(startMonth)) groups.month.push(e); else groups.older.push(e); });
    const ordered:{title:string;data:ThreadedEmail[]}[]=[];
    if(groups.today.length) ordered.push({title:'Today',data:groups.today});
    if(groups.yesterday.length) ordered.push({title:'Yesterday',data:groups.yesterday});
    if(groups.last7.length) ordered.push({title:'Last 7 Days',data:groups.last7});
    if(groups.month.length) ordered.push({title:now.format('MMMM'),data:groups.month});
    if(groups.older.length) ordered.push({title:'Older',data:groups.older});
    return ordered;
  },[displayedEmails])

  const badgeFor=(e:ThreadedEmail)=>{ const out:string[]=[]; if(e.threadCount>1) out.push(`${e.threadCount} msgs`); if(e.labels.includes('calendar-invite')) out.push('Calendar'); if(e.labels.includes('junk')) out.push('Spam'); if(e.labels.includes('internal-system')) out.push('System'); if(e.labels.includes('internal-ooo')) out.push('OOO'); if(e.labels.includes('internal-payments')) out.push('Payments'); if(e.labels.includes('external-personal')) out.push('Personal'); if(e.subject.startsWith('Fw:')) out.push('Fwd'); if(e.subject.startsWith('RE:')) out.push('Reply'); if((e.attachments||0)>0) out.push('Att'); return out }

  const renderRow=(email:ThreadedEmail)=>{ const badges=badgeFor(email); return (
    <TouchableOpacity key={email.id} style={styles.emailItem} onPress={()=>router.push({pathname:'/mail/[id]',params:{id:email.id,subject:email.subject,sender:email.sender,initials:email.avatar,avatarColor:email.avatarColor,time:formatDetailTime(email.timestampMs),body:email.body||''}})}>
      <View style={styles.unreadIndicator}>{(email.anyUnread||email.isUnread)&&<View style={styles.unreadDot} />}</View>
      <Avatar backgroundColor={email.avatarColor}>{email.avatar}</Avatar>
      <View style={styles.emailContent}>
        <View style={styles.emailHeader}>
          <Text style={styles.emailSender}>{email.sender}</Text>
          <Text style={styles.emailTimestamp}>{email.timestamp}</Text>
        </View>
        <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
        <Text style={styles.emailPreview} numberOfLines={2}>{email.preview}</Text>
        {!!badges.length && <View style={styles.badgeRow}>{badges.map(b=> <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>)}</View>}
      </View>
    </TouchableOpacity>
  ) }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.homeIcon} onPress={()=> navigation?.dispatch?.(DrawerActions.openDrawer())}>
            <Home size={20} color='#000000' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
        </View>
        <View style={styles.headerRight}>
          <Bell size={24} color='#ffffff' />
          <Search size={24} color='#ffffff' />
        </View>
      </View>
      <View style={styles.tabNavigation}>
        <View style={styles.tabButtons}>
          <TouchableOpacity onPress={()=>setActiveTab('Focused')} style={[styles.tabButton, activeTab==='Focused'?styles.activeTabButton:styles.inactiveTabButton]}><Text style={[styles.tabButtonText, activeTab==='Focused'?styles.activeTabText:styles.inactiveTabText]}>Focused</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>setActiveTab('Other')} style={[styles.tabButton, activeTab==='Other'?styles.activeTabButton:styles.inactiveTabButton]}><Text style={[styles.tabButtonText, activeTab==='Other'?styles.activeTabText:styles.inactiveTabText]}>Other</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterButton}><Filter size={16} color='#ffffff' /><Text style={styles.filterText}>Filter</Text></TouchableOpacity>
      </View>
      <ScrollView style={styles.emailList}>
        <View style={styles.otherEmailsSection}>
          <View style={styles.otherEmailsContent}>
            <View style={styles.otherEmailsLeft}>
              <View style={styles.otherEmailsIcon}><Mail size={20} color='#9ca3af' /></View>
              <View>
                <Text style={styles.otherEmailsTitle}>Other Emails</Text>
                <Text style={styles.otherEmailsSubtitle}>Auto-collated non-focused senders</Text>
              </View>
            </View>
            <Text style={styles.otherEmailsCount}>{displayedEmails.length}</Text>
          </View>
        </View>
        {sections.map(sec=> (
          <View key={sec.title}>
            <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>{sec.title}</Text></View>
            <View>{sec.data.map(renderRow)}</View>
          </View>
        ))}
        {(monthPos < allMonths.length || monthOffset > 0) && (
          <View style={{padding:16,alignItems:'center'}}>
            <TouchableOpacity onPress={loadNextPage} style={{paddingVertical:10,paddingHorizontal:16,borderRadius:20,backgroundColor:'#111827'}}><Text style={{color:'#60a5fa',fontWeight:'600'}}>Load more conversations</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* Floating Email Button - moved up and made smaller */}
      <View style={[styles.floatingButtonContainer, { bottom: 80, right: 24 }]}> 
        <TouchableOpacity style={[styles.svgFloatingWidget, { minWidth: 56, height: 56, paddingHorizontal: 0, paddingVertical: 0 }]} onPress={()=>{}} activeOpacity={0.8}>
          <Svg style={StyleSheet.absoluteFill} height='100%' width='100%'>
            <Defs><LinearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><Stop offset='0%' stopColor='#3A7BC8'/><Stop offset='100%' stopColor='#2B5AA0'/></LinearGradient></Defs>
            <Rect width='100%' height='100%' fill='url(#grad)' rx='28' ry='28' />
          </Svg>
          <View style={[styles.svgContentContainer, { justifyContent: 'center' }]}> 
            <Svg width={24} height={24} viewBox='0 0 24 24' style={styles.svgComposeIcon}><Path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' stroke='black' strokeWidth='2.5' fill='none'/><Path d='m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z' stroke='black' strokeWidth='2.5' fill='none'/></Svg>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNavigation}>
        <View style={styles.bottomNavigationContent}>
          <TouchableOpacity onPress={()=>{setActiveBottomTab('Email'); router.push('/')}} style={styles.bottomNavItem}><Mail size={20} color={activeBottomTab==='Email'?'#3b82f6':'#9ca3af'} /><Text style={[styles.bottomNavText,{color:activeBottomTab==='Email'?'#3b82f6':'#9ca3af'}]}>Email</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>{setActiveBottomTab('Calendar'); router.push('/calendar')}} style={styles.bottomNavItem}><Calendar size={20} color={activeBottomTab==='Calendar'?'#3b82f6':'#9ca3af'} /><Text style={[styles.bottomNavText,{color:activeBottomTab==='Calendar'?'#3b82f6':'#9ca3af'}]}>Calendar</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setActiveBottomTab('Feed')} style={styles.bottomNavItem}><FileText size={20} color={activeBottomTab==='Feed'?'#3b82f6':'#9ca3af'} /><Text style={[styles.bottomNavText,{color:activeBottomTab==='Feed'?'#3b82f6':'#9ca3af'}]}>Feed</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setActiveBottomTab('Apps')} style={styles.bottomNavItem}><Grid3X3 size={20} color={activeBottomTab==='Apps'?'#3b82f6':'#9ca3af'} /><Text style={[styles.bottomNavText,{color:activeBottomTab==='Apps'?'#3b82f6':'#9ca3af'}]}>Apps</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.homeIndicatorContainer}><View style={styles.homeIndicator} /></View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#1f2937' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  homeIcon: { width: 32, height: 32, backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '500', color: '#ffffff' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  tabNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1f2937' },
  tabButtons: { flexDirection: 'row', gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  activeTabButton: { backgroundColor: '#374151' },
  inactiveTabButton: { backgroundColor: 'transparent' },
  tabButtonText: { fontSize: 14 },
  activeTabText: { color: '#ffffff' },
  inactiveTabText: { color: '#9ca3af' },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterText: { color: '#ffffff', fontSize: 14 },
  emailList: { flex: 1 },
  otherEmailsSection: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  otherEmailsContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  otherEmailsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  otherEmailsIcon: { width: 40, height: 40, backgroundColor: '#374151', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  otherEmailsTitle: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  otherEmailsSubtitle: { color: '#9ca3af', fontSize: 14 },
  otherEmailsCount: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionHeaderText: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },
  emailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  unreadIndicator: { width: 8, height: 8, marginTop: 16 },
  unreadDot: { width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  emailContent: { flex: 1, minWidth: 0 },
  emailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  emailSender: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  emailTimestamp: { color: '#9ca3af', fontSize: 12 },
  emailSubject: { color: '#ffffff', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  emailPreview: { color: '#9ca3af', fontSize: 12, lineHeight: 18 },
  floatingButtonContainer: { position: 'absolute', bottom: 28, right: 20, zIndex: 10 },
  svgFloatingWidget: { borderRadius: 28, paddingHorizontal: 24, paddingVertical: 14, minWidth: 160, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 },
  svgContentContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  svgComposeIcon: { flexShrink: 0 },
  svgEmailText: { color: 'black', fontSize: 16, fontWeight: '500', letterSpacing: -0.16 },
  svgSeparator: { width: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 4, flexShrink: 0 },
  svgArrowUp: { flexShrink: 0 },
  bottomNavigation: { backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 8, zIndex: 1 },
  bottomNavigationContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  bottomNavItem: { alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12 },
  bottomNavText: { fontSize: 12 },
  homeIndicatorContainer: { alignItems: 'center', paddingVertical: 8, zIndex: 1 },
  homeIndicator: { width: 128, height: 4, backgroundColor: '#ffffff', borderRadius: 2, opacity: 0.6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  badge: { backgroundColor: '#1e3a8a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 4, marginBottom: 4 },
  badgeText: { color: '#bfdbfe', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
})
