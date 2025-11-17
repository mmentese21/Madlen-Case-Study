# In backend/app/services/telemetry.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

def setup_telemetry(app):
    # Set a resource name for your service
    resource = Resource(attributes={
        "service.name": "madlen-chat-backend"
    })

    # Set up the TracerProvider
    provider = TracerProvider(resource=resource)
    
    # Configure the OTLP Exporter to send to Jaeger (running on localhost:4318)
    exporter = OTLPSpanExporter(endpoint="http://localhost:4318/v1/traces")
    
    # Use a BatchSpanProcessor
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)

    # Set the global tracer provider
    trace.set_tracer_provider(provider)

    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrument HTTPX (for calls to OpenRouter)
    HTTPXClientInstrumentor().instrument()

    print("OpenTelemetry instrumentation complete.")