import sequelize from '../db/connection';
import { PostModel, CommentModel, UserModel, ImageModel, PostReactionModel } from '../models/index';
import BaseRepository from './base.repository';
import postReactionRepository from './post-reaction.repository';
import userRepository from './user.repository';
const op = require('sequelize').Op;

const likeCase = bool => `CASE WHEN "postReactions"."isLike" = ${bool} THEN 1 ELSE 0 END`;

class PostRepository extends BaseRepository {
    async getPosts(filter) {
        const {
            from: offset,
            count: limit,
            userId,
            isReverse,
            type
        } = filter;

        const where = {};

        if (userId) {
            if (isReverse === 'true') Object.assign(where, { userId: {[op.ne]: userId} });
            if (isReverse === 'false') Object.assign(where, { userId });
        }
    
        type === 'archived'
            ? Object.assign(where, { isArchived: true, userId })
            : Object.assign(where, { isArchived: false });

        const reactionWhere = {};

        if (type === 'liked') Object.assign(reactionWhere, { isLike: true, userId });
        
        const posts =  this.model.findAll({
            where,
            attributes: {
                include: [
                    [sequelize.literal(`
                        (SELECT COUNT(*)
                        FROM "comments" as "comment"
                        WHERE "post"."id" = "comment"."postId")`), 'commentCount'],
                    [sequelize.fn('SUM', sequelize.literal(likeCase(true))), 'likeCount'],
                    [sequelize.fn('SUM', sequelize.literal(likeCase(false))), 'dislikeCount']
                ]
            },
            include: [{
                model: ImageModel,
                attributes: ['id', 'link']
            }, {
                model: UserModel,
                attributes: ['id', 'username'],
                include: {
                    model: ImageModel,
                    attributes: ['id', 'link']
                }
            }, {
                model: PostReactionModel,
                where: reactionWhere,
                attributes: [],
                duplicating: false
            }],
            group: [
                'post.id',
                'image.id',
                'user.id',
                'user->image.id'
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
        const extendedPosts = posts.map(async post => {
            const reactionsLike = await postReactionRepository.getPostReactors(post.id, true);
            
            const likers = await Promise.all(reactionsLike.map(async reaction => {
                const user = await userRepository.getById(reaction.dataValues.userId);
                return user.username;
            }));

            const reactionsDislike = await postReactionRepository.getPostReactors(post.id, false);
            
            const dislikers = await Promise.all(reactionsDislike.map(async reaction => {
                const user = await userRepository.getById(reaction.dataValues.userId);
                return user.username;
            }));
            
            Object.assign(post.dataValues, {likers, dislikers});

            return post;
        });
        return extendedPosts;
    }

    getPostById(id) {
        return this.model.findOne({
            group: [
                'post.id',
                'comments.id',
                'comments->user.id',
                'comments->user->image.id',
                'user.id',
                'user->image.id',
                'image.id'
            ],
            where: { id },
            attributes: {
                include: [
                    [sequelize.literal(`
                        (SELECT COUNT(*)
                        FROM "comments" as "comment"
                        WHERE "post"."id" = "comment"."postId")`), 'commentCount'],
                    [sequelize.fn('SUM', sequelize.literal(likeCase(true))), 'likeCount'],
                    [sequelize.fn('SUM', sequelize.literal(likeCase(false))), 'dislikeCount']
                ]
            },
            include: [{
                model: CommentModel,
                include: {
                    model: UserModel,
                    attributes: ['id', 'username'],
                    include: {
                        model: ImageModel,
                        attributes: ['id', 'link']
                    }
                }
            }, {
                model: UserModel,
                attributes: ['id', 'username'],
                include: {
                    model: ImageModel,
                    attributes: ['id', 'link']
                }
            }, {
                model: ImageModel,
                attributes: ['id', 'link']
            }, {
                model: PostReactionModel,
                attributes: []
            }]
        });
    }
}

export default new PostRepository(PostModel);
