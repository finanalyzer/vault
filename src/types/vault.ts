export const ItemSubType = {
  Group: 0,
  Entry: 1,
  Notes: 2,
  PxEntry: 3,
  None: 4,
} as const;

export type ItemSubType = typeof ItemSubType[keyof typeof ItemSubType];

export interface ItemDto {
  id: string;
  name: string;
  type: ItemSubType;
  isGroup: boolean;
  lastModified: string;
  icon?: string;
  iconContentType?: string;
  description?: string;
  notes?: string;
}

export interface FieldDto {
  key: string;
  value: string;
  isProtected: boolean;
  isBinary: boolean;
  encodedKey?: string;
}

export interface EntryDto extends ItemDto {
  username?: string;
  password?: string;
  url?: string;
  email?: string;
  mobile?: string;
  otpUrl?: string;
  customFields?: Record<string, string>;
  fields?: FieldDto[];
  attachments?: AttachmentDto[];
  groupId?: string;
}

export interface GroupDto extends ItemDto {
  childCount: number;
  children?: ItemDto[];
  parentId?: string;
}

export interface NewEntryRequest {
  type: ItemSubType;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  email?: string;
  mobile?: string;
  notes?: string;
  otpUrl?: string;
  customFields?: Record<string, string>;
  fields?: FieldDto[];
}

export interface NewGroupRequest {
  name: string;
}

export interface AttachmentDto {
  id: string;
  name: string;
  size: number;
  contentType: string;
  isImage: boolean;
}

export interface IconDto {
  id: string;
  name: string;
  data: string;
  contentType: string;
}