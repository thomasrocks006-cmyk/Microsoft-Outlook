import React from 'react';
import { Drawer } from 'expo-router/drawer';
import Sidebar from '../components/Sidebar';

export default function RootLayout(){
  return (
    <Drawer
      drawerContent={() => <Sidebar />}
      screenOptions={{
        headerShown:false,
        // 'front' overlays the existing screen instead of pushing it
        drawerType:'front',
        overlayColor:'rgba(0,0,0,0.35)',
        drawerStyle:{ width:300, backgroundColor:'#fff' },
        swipeEnabled:true
      }}
    >
      <Drawer.Screen name="index" options={{ title:'Inbox' }} />
      <Drawer.Screen name="calendar" options={{ title:'Calendar' }} />
      <Drawer.Screen name="mail/[id]" options={{ title:'Mail' }} />
    </Drawer>
  );
}
