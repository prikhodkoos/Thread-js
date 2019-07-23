import postRepository from '../../data/repositories/post.repository';
import postReactionRepository from '../../data/repositories/post-reaction.repository';
import userRepository from '../../data/repositories/user.repository';

export const getPosts = filter => postRepository.getPosts(filter);

export const getPostById = id => postRepository.getPostById(id);

export const create = (userId, post) => postRepository.create({
    ...post,
    userId,
    isArchived: false
});

export const setReaction = async (userId, { postId, isLike = true }) => {
    // define the callback for future use as a promise
    const updateOrDelete = react => (react.isLike === isLike
        ? postReactionRepository.deleteById(react.id)
        : postReactionRepository.updateById(react.id, { isLike }));

    const reaction = await postReactionRepository.getPostReaction(userId, postId);

    const result = reaction
        ? await updateOrDelete(reaction)
        : await postReactionRepository.create({ userId, postId, isLike });

        const diff = reaction
            ? reaction.isLike
                ? { like: -1, dislike: isLike ? 0 : 1 }
                : { like: isLike ? 1 : 0, dislike: -1 }
            : { like: isLike ? 1 : 0, dislike: isLike ? 0 : 1 };

        const user = await userRepository.getUserById(userId);
        const username = user.dataValues.username;

    // the result is an integer when an entity is deleted
    return Number.isInteger(result) ? {diff, username} : {diff: {...postReactionRepository.getPostReaction(userId, postId), ...diff }, username};
};

export const archivePost = async id => {
    try {
        const result = await postRepository.getPostById(id);
        const isArchived = result.dataValues.isArchived
        await postRepository.updateById(id, { isArchived: !isArchived });
    
        return isArchived ? isArchived : { id };
    } catch (err) {
        console.log(err); 
        return err;
    }
};
