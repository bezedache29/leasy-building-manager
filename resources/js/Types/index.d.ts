export * from '@/Types/guarantor';
export * from '@/Types/tenant';
export * from '@/Types/document';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: {
    user: User;
  };
};
