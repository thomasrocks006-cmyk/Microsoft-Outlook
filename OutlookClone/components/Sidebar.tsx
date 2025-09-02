import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Inbox, Send, FileText, Archive, Trash2, Folder, Clock, HelpCircle, Settings, Globe } from 'lucide-react-native';

const folders = [
  { label: 'Inbox', icon: Inbox, badge: 17 },
  { label: 'Sent', icon: Send, badge: 5 },
  { label: 'Drafts', icon: FileText },
  { label: 'Archive', icon: Archive },
  { label: 'Deleted', icon: Trash2 },
  { label: 'Junk', icon: Folder },
  { label: 'Conversation History', icon: Folder },
];

export default function Sidebar(){
  return (
    <View style={styles.container}>
      <View style={styles.accountHeader}>
        <View style={styles.accountTitleRow}>
          <Globe size={18} color='#555' style={{marginRight:8}} />
          <Text style={styles.accountTitle}>Outlook.com</Text>
        </View>
  <Text style={styles.accountEmail}>thomas.francis@jpmorgan.com</Text>
        <Clock size={18} color='#555' style={styles.clockIcon} />
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:24}}>
        {folders.map((item,i)=>(
          <TouchableOpacity key={i} style={styles.row} activeOpacity={0.6}>
            <item.icon size={20} color='#444' />
            <Text style={styles.label}>{item.label}</Text>
            {item.badge ? (
              <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
            ):null}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.bottom}>
        <HelpCircle size={22} color='#555' style={styles.icon} />
        <Settings size={22} color='#555' style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#ffffff',paddingTop:48},
  accountHeader:{paddingHorizontal:20,marginBottom:16},
  accountTitleRow:{flexDirection:'row',alignItems:'center'},
  accountTitle:{fontWeight:'600',fontSize:16,color:'#111'},
  accountEmail:{fontSize:14,color:'#555',marginTop:2},
  clockIcon:{position:'absolute',right:20,top:8},
  row:{flexDirection:'row',alignItems:'center',paddingVertical:14,paddingHorizontal:20},
  label:{fontSize:15,marginLeft:16,flex:1,color:'#222'},
  badge:{backgroundColor:'#e5f0ff',borderRadius:10,paddingHorizontal:6,paddingVertical:2},
  badgeText:{fontSize:12,fontWeight:'600',color:'#0078D4'},
  bottom:{flexDirection:'row',justifyContent:'flex-start',padding:20,borderTopWidth:0.5,borderColor:'#eee'},
  icon:{marginRight:20},
});
