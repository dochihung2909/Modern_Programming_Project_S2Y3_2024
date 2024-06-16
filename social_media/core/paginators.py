from rest_framework import pagination


class BasePaginator(pagination.PageNumberPagination):
    page_size = 5


class UserPaginator(BasePaginator):
    pass


class PostPaginator(BasePaginator):
    pass


class CommentPaginator(BasePaginator):
    pass


class RoomPaginator(BasePaginator):
    pass


