/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    mutation SignUp($name: String!, $email: String!, $password: String!) {\n        signUp(name: $name, email: $email, password: $password) {\n            id\n            name\n            email\n        }\n    }\n": typeof types.SignUpDocument,
    "\n    mutation CreateBug($title: String!, $description: String!, $priority: Priority!, $assignedToId: ID, $dueDate: String) {\n        createBug(title: $title, description: $description, priority: $priority, assignedToId: $assignedToId, dueDate: $dueDate) {\n            id\n            ticketId\n            status\n        }\n    }\n": typeof types.CreateBugDocument,
    "\n    mutation UpdateBugStatus($id: ID!, $status: Status!) {\n        updateBugStatus(id: $id, status: $status) {\n        id\n        status\n        }\n    }\n": typeof types.UpdateBugStatusDocument,
    "\n    mutation AddComment($bugId: ID!, $text: String!) {\n        addComment(bugId: $bugId, text: $text) {\n            id\n            activities {\n                id\n                type\n                text\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n": typeof types.AddCommentDocument,
    "\n    mutation AssignBug($id: ID!, $assignedToId: ID) {\n        assignBug(id: $id, assignedToId: $assignedToId) {\n            id\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n": typeof types.AssignBugDocument,
    "\n    mutation DeleteBug($id: ID!) {\n        deleteBug(id: $id)\n    }\n": typeof types.DeleteBugDocument,
    "\n    query GetBugs($status: Status, $priority: Priority, $limit: Int, $offset: Int) {\n        bugs(status: $status, priority: $priority, limit: $limit, offset: $offset) {\n            id\n            ticketId\n            title\n            priority\n            status\n            createdAt\n            dueDate\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n": typeof types.GetBugsDocument,
    "\n    query GetBugCount($status: Status, $priority: Priority) {\n        bugCount(status: $status, priority: $priority)\n    }\n": typeof types.GetBugCountDocument,
    "\n    query GetBugDetails($id: ID!) {\n        bug(id: $id) {\n            id\n            ticketId\n            title\n            description\n            priority\n            status\n            createdAt\n            dueDate\n            updatedAt\n            createdBy {\n                id\n                name\n            }\n            assignedTo {\n                id\n                name\n            }\n            activities {\n                id\n                type\n                text\n                oldValue\n                newValue\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n": typeof types.GetBugDetailsDocument,
    "\n    query GetUsers {\n        users {\n            id\n            name\n            email\n        }\n    }\n": typeof types.GetUsersDocument,
};
const documents: Documents = {
    "\n    mutation SignUp($name: String!, $email: String!, $password: String!) {\n        signUp(name: $name, email: $email, password: $password) {\n            id\n            name\n            email\n        }\n    }\n": types.SignUpDocument,
    "\n    mutation CreateBug($title: String!, $description: String!, $priority: Priority!, $assignedToId: ID, $dueDate: String) {\n        createBug(title: $title, description: $description, priority: $priority, assignedToId: $assignedToId, dueDate: $dueDate) {\n            id\n            ticketId\n            status\n        }\n    }\n": types.CreateBugDocument,
    "\n    mutation UpdateBugStatus($id: ID!, $status: Status!) {\n        updateBugStatus(id: $id, status: $status) {\n        id\n        status\n        }\n    }\n": types.UpdateBugStatusDocument,
    "\n    mutation AddComment($bugId: ID!, $text: String!) {\n        addComment(bugId: $bugId, text: $text) {\n            id\n            activities {\n                id\n                type\n                text\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n": types.AddCommentDocument,
    "\n    mutation AssignBug($id: ID!, $assignedToId: ID) {\n        assignBug(id: $id, assignedToId: $assignedToId) {\n            id\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n": types.AssignBugDocument,
    "\n    mutation DeleteBug($id: ID!) {\n        deleteBug(id: $id)\n    }\n": types.DeleteBugDocument,
    "\n    query GetBugs($status: Status, $priority: Priority, $limit: Int, $offset: Int) {\n        bugs(status: $status, priority: $priority, limit: $limit, offset: $offset) {\n            id\n            ticketId\n            title\n            priority\n            status\n            createdAt\n            dueDate\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n": types.GetBugsDocument,
    "\n    query GetBugCount($status: Status, $priority: Priority) {\n        bugCount(status: $status, priority: $priority)\n    }\n": types.GetBugCountDocument,
    "\n    query GetBugDetails($id: ID!) {\n        bug(id: $id) {\n            id\n            ticketId\n            title\n            description\n            priority\n            status\n            createdAt\n            dueDate\n            updatedAt\n            createdBy {\n                id\n                name\n            }\n            assignedTo {\n                id\n                name\n            }\n            activities {\n                id\n                type\n                text\n                oldValue\n                newValue\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n": types.GetBugDetailsDocument,
    "\n    query GetUsers {\n        users {\n            id\n            name\n            email\n        }\n    }\n": types.GetUsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SignUp($name: String!, $email: String!, $password: String!) {\n        signUp(name: $name, email: $email, password: $password) {\n            id\n            name\n            email\n        }\n    }\n"): (typeof documents)["\n    mutation SignUp($name: String!, $email: String!, $password: String!) {\n        signUp(name: $name, email: $email, password: $password) {\n            id\n            name\n            email\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateBug($title: String!, $description: String!, $priority: Priority!, $assignedToId: ID, $dueDate: String) {\n        createBug(title: $title, description: $description, priority: $priority, assignedToId: $assignedToId, dueDate: $dueDate) {\n            id\n            ticketId\n            status\n        }\n    }\n"): (typeof documents)["\n    mutation CreateBug($title: String!, $description: String!, $priority: Priority!, $assignedToId: ID, $dueDate: String) {\n        createBug(title: $title, description: $description, priority: $priority, assignedToId: $assignedToId, dueDate: $dueDate) {\n            id\n            ticketId\n            status\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation UpdateBugStatus($id: ID!, $status: Status!) {\n        updateBugStatus(id: $id, status: $status) {\n        id\n        status\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateBugStatus($id: ID!, $status: Status!) {\n        updateBugStatus(id: $id, status: $status) {\n        id\n        status\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AddComment($bugId: ID!, $text: String!) {\n        addComment(bugId: $bugId, text: $text) {\n            id\n            activities {\n                id\n                type\n                text\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation AddComment($bugId: ID!, $text: String!) {\n        addComment(bugId: $bugId, text: $text) {\n            id\n            activities {\n                id\n                type\n                text\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AssignBug($id: ID!, $assignedToId: ID) {\n        assignBug(id: $id, assignedToId: $assignedToId) {\n            id\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation AssignBug($id: ID!, $assignedToId: ID) {\n        assignBug(id: $id, assignedToId: $assignedToId) {\n            id\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation DeleteBug($id: ID!) {\n        deleteBug(id: $id)\n    }\n"): (typeof documents)["\n    mutation DeleteBug($id: ID!) {\n        deleteBug(id: $id)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetBugs($status: Status, $priority: Priority, $limit: Int, $offset: Int) {\n        bugs(status: $status, priority: $priority, limit: $limit, offset: $offset) {\n            id\n            ticketId\n            title\n            priority\n            status\n            createdAt\n            dueDate\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetBugs($status: Status, $priority: Priority, $limit: Int, $offset: Int) {\n        bugs(status: $status, priority: $priority, limit: $limit, offset: $offset) {\n            id\n            ticketId\n            title\n            priority\n            status\n            createdAt\n            dueDate\n            assignedTo {\n                id\n                name\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetBugCount($status: Status, $priority: Priority) {\n        bugCount(status: $status, priority: $priority)\n    }\n"): (typeof documents)["\n    query GetBugCount($status: Status, $priority: Priority) {\n        bugCount(status: $status, priority: $priority)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetBugDetails($id: ID!) {\n        bug(id: $id) {\n            id\n            ticketId\n            title\n            description\n            priority\n            status\n            createdAt\n            dueDate\n            updatedAt\n            createdBy {\n                id\n                name\n            }\n            assignedTo {\n                id\n                name\n            }\n            activities {\n                id\n                type\n                text\n                oldValue\n                newValue\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetBugDetails($id: ID!) {\n        bug(id: $id) {\n            id\n            ticketId\n            title\n            description\n            priority\n            status\n            createdAt\n            dueDate\n            updatedAt\n            createdBy {\n                id\n                name\n            }\n            assignedTo {\n                id\n                name\n            }\n            activities {\n                id\n                type\n                text\n                oldValue\n                newValue\n                createdAt\n                user {\n                    id\n                    name\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetUsers {\n        users {\n            id\n            name\n            email\n        }\n    }\n"): (typeof documents)["\n    query GetUsers {\n        users {\n            id\n            name\n            email\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;