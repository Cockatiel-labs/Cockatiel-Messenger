import { t, type UnwrapSchema } from "elysia";

export const AuthResult = {
  checkUsernameResponse: t.Boolean(),

  authResponse: t.Object({
    success: t.Literal(true),
    message: t.String(),
    data: t.Object({
      user: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    }),
  }),

  logoutResponse: t.Object({
    success: t.Literal(true),
    message: t.String(),
  }),

  refreshResponse: t.Object({
    success: t.Literal(true),
    message: t.String(),
  }),

  errorResponse: t.Object({
    success: t.Literal(false),
    message: t.String(),
  }),
};

export type AuthModel = {
  [K in keyof typeof AuthResult]: UnwrapSchema<(typeof AuthResult)[K]>;
};
