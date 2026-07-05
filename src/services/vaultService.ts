import apiClient from './apiClient';
import type { ItemDto } from '../types/vault';
import type { EntryDto } from '../types/vault';
import type { GroupDto } from '../types/vault';
import type { NewEntryRequest } from '../types/vault';
import type { NewGroupRequest } from '../types/vault';
import type { AttachmentDto } from '../types/vault';
import type { IconDto } from '../types/vault';

export async function getItemsByGroup(groupId: string): Promise<ItemDto[]> {
  const response = await apiClient.get<ItemDto[]>(`/vault/groups/${groupId}/items`);
  return response.data;
}

export async function getItem(itemId: string): Promise<ItemDto> {
  const response = await apiClient.get<ItemDto>(`/vault/items/${itemId}`);
  return response.data;
}

export async function getEntry(entryId: string): Promise<EntryDto> {
  const response = await apiClient.get<EntryDto>(`/vault/entries/${entryId}`);
  return response.data;
}

export async function getGroup(groupId: string): Promise<GroupDto> {
  const response = await apiClient.get<GroupDto>(`/vault/groups/${groupId}`);
  return response.data;
}

export async function searchEntries(keyword: string): Promise<ItemDto[]> {
  const response = await apiClient.get<ItemDto[]>(`/vault/search?keyword=${encodeURIComponent(keyword)}`);
  return response.data;
}

export async function getOtpEntries(): Promise<EntryDto[]> {
  console.log('[vaultService.ts] getOtpEntries called, fetching /vault/otp');
  try {
    const response = await apiClient.get<EntryDto[]>('/vault/otp');
    console.log('[vaultService.ts] getOtpEntries success, status:', response.status, 'data length:', response.data?.length);
    return response.data;
  } catch (err) {
    console.error('[vaultService.ts] getOtpEntries error:', err);
    throw err;
  }
}

export async function getIcons(): Promise<IconDto[]> {
  const response = await apiClient.get<IconDto[]>('/vault/icons');
  return response.data;
}

export async function createEntry(groupId: string, request: NewEntryRequest): Promise<EntryDto> {
  const response = await apiClient.post<EntryDto>(`/vault/groups/${groupId}/entries`, request);
  return response.data;
}

export async function createGroup(parentGroupId: string, request: NewGroupRequest): Promise<GroupDto> {
  const response = await apiClient.post<GroupDto>(`/vault/groups/${parentGroupId}/groups`, request);
  return response.data;
}

export async function updateEntry(entryId: string, request: Partial<EntryDto>): Promise<void> {
  await apiClient.put(`/vault/entries/${entryId}`, request);
}

export async function updateGroup(groupId: string, request: Partial<GroupDto>): Promise<void> {
  await apiClient.put(`/vault/groups/${groupId}`, request);
}

export async function deleteEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/vault/entries/${entryId}`);
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/vault/groups/${groupId}`);
}

export async function changePassword(newPassword: string): Promise<void> {
  await apiClient.post('/vault/change-password', { newPassword });
}

export async function getAttachments(entryId: string): Promise<AttachmentDto[]> {
  const response = await apiClient.get<AttachmentDto[]>(`/vault/entries/${entryId}/attachments`);
  return response.data;
}

export async function downloadAttachment(entryId: string, attachmentId: string): Promise<Blob> {
  const response = await apiClient.get(`/vault/entries/${entryId}/attachments/${attachmentId}`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function uploadAttachment(entryId: string, file: File): Promise<AttachmentDto> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<AttachmentDto>(`/vault/entries/${entryId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteAttachment(entryId: string, attachmentId: string): Promise<void> {
  await apiClient.delete(`/vault/entries/${entryId}/attachments/${attachmentId}`);
}