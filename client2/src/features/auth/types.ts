export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = LoginBody & {
  name: string;
};
