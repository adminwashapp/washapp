module.exports = {
  expo: {
    name: 'Washapp Washer',
    slug: 'washapp-washer',
    version: '1.0.0',
    sdkVersion: '54.0.0',
    orientation: 'portrait',
    scheme: 'washapp-washer',
    userInterfaceStyle: 'automatic',
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.washapp.washer',
      icon: './assets/images/icon.png',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'Washapp Washer a besoin de votre localisation.',
        NSCameraUsageDescription: 'Washapp Washer utilise la camera.',
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      },
    },
    android: {
      package: 'com.washapp.washer',
      icon: './assets/images/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
    web: { bundler: 'metro', output: 'static' },
    plugins: [
      'expo-router',
      ['expo-notifications', { icon: './assets/images/icon.png', color: '#1558f5', sounds: [], mode: 'production' }],
      'expo-location',
      'expo-camera',
    ],
    experiments: { typedRoutes: true },
    extra: {
      apiUrl: 'https://washapp-api.onrender.com/api',
      wsUrl: 'https://washapp-api.onrender.com',
      eas: { projectId: 'ff8e8820-3be6-4477-9e8d-749de8856523' },
      router: {},
    },
    owner: 'lohrans',
  },
};