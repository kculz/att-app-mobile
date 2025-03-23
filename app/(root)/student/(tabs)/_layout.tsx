import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from '../pages/dashboard';
import Profile from '../pages/profile';
import Reports from '../pages/reports';

const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide headers for all screens
        headerShown: false,
        // Tab bar icon configuration
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Reports') {
            iconName = 'document-text';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Tab bar styling
        tabBarActiveTintColor: '#3B82F6', // Active tab color
        tabBarInactiveTintColor: '#6B7280', // Inactive tab color
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Tab bar background color
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB', // Tab bar top border color
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default StudentTabs;