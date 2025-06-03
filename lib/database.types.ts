export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_name: string;
          id_number: string;
          email: string;
          phone_no: string;
          employee_id: string; // FK to employees.id
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name: string;
          last_name: string;
          id_number: string;
          email: string;
          phone_no: string;
          employee_id: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'users_employee_id_fkey';
            columns: ['employee_id'];
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
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
          hire_date: string;
          bank_account: string;
          bank: string;
          birthdate: string;
          notes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['employees']['Row']>;
        Update: Partial<Database['public']['Tables']['employees']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'employees_office_id_fkey';
            columns: ['office_id'];
            referencedRelation: 'offices';
            referencedColumns: ['id'];
          }
        ];
      };

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
        Update: Partial<Database['public']['Tables']['offices']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'offices_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'offices';
            referencedColumns: ['id'];
          }
        ];
      };

      payments: {
        Row: {
          id: string;
          employee_id: string;
          degree: number;
          level: number;
          salary: number;
          certificate_percentage: number;
          risk_percentage: number;
          manage_percentage: number;
          trans_pay: number;
          retire_percentage: number;
          month: string | null;
          certificate_pay?: number | null;
          risk_pay?: number | null;
          manage_pay?: number | null;
          retire_cut?: number | null;
          note?: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']>;
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'payments_employee_id_fkey';
            columns: ['employee_id'];
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };

      payments_entries: {
        Row: {
          id: string;
          payment_id: string;
          type: 'credit' | 'debit';
          title: string;
          amount: number;
        };
        Insert: Partial<Database['public']['Tables']['payments_entries']['Row']>;
        Update: Partial<Database['public']['Tables']['payments_entries']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'payments_entries_payment_id_fkey';
            columns: ['payment_id'];
            referencedRelation: 'payments';
            referencedColumns: ['id'];
          }
        ];
      };

      promotions: {
        Row: {
          id: string;
          employee_id: string;
          old_salary: number;
          new_salary: number;
          old_degree: number;
          new_degree: number;
          old_level: number;
          new_level: number;
          due_date: string;
          notes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['promotions']['Row']>;
        Update: Partial<Database['public']['Tables']['promotions']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'promotions_employee_id_fkey';
            columns: ['employee_id'];
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
