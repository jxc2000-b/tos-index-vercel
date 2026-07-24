export type User = {
    id: string;
    email: string | null;
    emailVerified: string | null;
    name: string | null;
    image: string | null;
    createdAt: string;
    isAdmin: boolean;
    preferences: string[];
};

// Server-only fields. Do not return this shape from a browser-facing API.
export type UserRecord = User & {
    passwordHash: string | null;
};

// Server-only: session tokens authenticate a user.
export type Session = {
    id: string;
    sessionToken: string;
    userId: string;
    expires: string;
};

export type Post = {
    id: string;
    title: string;
    body: string;
    authorId: string;
    createdAt: string;
    published: boolean;
};

// Server-only: verification tokens must never be exposed to the client.
export type VerificationToken = {
    identifier: string;
    token: string;
    expires: string;
};
