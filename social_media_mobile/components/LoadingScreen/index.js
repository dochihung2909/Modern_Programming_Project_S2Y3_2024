import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text className="mt-4">Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
