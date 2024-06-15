import 'dotenv/config';

export default {
  expo: {
    name: 'social_media_mobile',
    slug: 'social_media_mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: '',
    splash: {
      image: '',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: '',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: ''
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID
    }
  },
  name: "social_media_mobile"
};