/**
 * Icon Mapper
 * 
 * Maps icon names (stored in database) to React icon components
 */

import React from "react";
import { 
  FileText, Shield, User, Home, Wallet, Calculator, TrendingUp, Landmark, Briefcase, 
  RefreshCw, Layers, ScanLine, Minimize, Scissors, FileSpreadsheet, FileType, 
  Globe, Key, Braces, Database, Clock, Terminal, Code2, Link, Hash, Binary, 
  Calendar, QrCode, Lock, Timer, ArrowRightLeft, Type, Pipette, Scale, Wind, Dumbbell, Sparkles, BrainCircuit,
  Image, Table, Percent, Check, Split, Grid, Laptop, FileCode
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  FileText,
  Shield,
  User,
  Home,
  Wallet,
  Calculator,
  TrendingUp,
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
};

/**
 * Get icon component from icon name
 */
export function getIconComponent(iconName: string | null | undefined): React.ComponentType<any> {
  if (!iconName) return FileText; // Default icon
  return iconMap[iconName] || FileText;
}

/**
 * Get icon JSX element from icon name
 */
export function getIcon(iconName: string | null | undefined, size: number = 24): React.ReactElement {
  const IconComponent = getIconComponent(iconName);
  return React.createElement(IconComponent, { size });
}
