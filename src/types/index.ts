export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ValidateCode: { email: string };
  NewPassword: { email: string; code: string };
};

export type ReaderTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type ReaderStackParamList = {
  ReaderTabs: undefined;
  BookDetail: { bookId: string };
  ChangePassword: undefined;
  PDFViewer: { bookId: string };
};

export type AdminTabParamList = {
  AdminHome: undefined;
  Users: undefined;
  Books: undefined;
  Settings: undefined;
  AdminProfile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  UserForm: { userId?: string };
  BookForm: { bookId?: string };
};

export * from './auth';
export * from './book';
export * from './user';
