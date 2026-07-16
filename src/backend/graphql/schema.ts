export const typeDefs = `
    enum Role {
        ADMIN
        DEVELOPER
    }

    enum Priority {
        LOW
        MEDIUM
        HIGH
    }

    enum Status {
        OPEN
        IN_PROGRESS
        RESOLVED
    }

    enum ActivityType {
        COMMENT
        STATUS_CHANGE
        ASSIGNEE_CHANGE
        TICKET_CREATED
    }

    type User {
        id: ID!
        name: String!
        email: String!
        role: Role!
    }

    type Activity {
        id: ID!
        type: ActivityType!
        text: String
        oldValue: String
        newValue: String
        user: User!
        createdAt: String!
    }

    type Bug {
        id: ID!
        ticketId: String!
        title: String!
        description: String!
        priority: Priority!
        status: Status!
        createdBy: User!
        assignedTo: User
        activities: [Activity!]!
        createdAt: String!
        updatedAt: String!
        dueDate: String
    }

    type Query {
        bugs(status: Status, priority: Priority, limit: Int, offset: Int): [Bug!]!
        bugCount(status: Status, priority: Priority): Int! 
        bug(id: ID!): Bug
        users: [User!]!
    }

    type Mutation {
        signUp(name: String!, email: String!, password: String!): User!
        createBug(title: String!, description: String!, priority: Priority!, assignedToId: ID, dueDate: String): Bug!
        updateBugStatus(id: ID!, status: Status!): Bug!
        deleteBug(id: ID!): Boolean!
        assignBug(id: ID!, assignedToId: ID): Bug! 
        addComment(bugId: ID!, text: String!): Bug!
    }
`;