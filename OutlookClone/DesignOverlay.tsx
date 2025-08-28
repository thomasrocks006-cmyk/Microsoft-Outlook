import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const DesignOverlay = () => {
  if (!__DEV__) return null;
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Image
        source={require('./assets/reference/mail-list-iphone13pro.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default DesignOverlay;
