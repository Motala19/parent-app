import { Loading } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Routes() {
  const { status } = useAuth();

  if (status === 'loading') return <Loading />;

  // Stack.Protected shows these screens only while the guard is true
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="new-chat" />
        <Stack.Screen name="notifications" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}