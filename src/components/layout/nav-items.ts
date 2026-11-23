import {
  Home,
  Coins,
  Gauge,
  Gem,
  Fuel,
  Wheat,
  LineChart,
  Map as MapIcon,
  ShoppingBasket,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "#tong-quan", label: "Tổng quan", icon: Home },
  { href: "#ty-gia", label: "Tỷ giá", icon: Coins },
  { href: "#lai-suat", label: "Lãi suất", icon: Gauge },
  { href: "#vang-bac", label: "Vàng & bạc", icon: Gem },
  { href: "#xang-dau", label: "Xăng dầu", icon: Fuel },
  { href: "#nong-san", label: "Cà phê & nông sản", icon: Wheat },
  { href: "#hang-hoa", label: "Hàng hóa & chỉ số", icon: LineChart },
  { href: "#bat-dong-san", label: "Bất động sản", icon: MapIcon },
  { href: "#thuc-pham", label: "Thực phẩm & tiêu dùng", icon: ShoppingBasket },
  { href: "#tieu-dung", label: "Y tế & công nghệ", icon: HeartPulse },
];

export const BOTTOM_NAV_ITEMS = [
  { ...NAV_ITEMS[0], shortLabel: "Tổng quan" },
  { ...NAV_ITEMS[1], shortLabel: "Tỷ giá" },
  { ...NAV_ITEMS[3], shortLabel: "Vàng" },
  { ...NAV_ITEMS[7], shortLabel: "BĐS" },
  { ...NAV_ITEMS[8], shortLabel: "Thực phẩm" },
];
