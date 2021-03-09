import DataLoader from "dataloader";
import { User } from "../entities/User";

// We want to create a loader on every request
// Need to pass in a batch load function

// keys -> [1, 7, 8, 9] array of user id's return objects that are the user
// [{id: 1, username: 'sam'}]
export const createUserLoader = () => new DataLoader<number, User>(async (userIds) => {

    // One sql query to get all users
    const users = await User.findByIds(userIds as unknown as number[]);

    // Create a mapping
    const userIdToUser: Record<number, User> = {};
    users.forEach(u => {
        userIdToUser[u.id] = u; // get corresponding id
    })

    // Grab user from the map for each user id
    return userIds.map((userId) => userIdToUser[userId]);
});