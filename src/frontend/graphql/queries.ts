import { graphql } from './generated';

export const GET_BUGS = graphql(`
    query GetBugs($status: Status, $priority: Priority, $limit: Int, $offset: Int) {
        bugs(status: $status, priority: $priority, limit: $limit, offset: $offset) {
            id
            ticketId
            title
            priority
            status
            createdAt
            dueDate
            assignedTo {
                id
                name
            }
        }
    }
`);

export const GET_BUG_COUNT = graphql(`
    query GetBugCount($status: Status, $priority: Priority) {
        bugCount(status: $status, priority: $priority)
    }
`);

export const GET_BUG_DETAILS = graphql(`
    query GetBugDetails($id: ID!) {
        bug(id: $id) {
            id
            ticketId
            title
            description
            priority
            status
            createdAt
            dueDate
            updatedAt
            createdBy {
                id
                name
            }
            assignedTo {
                id
                name
            }
            activities {
                id
                type
                text
                oldValue
                newValue
                createdAt
                user {
                    id
                    name
                }
            }
        }
    }
`);

export const GET_USERS = graphql(`
    query GetUsers {
        users {
            id
            name
            email
        }
    }
`);