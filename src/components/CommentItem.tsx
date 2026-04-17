import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Comment } from '../types/book';

export interface CommentItemProps {
  comment: Comment;
}

const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/40x40?text=U';

/**
 * Displays a single comment with avatar, author name and text.
 * Requisitos: 7.7
 */
export default function CommentItem({ comment }: CommentItemProps): React.JSX.Element {
  const avatarUri =
    comment.avatarUrl && comment.avatarUrl.length > 0
      ? comment.avatarUrl
      : PLACEHOLDER_AVATAR;

  return (
    <View style={styles.container} testID="comment-item">
      <Image
        source={{ uri: avatarUri }}
        style={styles.avatar}
        testID="comment-avatar"
      />
      <View style={styles.content}>
        <Text style={styles.authorName} testID="comment-author">
          {comment.authorName}
        </Text>
        <Text style={styles.text} testID="comment-text">
          {comment.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  text: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
