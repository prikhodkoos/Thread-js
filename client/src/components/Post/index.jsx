import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image, Label, Icon } from 'semantic-ui-react';
import moment from 'moment';
import './post.css';
import styles from './styles.module.scss';

const Post = ({ post, likePost, archivePost, toggleExpandedPost, sharePost }) => {
    const {
        id,
        image,
        body,
        user,
        likeCount,
        dislikeCount,
        likers,
        dislikers,
        commentCount,
        createdAt
    } = post;
    const date = moment(createdAt).fromNow();
    return (
        <Card style={{ width: '100%' }}>
            {image && <Image src={image.link} wrapped ui={false} />}
            <Card.Content>
                <Card.Meta>
                    <span className="date">
                        posted by
                        {' '}
                        {user.username}
                        {' - '}
                        {date}
                    </span>
                </Card.Meta>
                <Card.Description>
                    {body}
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Label basic size="small" as="a" className={styles.toolbarBtn} onClick={() => likePost(id, true)}>
                    <Icon name="thumbs up" />
                    {likeCount}
                </Label>
                <div className='users'>{likers.join(', ')}</div>
                <Label basic size="small" as="a" className={styles.toolbarBtn} onClick={() => likePost(id, false)}>
                    <Icon name="thumbs down" />
                    {dislikeCount}
                </Label>
                <div className='users dis'>{dislikers.join(', ')}</div>
                <Label basic size="small" as="a" className={styles.toolbarBtn} onClick={() => toggleExpandedPost(id)}>
                    <Icon name="comment" />
                    {commentCount}
                </Label>
                <Label basic size="small" as="a" className={styles.toolbarBtn} onClick={() => sharePost(id)}>
                    <Icon name="share alternate" />
                </Label>
                {
                    archivePost && 
                    <Label basic size="small" as="a" className={styles.toolbarBtn} style={{float:'right'}} onClick={() => archivePost(id)}>
                        <Icon name="archive" />
                    </Label>
                }
            </Card.Content>
        </Card>
    );
};


Post.propTypes = {
    post: PropTypes.objectOf(PropTypes.any).isRequired,
    likePost: PropTypes.func.isRequired,
    toggleExpandedPost: PropTypes.func.isRequired,
    sharePost: PropTypes.func.isRequired
};

export default Post;
