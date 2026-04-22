export interface NavSubItem {
  label: string;
  path: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  permissions?: string[];
  subItems?: NavSubItem[];
}
