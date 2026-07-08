import type { UserType } from "../enums/UserType";

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  googleId: string | null;
  googlePictureUrl: string | null;
  ban: boolean;
  userType: UserType;
  timeMsGift: number;
  subscribe: boolean;
  activated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
