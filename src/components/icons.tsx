import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

// Ported 1:1 from the web app's inline SVGs (src/components/BottomNav.tsx,
// src/app/dashboard/page.tsx, and friends) so the mobile icon set is the
// same icons, not a similar-looking substitute.

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export function HomeIcon({ size = 22, color = '#000', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 11l9-8 9 8" />
      <Path d="M5 10v10h14V10" />
      <Path d="M9 20v-6h6v6" />
    </Svg>
  );
}

export function SamplesIcon({ size = 22, color = '#000', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 3h6" />
      <Path d="M9 3v6l-4 9h14l-4-9V3" />
      <Path d="M7.5 15h9" />
    </Svg>
  );
}

export function ScanIcon({ size = 23, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8V5a1 1 0 011-1h3" />
      <Path d="M20 8V5a1 1 0 00-1-1h-3" />
      <Path d="M4 16v3a1 1 0 001 1h3" />
      <Path d="M20 16v3a1 1 0 01-1 1h-3" />
      <Path d="M4 12h16" />
    </Svg>
  );
}

export function BellIcon({ size = 22, color = '#000', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" />
    </Svg>
  );
}

export function ProfileIcon({ size = 22, color = '#000', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21v-1a8 8 0 0116 0v1" />
    </Svg>
  );
}

export function BackIcon({ size = 19, color = '#1A5F7A', strokeWidth = 2.3 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function ChevronIcon({ size = 7, color = '#C2D2DB' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.7} viewBox="0 0 8 14" fill="none">
      <Path d="M1 1l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 15, color = '#7A8B94', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M21 21l-4.35-4.35" />
    </Svg>
  );
}

export function PlusIcon({ size = 14, color = '#fff', strokeWidth = 2.6 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function ClockIcon({ size = 13, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function AlertTriangleIcon({ size = 17, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4.5L21 20H3z" />
      <Path d="M12 10.5v4" />
      <Path d="M12 17.4h.01" />
    </Svg>
  );
}

export function CheckIcon({ size = 9, color = '#fff', strokeWidth = 3.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function NewSampleIcon({ size = 16, color = '#2B8DB8', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function ReagentsIcon({ size = 16, color = '#2B8DB8', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 7l8-4 8 4v10l-8 4-8-4z" />
      <Path d="M4 7l8 4 8-4" />
      <Path d="M12 11v10" />
    </Svg>
  );
}

export function EquipmentIcon({ size = 16, color = '#2B8DB8', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="12" rx="2" />
      <Path d="M8 20h8" />
      <Path d="M12 16v4" />
      <Path d="M7 11.5l3-3 2.5 2.5L17 7" />
    </Svg>
  );
}

export function DeviationsIcon({ size = 16, color = '#2B8DB8', strokeWidth = 2 }: IconProps) {
  return <AlertTriangleIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

export function TasksIcon({ size = 16, color = '#2B8DB8', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="8" y="2" width="8" height="4" rx="1" />
      <Path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </Svg>
  );
}

export function FilterIcon({ size = 15, color = '#5B6B74', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M8 3v4" />
      <Path d="M16 3v4" />
      <Path d="M3 10h18" />
    </Svg>
  );
}
