import postRepository from '../../data/repositories/post.repository';
import postReactionRepository from '../../data/repositories/post-reaction.repository';

export const getPosts = filter => postRepository.getPosts(filter);

export const getPostById = id => postRepository.getPostById(id);

export const create = (userId, post) => postRepository.create({
    ...post,
    userId
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

    // the result is an integer when an entity is deleted
    return Number.isInteger(result) ? diff : {...postReactionRepository.getPostReaction(userId, postId), ...diff };
};
