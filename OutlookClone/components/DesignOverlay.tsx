import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  source: any;                 // require("../assets/reference/xxx.png")
  initialOpacity?: number;     // 0..1
  visible?: boolean;
  xOffset?: number;            // px
  yOffset?: number;            // px
  scale?: number;              // 1 = 100%
};

export default function DesignOverlay({
  source,
  initialOpacity = 0.45,
  visible = true,
  xOffset = 0,
  yOffset = 0,
  scale = 1,
}: Props) {
  const [show, setShow] = useState(visible);
  const [opacity, setOpacity] = useState(initialOpacity);

  if (!show) {
    return (
      <Pressable style={styles.fab} onPress={() => setShow(true)}>
        <Text style={styles.fabText}>Overlay</Text>
      </Pressable>
    );
  }

  return (
    <>
      {/* Don’t block touches */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX: xOffset }, { translateY: yOffset }, { scale }] },
        ]}
      >
        <Image source={source} style={[StyleSheet.absoluteFill, { opacity, resizeMode: "cover" }]} />
      </View>

      {/* Controls */}
      <View style={styles.tools}>
        <Pressable style={styles.btn} onPress={() => setOpacity(Math.max(0, opacity - 0.1))}><Text style={styles.txt}>–</Text></Pressable>
        <Text style={styles.readout}>{Math.round(opacity * 100)}%</Text>
        <Pressable style={styles.btn} onPress={() => setOpacity(Math.min(1, opacity + 0.1))}><Text style={styles.txt}>+</Text></Pressable>
        <Pressable style={[styles.btn, { marginLeft: 8 }]} onPress={() => setShow(false)}><Text style={styles.txt}>Hide</Text></Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tools:{position:"absolute",top:60,right:12,flexDirection:"row",alignItems:"center",backgroundColor:"rgba(0,0,0,0.5)",borderRadius:12,paddingHorizontal:8,paddingVertical:6},
  btn:{paddingHorizontal:10,paddingVertical:6,backgroundColor:"rgba(255,255,255,0.1)",borderRadius:8},
  txt:{color:"#fff",fontWeight:"600"},
  readout:{color:"#fff",marginHorizontal:8,width:40,textAlign:"center"},
  fab:{position:"absolute",bottom:28,right:20,backgroundColor:"rgba(0,0,0,0.6)",borderRadius:18,paddingHorizontal:12,paddingVertical:8},
  fabText:{color:"#fff",fontWeight:"600"},
});
