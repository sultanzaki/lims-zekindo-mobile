import type { Href } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BellIcon, HomeIcon, ProfileIcon, SamplesIcon, ScanIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-notifications';
import { useTheme } from '@/hooks/use-theme';

// A from-scratch tab bar (not the platform-native tab chrome) so it can
// match src/components/BottomNav.tsx on the web exactly: pill highlight
// per tab, a raised circular Scan button in the middle, and an unread
// badge on Alerts — none of which native tab bar APIs give pixel control
// over.
export default function AppTabs() {
  const { data } = useNotifications();
  const unreadCount = data?.notifications.filter((n) => n.unread).length ?? 0;

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomNavBar>
          <NavTab name="index" href="/" label="Home" icon={(c) => <HomeIcon size={22} color={c} strokeWidth={1.9} />} />
          <NavTab
            name="samples"
            href="/samples"
            label="Samples"
            icon={(c) => <SamplesIcon size={22} color={c} strokeWidth={1.9} />}
          />
          <ScanTab />
          <NavTab
            name="notifications"
            href="/notifications"
            label="Alerts"
            icon={(c) => <BellIcon size={22} color={c} strokeWidth={1.9} />}
            badge={unreadCount}
          />
          <NavTab
            name="profile"
            href="/profile"
            label="Profile"
            icon={(c) => <ProfileIcon size={22} color={c} strokeWidth={1.9} />}
          />
        </BottomNavBar>
      </TabList>
    </Tabs>
  );
}

function BottomNavBar({ children, ...rest }: ViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.select({ ios: Math.max(insets.bottom, 8), android: 14 }) ?? 12;

  return (
    <View
      {...rest}
      style={[
        styles.bar,
        { backgroundColor: theme.backgroundElement, borderTopColor: theme.border, paddingBottom: bottomPad },
      ]}>
      {children}
    </View>
  );
}

function NavTab({
  name,
  href,
  label,
  icon,
  badge,
}: {
  name: string;
  href: Href;
  label: string;
  icon: (color: string) => React.ReactNode;
  badge?: number;
}) {
  return (
    <TabTrigger name={name} href={href} asChild>
      <NavPressable label={label} icon={icon} badge={badge} />
    </TabTrigger>
  );
}

function NavPressable({
  label,
  icon,
  badge,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  label: string;
  icon: (color: string) => React.ReactNode;
  badge?: number;
}) {
  const theme = useTheme();
  const color = isFocused ? theme.primaryDark : theme.faint;
  return (
    <Pressable {...props} style={styles.tabItem}>
      <View style={{ position: 'relative' }}>
        <View style={[styles.pill, isFocused && { backgroundColor: theme.primarySoft }]}>{icon(color)}</View>
        {!!badge && badge > 0 && (
          <View style={[styles.badge, { borderColor: theme.backgroundElement }]}>
            <ThemedText style={styles.badgeText}>{badge > 99 ? '99+' : String(badge)}</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={[styles.tabLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

function ScanTab() {
  const theme = useTheme();
  return (
    <TabTrigger name="scan" href="/scan" asChild>
      <Pressable style={styles.scanItem}>
        <View style={[styles.scanFab, { backgroundColor: theme.primary, borderColor: theme.backgroundElement }]}>
          <ScanIcon size={23} color="#FFFFFF" strokeWidth={2} />
        </View>
        <ThemedText style={[styles.tabLabel, { color: theme.primary }]}>Scan</ThemedText>
      </Pressable>
    </TabTrigger>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    minHeight: 48,
    paddingTop: Spacing.one,
  },
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: Radius.full,
    backgroundColor: '#D0021B',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 11,
    color: '#FFFFFF',
  },
  scanItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginTop: -16,
  },
  scanFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#2B8DB8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
});
