/**
 * Icon Mapper Utility
 * 
 * Maps icon string identifiers to React components
 * This allows icons to be serialized in server components
 */

import React from "react";
import {
  FileText, Shield, User, Users, Home, Wallet, Calculator, TrendingUp, TrendingDown, Landmark, Briefcase,
  RefreshCw, Layers, ScanLine, Minimize, Scissors, FileSpreadsheet, FileType,
  Globe, Key, Braces, Database, Clock, Terminal, Code2, Link, Hash, Binary,
  Calendar, QrCode, Lock, Timer, ArrowRightLeft, Type, Pipette, Scale, Wind, Dumbbell, Sparkles, BrainCircuit,
  Image, Table, Percent, Check, Split, Grid, Laptop, FileCode, Mic, Upload,
  BarChart3, Brain, SearchCode, LayoutDashboard, Package, BookOpen, Receipt,
  ShoppingBag, CreditCard, FileCheck, Banknote, Activity, Tags, Repeat2,
  Radio, Trophy, Zap, Wand2, CircleDollarSign, CalendarDays, Tag,
  Flame, IndianRupee, Award, Heart, ShieldCheck, Dna,
  Building2, MapPin, Rocket, Plane, Car, Fuel, Video, Download,
  PiggyBank, Coins, Droplets, ListChecks, Gauge, GraduationCap, GitMerge, Utensils, Target
} from "lucide-react";

export type IconName =
  | 'FileText' | 'Shield' | 'User' | 'Home' | 'Wallet' | 'Calculator' | 'TrendingUp' | 'TrendingDown' | 'Landmark' | 'Briefcase'
  | 'RefreshCw' | 'Layers' | 'ScanLine' | 'Minimize' | 'Scissors' | 'FileSpreadsheet' | 'FileType'
  | 'Globe' | 'Key' | 'Braces' | 'Database' | 'Clock' | 'Terminal' | 'Code2' | 'Link' | 'Hash' | 'Binary'
  | 'Calendar' | 'QrCode' | 'Lock' | 'Timer' | 'ArrowRightLeft' | 'Type' | 'Pipette' | 'Scale' | 'Wind' | 'Dumbbell' | 'Sparkles' | 'BrainCircuit'
  | 'Image' | 'Table' | 'Percent' | 'Check' | 'Split' | 'Grid' | 'Laptop' | 'FileCode' | 'Mic' | 'Upload'
  | 'BarChart3' | 'Brain' | 'SearchCode' | 'Users'
  | 'LayoutDashboard' | 'Package' | 'BookOpen' | 'Receipt'
  | 'ShoppingBag' | 'CreditCard' | 'FileCheck' | 'Banknote' | 'Activity' | 'Tags'
  | 'Repeat2' | 'Radio' | 'Trophy' | 'Zap' | 'Wand2' | 'CircleDollarSign'
  | 'CalendarDays' | 'Tag'
  | 'Flame' | 'IndianRupee' | 'Award' | 'Heart' | 'ShieldCheck' | 'Dna'
  | 'Building2' | 'MapPin' | 'Rocket' | 'Plane' | 'Car' | 'Fuel' | 'Video' | 'Download'
  | 'PiggyBank' | 'Coins' | 'Droplets' | 'ListChecks' | 'Gauge' | 'GraduationCap' | 'GitMerge' | 'Utensils' | 'Target';

const ICON_MAP: Record<IconName, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Shield,
  User,
  Users,
  Home,
  Wallet,
  Calculator,
  TrendingUp,
  TrendingDown,
  Landmark,
  Briefcase,
  RefreshCw,
  Layers,
  ScanLine,
  Minimize,
  Scissors,
  FileSpreadsheet,
  FileType,
  Globe,
  Key,
  Braces,
  Database,
  Clock,
  Terminal,
  Code2,
  Link,
  Hash,
  Binary,
  Calendar,
  QrCode,
  Lock,
  Timer,
  ArrowRightLeft,
  Type,
  Pipette,
  Scale,
  Wind,
  Dumbbell,
  Sparkles,
  BrainCircuit,
  Image,
  Table,
  Percent,
  Check,
  Split,
  Grid,
  Laptop,
  FileCode,
  Mic,
  Upload,
  BarChart3,
  Brain,
  SearchCode,
  LayoutDashboard,
  Package,
  BookOpen,
  Receipt,
  ShoppingBag,
  CreditCard,
  FileCheck,
  Banknote,
  Activity,
  Tags,
  Repeat2,
  Radio,
  Trophy,
  Zap,
  Wand2,
  CircleDollarSign,
  CalendarDays,
  Tag,
  Flame,
  IndianRupee,
  Award,
  Heart,
  ShieldCheck,
  Dna,
  Building2,
  MapPin,
  Rocket,
  Plane,
  Car,
  Fuel,
  Video,
  Download,
  PiggyBank,
  Coins,
  Droplets,
  ListChecks,
  Gauge,
  GraduationCap,
  GitMerge,
  Utensils,
  Target,
};

/**
 * Get icon component by name
 */
export function getIcon(iconName: IconName, size: number = 20): React.ReactElement {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) {
    // Fallback to a default icon if not found
    return <FileText size={size} />;
  }
  return <IconComponent size={size} />;
}

/**
 * Get icon component (for direct rendering)
 */
export function getIconComponent(iconName: IconName): React.ComponentType<{ size?: number; className?: string }> {
  return ICON_MAP[iconName] || FileText;
}
