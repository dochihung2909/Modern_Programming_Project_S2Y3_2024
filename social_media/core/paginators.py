from rest_framework import pagination


class BasePaginator(pagination.PageNumberPagination):
    page_size = 5


class PostPaginator(BasePaginator):
    page_size = 1


class UserPaginator(BasePaginator):
    pass


class CommentPaginator(BasePaginator):
    pass


class LikePaginator(BasePaginator):
    pass


class LikePostPaginator(BasePaginator):
    pass


class LikeCommentPaginator(BasePaginator):
    pass


