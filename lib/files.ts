import { Alert, Linking } from 'react-native';
import { api } from './api';

export async function openAttachment(id: number) {
  try {
    const { url } = await api<{ url: string }>(`/attachments/${id}/link`);
    await Linking.openURL(url);
  } catch (e: any) {
    Alert.alert('Could not open the file', e?.message ?? 'Please try again.');
  }
}