export type MembershipRole = 'owner' | 'admin' | 'agent' | 'client' | 'viewer';
export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_client'
  | 'waiting_on_team'
  | 'resolved'
  | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
} & Timestamps;

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
} & Timestamps;

export type Membership = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
};

export type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
} & Timestamps;

export type Ticket = {
  id: string;
  organization_id: string;
  project_id: string | null;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: string;
  assigned_to: string | null;
} & Timestamps;

export type TicketComment = {
  id: string;
  organization_id: string;
  ticket_id: string;
  author_id: string;
  body: string;
} & Timestamps;

export type Approval = {
  id: string;
  organization_id: string;
  ticket_id: string;
  requested_by: string;
  reviewed_by: string | null;
  status: ApprovalStatus;
  notes: string | null;
} & Timestamps;

export type ActivityEvent = {
  id: string;
  organization_id: string;
  ticket_id: string | null;
  actor_id: string;
  event_type: string;
  metadata: Json;
  created_at: string;
};

export type Notification = {
  id: string;
  organization_id: string;
  user_id: string;
  ticket_id: string | null;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ForeignKey = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update, Rel extends ForeignKey[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      organizations: Table<
        Organization,
        { name: string; slug: string; id?: string },
        { name?: string; slug?: string }
      >;
      profiles: Table<
        Profile,
        { id: string; full_name: string; avatar_url?: string | null },
        { full_name?: string; avatar_url?: string | null }
      >;
      memberships: Table<
        Membership,
        { organization_id: string; user_id: string; role: MembershipRole; id?: string },
        { role?: MembershipRole },
        [
          {
            foreignKeyName: 'memberships_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memberships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ]
      >;
      projects: Table<
        Project,
        {
          organization_id: string;
          name: string;
          description?: string | null;
          id?: string;
        },
        { name?: string; description?: string | null },
        [
          {
            foreignKeyName: 'projects_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ]
      >;
      tickets: Table<
        Ticket,
        {
          organization_id: string;
          title: string;
          description?: string;
          project_id?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          created_by: string;
          assigned_to?: string | null;
          id?: string;
        },
        {
          title?: string;
          description?: string;
          project_id?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          assigned_to?: string | null;
        },
        [
          {
            foreignKeyName: 'tickets_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tickets_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tickets_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tickets_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ]
      >;
      ticket_comments: Table<
        TicketComment,
        {
          organization_id: string;
          ticket_id: string;
          author_id: string;
          body: string;
          id?: string;
        },
        { body?: string },
        [
          {
            foreignKeyName: 'ticket_comments_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'tickets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ticket_comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ]
      >;
      approvals: Table<
        Approval,
        {
          organization_id: string;
          ticket_id: string;
          requested_by: string;
          reviewed_by?: string | null;
          status?: ApprovalStatus;
          notes?: string | null;
          id?: string;
        },
        { status?: ApprovalStatus; reviewed_by?: string | null; notes?: string | null },
        [
          {
            foreignKeyName: 'approvals_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'tickets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'approvals_requested_by_fkey';
            columns: ['requested_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'approvals_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ]
      >;
      activity_events: Table<
        ActivityEvent,
        {
          organization_id: string;
          actor_id: string;
          event_type: string;
          ticket_id?: string | null;
          metadata?: Json;
          id?: string;
        },
        { metadata?: Json },
        [
          {
            foreignKeyName: 'activity_events_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'tickets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ]
      >;
      notifications: Table<
        Notification,
        {
          organization_id: string;
          user_id: string;
          title: string;
          body: string;
          ticket_id?: string | null;
          read_at?: string | null;
          id?: string;
        },
        { read_at?: string | null },
        [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'tickets';
            referencedColumns: ['id'];
          },
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_role: MembershipRole;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      approval_status: ApprovalStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TicketWithRelations = Ticket & {
  creator: Pick<Profile, 'id' | 'full_name'> | null;
  assignee: Pick<Profile, 'id' | 'full_name'> | null;
  project: Pick<Project, 'id' | 'name'> | null;
};

export type CommentWithAuthor = TicketComment & {
  author: Pick<Profile, 'id' | 'full_name'> | null;
};

export type ActivityWithActor = ActivityEvent & {
  actor: Pick<Profile, 'id' | 'full_name'> | null;
};

export type ApprovalWithActors = Approval & {
  requester: Pick<Profile, 'id' | 'full_name'> | null;
  reviewer: Pick<Profile, 'id' | 'full_name'> | null;
};

export type MembershipWithProfile = Membership & {
  profile: Pick<Profile, 'id' | 'full_name'> | null;
};
