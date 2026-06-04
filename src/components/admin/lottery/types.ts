export interface Participant {
  name: string;
  phone?: string;
  email?: string;
  ticketNumber: string;
}

export interface Lottery {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'inactive';
  created_at: string;
  winner?: {
    name: string;
    ticket_number: string;
    phone?: string;
    email?: string;
  } | null;
}

export interface DbParticipant {
  id: string;
  name: string;
  ticket_number: string;
  phone?: string | null;
  email?: string | null;
  is_winner?: boolean;
  lottery_id?: string;
}
