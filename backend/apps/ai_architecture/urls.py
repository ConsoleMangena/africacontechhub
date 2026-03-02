from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatCompletionView, ChatStreamView, KnowledgeDocumentView, ImageGenerationView,
    AIInstructionView, ChatSessionListView, ChatSessionDetailView,
    ImageFeedbackView, DrawingStylePresetView, BOQTemplateView, MaterialPriceView,
)

router = DefaultRouter()

urlpatterns = [
    path('chat/', ChatCompletionView.as_view(), name='ai-chat'),
    path('chat/stream/', ChatStreamView.as_view(), name='ai-chat-stream'),
    path('generate-image/', ImageGenerationView.as_view(), name='ai-generate-image'),
    path('knowledge/', KnowledgeDocumentView.as_view(), name='ai-knowledge'),
    path('knowledge/<int:pk>/', KnowledgeDocumentView.as_view(), name='ai-knowledge-detail'),
    path('instructions/', AIInstructionView.as_view(), name='ai-instructions'),
    path('chat/sessions/', ChatSessionListView.as_view(), name='ai-chat-sessions'),
    path('chat/sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='ai-chat-session-detail'),
    path('feedback/', ImageFeedbackView.as_view(), name='ai-image-feedback'),
    path('style-presets/', DrawingStylePresetView.as_view(), name='ai-style-presets'),
    path('style-presets/<int:pk>/', DrawingStylePresetView.as_view(), name='ai-style-presets-detail'),
    path('boq-templates/', BOQTemplateView.as_view(), name='ai-boq-templates'),
    path('boq-templates/<int:pk>/', BOQTemplateView.as_view(), name='ai-boq-templates-detail'),
    path('material-prices/', MaterialPriceView.as_view(), name='ai-material-prices'),
    path('material-prices/<int:pk>/', MaterialPriceView.as_view(), name='ai-material-prices-detail'),
    path('', include(router.urls)),
]
