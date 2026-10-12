export type AuditLogSettings = {
    member_joined: string | null;
    member_leaved: string | null;
    member_banned: string | null;
    member_unbanned: string | null;
    member_kicked: string | null;
    member_role_updated: string | null;
    message_deleted: string | null;
    message_bulk_deleted: string | null;
    message_edited: string | null;
    channel_created: string | null;
    channel_updated: string | null;
    channel_deleted: string | null;
    thread_created: string | null;
    thread_updated: string | null;
    thread_deleted: string | null;
    guild_updated: string | null;
    role_created: string | null;
    role_updated: string | null;
    role_deleted: string | null;
    moderation_command_used: string | null;
    [key: string]: string | null;
};
export const logEvents = [
    'member_joined',
    'member_leaved',
    'member_banned',
    'member_unbanned',
    'member_kicked',
    'member_role_updated',
    'message_deleted',
    'message_bulk_deleted',
    'message_edited',
    'channel_created',
    'channel_updated',
    'channel_deleted',
    'thread_created',
    'thread_updated',
    'thread_deleted',
    'guild_updated',
    'role_created',
    'role_updated',
    'role_deleted',
    'moderation_command_used',
];