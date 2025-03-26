import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/SupervisorLogin" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/StudentLogin" options={{ headerShown: false }} />
      <Stack.Screen name="/chats" options={{ headerShown: false }} />
      <Stack.Screen name='/chats/[chat]' options={{ headerShown: false }} />
      <Stack.Screen name='/chats/[chat]/messages' options={{ headerShown: false }} />
      <Stack.Screen name="/internship-details" options={{ headerShown: false }} />
      <Stack.Screen name="/schedule/student" options={{ headerShown: false }} />
      <Stack.Screen name="/schedule/supervisor" options={{ headerShown: false }} />
      <Stack.Screen name="/profile/student" options={{ headerShown: false }} />
      <Stack.Screen name="/settings" options={{ headerShown: false }} />
      <Stack.Screen name="/notifications" options={{ headerShown: false }} />
      <Stack.Screen name='/reports/student' options={{ headerShown: false }} />
      <Stack.Screen name='/reports/edit/[week]' options={{ headerShown: false }} />
      <Stack.Screen name='/reports/supervisor' options={{ headerShown: false }} />
      <Stack.Screen name='/reports/supervisor/view/[week]' options={{ headerShown: false }} />
    </Stack>
  );
}
