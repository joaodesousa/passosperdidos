from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math

class CustomPagination(PageNumberPagination):
    page_size = 10  # Adjust as needed
    page_size_query_param = 'size'  # Allows the client to set page size
    max_page_size = 100  # Prevent excessive results per page

    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size)
        
        return Response({
            "count": self.page.paginator.count,  # Total items
            "totalPages": total_pages,  # Total number of pages
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data
        })
