export interface Permission {
  id:          number;
  name:        string;
  module:      string;
  action:      string;
  description: string;
  active:      boolean;
}
