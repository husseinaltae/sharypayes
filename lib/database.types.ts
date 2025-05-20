export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      offices: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          name?: string;
        };
      };

      employees: {
        Row: {
          id: string;
          office_id: string;
          first_name: string;
          last_name: string;
          id_number: string;
          phone_no: string;
          email: string;
          address: string;
          certificate: string;
          job_title: string;
          hire_date: string; // ISO date string
          bank_account: string;
          bank: string;
          birthdate: string; // ISO date string
          notes: string;
        };
        Insert: {
          id?: string;
          office_id: string;
          first_name: string;
          last_name: string;
          id_number: string;
          phone_no: string;
          email: string;
          address: string;
          certificate: string;
          job_title: string;
          hire_date: string;
          bank_account: string;
          bank: string;
          birthdate: string;
          notes: string;
        };
        Update: Partial<Insert>;
      };

      payments: {
        Row: {
          id: string;
          degree: number;
          level: number;
          salary: string;
          employee_id: string;
          certificate_percentage: number;
          risk_percentage: number;
          manage_percentage: number;
          trans_pay: number;
          retire_percentage: number;
          created_at: string; // date
          updated_at: string; // timestamp with time zone
          net_credits: string;
          net_debits: string;
          net_salary: string;
        };
        Insert: {
          id?: string;
          degree: number;
          level: number;
          salary: string;
          employee_id: string;
          certificate_percentage: number;
          risk_percentage: number;
          manage_percentage: number;
          trans_pay: number;
          retire_percentage: number;
          created_at?: string;
          updated_at?: string;
          net_credits: string;
          net_debits: string;
          net_salary: string;
        };
        Update: Partial<Insert>;
      };

      payments_entries: {
        Row: {
          id: string;
          type: string;
          title: string;
          amount: string;
          payment_id: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          amount: string;
          payment_id: string;
        };
        Update: Partial<Insert>;
      };
    };
  };
}
