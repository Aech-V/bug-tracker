import { graphql } from './generated';

export const SIGN_UP = graphql(`
    mutation SignUp($name: String!, $email: String!, $password: String!) {
        signUp(name: $name, email: $email, password: $password) {
            id
            name
            email
        }
    }
`);

export const CREATE_BUG = graphql(`
    mutation CreateBug($title: String!, $description: String!, $priority: Priority!, $assignedToId: ID, $dueDate: String) {
        createBug(title: $title, description: $description, priority: $priority, assignedToId: $assignedToId, dueDate: $dueDate) {
            id
            ticketId
            status
        }
    }
`);

export const UPDATE_BUG_STATUS = graphql(`
    mutation UpdateBugStatus($id: ID!, $status: Status!) {
        updateBugStatus(id: $id, status: $status) {
        id
        status
        }
    }
`);

export const ADD_COMMENT = graphql(`
    mutation AddComment($bugId: ID!, $text: String!) {
        addComment(bugId: $bugId, text: $text) {
            id
            activities {
                id
                type
                text
                createdAt
                user {
                    id
                    name
                }
            }
        }
    }
`);

export const ASSIGN_BUG = graphql(`
    mutation AssignBug($id: ID!, $assignedToId: ID) {
        assignBug(id: $id, assignedToId: $assignedToId) {
            id
            assignedTo {
                id
                name
            }
        }
    }
`);

export const DELETE_BUG = graphql(`
    mutation DeleteBug($id: ID!) {
        deleteBug(id: $id)
    }
`);