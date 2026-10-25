export type Contact = { id: number; name: string; role: string };
export type Attachment = { id: number; name: string; size: string; kind: string; viewable: boolean };

export type Announcement = {
  id: number; type: string; type_label: string; title: string; body: string;
  audience: string; author: string | null; published_at: string; attachments: Attachment[];
};

export type Person = { id: number; name: string; can_message: boolean };
export type Child = {
  id: number; name: string; class: string | null; grade: string | null;
  class_teacher: Person | null;
  subjects: { id: number; name: string; teacher: Person | null }[];
};

export type HomeData = {
  user: { id: number; name: string; email: string | null; phone: string | null; role: string };
  unread: { messages: number; notifications: number };
  children: Child[];
  announcements: Announcement[];
};

export type Conversation = { contact: Contact; last: { body: string; mine: boolean; created_at: string }; unread: number };
export type Message = { id: number; mine: boolean; body: string; about: string | null; seen: boolean; created_at: string; attachments: Attachment[] };
export type Thread = { contact: Contact; can_send: boolean; students: { id: number; name: string }[]; messages: Message[] };
export type Notice = { id: string; title: string; body: string; icon: string; kind: string | null; sender_id: number | null; count: number; read: boolean; created_at: string };