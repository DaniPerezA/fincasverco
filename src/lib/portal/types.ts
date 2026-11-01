import type { UnitType } from "@/lib/portal/identity";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type OwnerLookup =
  | { status: "invalid"; error: string }
  | { status: "unknown" }
  | { status: "not_validated" }
  | { status: "needs_password"; maskedEmail: string }
  | { status: "needs_activation"; maskedEmail: string }
  | { status: "ready"; maskedEmail: string }
  | { status: "locked"; lockedUntil: string };

export type OwnerUnitView = {
  id: string;
  communityId: string;
  communityName: string;
  communityAddress: string;
  unitType: UnitType;
  unitLabel: string;
};

export type OwnerAccount = {
  id: string;
  nif: string;
  fullName: string;
  email: string;
  units: OwnerUnitView[];
};

export type AdminAccount = {
  id: string;
  email: string;
  fullName: string;
};

export type CommunityRecord = {
  id: string;
  name: string;
  address: string;
};

export type OwnerAdminRow = {
  id: string;
  nif: string;
  fullName: string;
  email: string;
  validated: boolean;
  activated: boolean;
  hasPassword: boolean;
  locked: boolean;
  units: OwnerUnitView[];
};

export type AdminDashboard = {
  admin: AdminAccount;
  communities: CommunityRecord[];
  owners: OwnerAdminRow[];
};

export type UnitDraft = {
  communityId: string;
  unitType: UnitType;
  unitLabel: string;
};

export type MailNotice = {
  maskedEmail: string;
  devMail: boolean;
};
