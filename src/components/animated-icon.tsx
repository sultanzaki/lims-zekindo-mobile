import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const DURATION = 450;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  if (!visible) return null;

  const image = (
    <Image style={styles.image} source={require('@/assets/images/brand/zekindo-logo-white.png')} contentFit="contain" />
  );

  return (
    <Animated.View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: DURATION,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) setVisible(false);
          });
        });
      }}
      style={[styles.splashOverlay, { opacity }]}>
      {image}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 140,
    height: 46,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#2B8DB8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
