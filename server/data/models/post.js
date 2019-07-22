export default (orm, DataTypes) => {
    const Post = orm.define('post', {
        body: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        isArchived: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        }
    }, {});

    return Post;
};
