import { Bug } from '../models/Bug';
import { User } from '../models/User';
import { connectToDatabase } from '@/lib/mongoose';
import { Resolvers } from './generated/types';
import bcrypt from 'bcryptjs';

const VALID_TRANSITIONS: Record<string, string[]> = {
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['OPEN', 'RESOLVED'],
    RESOLVED: ['IN_PROGRESS']
};

export const resolvers: Resolvers = {
    Query: {
        bugs: async (_, args) => {
            await connectToDatabase();

            const filter: Record<string, any> = {};
            if (args.status) filter.status = args.status;
            if (args.priority) filter.priority = args.priority;
            const limit = args.limit ?? 50;
            const offset = args.offset ?? 0;

            return (await Bug.find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('createdBy')
                .populate('assignedTo')
                .populate('activities.user')) as any;
        },

        bugCount: async (_, args) => {
            await connectToDatabase();

            const filter: Record<string, any> = {};
            if (args.status) filter.status = args.status;
            if (args.priority) filter.priority = args.priority;

            return await Bug.countDocuments(filter);
        },

        bug: async (_: any, { id }: { id: string }) => {
            await connectToDatabase();
            return Bug.findById(id)
                .populate('createdBy')
                .populate('assignedTo')
                .populate('activities.user') as any;
        },

        users: async () => {
            await connectToDatabase();
            return User.find({});
        }
    },

    Mutation: {
        signUp: async (_, args) => {
            await connectToDatabase();
            const existingUser = await User.findOne({ email: args.email });
            if (existingUser) {
                throw new Error("An account with this email already exists.");
            }
            const hashedPassword = await bcrypt.hash(args.password, 12);
            const newUser = new User({
                name: args.name,
                email: args.email,
                password: hashedPassword,
                role: 'DEVELOPER',
            });
            await newUser.save();
            return newUser as any;
        },

        createBug: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized: You must be logged in.");
            await connectToDatabase();

            const newBug = new Bug({
                title: args.title,
                description: args.description,
                priority: args.priority,
                createdBy: context.user.id,
                status: 'OPEN',
                assignedTo: args.assignedToId || null,
                dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
                activities: [{
                    type: 'TICKET_CREATED',
                    user: context.user.id
                }]
            });

            await newBug.save();
            return (await newBug.populate('createdBy')) as any;
        },

        updateBugStatus: async (_, { id, status }, context) => {
            if (!context.user) throw new Error("Unauthorized");
            await connectToDatabase();

            const bug = await Bug.findById(id);
            if (!bug) throw new Error('Bug not found');

            const allowedNextStates = VALID_TRANSITIONS[bug.status];
            if (!allowedNextStates.includes(status)) {
                throw new Error(`State Machine Error: Cannot transition bug to ${status}.`);
            }

            bug.activities.push({
                type: 'STATUS_CHANGE',
                oldValue: bug.status,
                newValue: status,
                user: context.user.id
            } as any);

            bug.status = status as any;
            await bug.save();

            return (await bug.populate(['createdBy', 'assignedTo', 'activities.user'])) as any;
        },

        assignBug: async (_, { id, assignedToId }, context) => {
            if (!context.user) throw new Error("Unauthorized");
            await connectToDatabase();

            const bug = await Bug.findById(id).populate('assignedTo');
            if (!bug) throw new Error('Bug not found');

            const oldAssigneeName = bug.assignedTo ? (bug.assignedTo as any).name : 'Unassigned';

            let newAssigneeName = 'Unassigned';
            if (assignedToId) {
                const newUser = await User.findById(assignedToId);
                if (newUser) newAssigneeName = newUser.name;
            }

            bug.activities.push({
                type: 'ASSIGNEE_CHANGE',
                oldValue: oldAssigneeName,
                newValue: newAssigneeName,
                user: context.user.id
            } as any);

            bug.assignedTo = assignedToId as any;
            await bug.save();

            return (await bug.populate(['createdBy', 'assignedTo', 'activities.user'])) as any;
        },

        addComment: async (_, { bugId, text }, context) => {
            if (!context.user) throw new Error("Unauthorized");
            await connectToDatabase();

            const bug = await Bug.findById(bugId);
            if (!bug) throw new Error('Bug not found');

            bug.activities.push({
                type: 'COMMENT',
                text,
                user: context.user.id,
                createdAt: new Date()
            } as any);

            await bug.save();
            return (await bug.populate(['createdBy', 'assignedTo', 'activities.user'])) as any;
        },
        
        deleteBug: async (_, { id }, context) => {
            if (!context.user) throw new Error("Unauthorized");
            await connectToDatabase();
            
            const result = await Bug.findByIdAndDelete(id);
            if (!result) throw new Error('Bug not found');
            
            return true;
        }
    },
};