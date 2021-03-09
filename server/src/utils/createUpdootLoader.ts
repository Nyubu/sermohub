import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

// keys -> [{postId: 5, userId: 10}, . . . ] array of user id's return objects that are the user
// we load {postId 5, userId: 10, value: 1} (Updoot)
export const createUpdootLoader = () => 
    new DataLoader<{postId: number, userId: number}, Updoot | null>( async (keys) => {

    // One sql query to get all users
    const updoots = await Updoot.findByIds(keys as any);

    // Create a mapping
    const updootIdsToUpdoot: Record<string, Updoot> = {};
    updoots.forEach( (updoot) => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot; // get corresponding id
    })

    // Grab user from the map for each user id
    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
});