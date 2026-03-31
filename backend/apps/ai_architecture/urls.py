from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatCompletionView, ChatStreamView, KnowledgeDocumentView,
    AIInstructionView, ChatSessionListView, ChatSessionDetailView,
    BOQTemplateView, MaterialPriceView, SiteIntelView, DrawAgentView,
)

router = DefaultRouter()

urlpatterns = [
    path('chat/', ChatCompletionView.as_view(), name='ai-chat'),
    path('chat/stream/', ChatStreamView.as_view(), name='ai-chat-stream'),
    path('knowledge/', KnowledgeDocumentView.as_view(), name='ai-knowledge'),
    path('knowledge/<int:pk>/', KnowledgeDocumentView.as_view(), name='ai-knowledge-detail'),
    path('instructions/', AIInstructionView.as_view(), name='ai-instructions'),
    path('chat/sessions/', ChatSessionListView.as_view(), name='ai-chat-sessions'),
    path('chat/sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='ai-chat-session-detail'),
    path('boq-templates/', BOQTemplateView.as_view(), name='ai-boq-templates'),
    path('boq-templates/<int:pk>/', BOQTemplateView.as_view(), name='ai-boq-templates-detail'),
    path('material-prices/', MaterialPriceView.as_view(), name='ai-material-prices'),
    path('material-prices/<int:pk>/', MaterialPriceView.as_view(), name='ai-material-prices-detail'),
    path('site-intel/', SiteIntelView.as_view(), name='ai-site-intel-create'),
    path('site-intel/<int:project_id>/', SiteIntelView.as_view(), name='ai-site-intel-latest'),
    path('draw-agent/', DrawAgentView.as_view(), name='ai-draw-agent'),
    path('', include(router.urls)),
]
