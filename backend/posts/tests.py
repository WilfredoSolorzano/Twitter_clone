from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from posts.models import Post


class FeedPostsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', email='alice@example.com', password='pass12345')
        self.followed = User.objects.create_user(username='bob', email='bob@example.com', password='pass12345')
        self.other = User.objects.create_user(username='charlie', email='charlie@example.com', password='pass12345')

        self.user.following.add(self.followed)

        self.own_post = Post.objects.create(user=self.user, content='meu post')
        self.followed_post = Post.objects.create(user=self.followed, content='post de seguido')
        self.other_post = Post.objects.create(user=self.other, content='post de terceiro')

        self.client.force_authenticate(user=self.user)

    def test_feed_contains_own_and_followed_posts(self):
        response = self.client.get('/api/posts/?feed=true')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id'] for item in response.data}

        self.assertIn(self.own_post.id, returned_ids)
        self.assertIn(self.followed_post.id, returned_ids)
        self.assertNotIn(self.other_post.id, returned_ids)
