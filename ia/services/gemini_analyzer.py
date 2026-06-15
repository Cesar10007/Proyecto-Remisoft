import pandas as pd
import sqlalchemy
import google.genai as genai
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = "mysql+pymysql://remisoft:remisoft123@localhost/remisoft"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_DAILY_LIMIT = 500

request_counter = {"count": 0, "date": datetime.now().date()}

def get_engine():
    return sqlalchemy.create_engine(DB_URL)

def get_request_count():
    today = datetime.now().date()
    if request_counter["date"] != today:
        request_counter["count"] = 0
        request_counter["date"] = today
    return request_counter["count"]

def increment_counter():
    request_counter["count"] += 1

def cargar_datos():
    engine = get_engine()
    try:
        pedidos   = pd.read_sql("SELECT COUNT(*) as total FROM pedido", engine)
        productos = pd.read_sql("""
            SELECT p.Nombre, SUM(dp.cantidad) as total
            FROM Detalle_pedido dp
            JOIN Producto p ON dp.id_producto = p.id_producto
            GROUP BY p.Nombre ORDER BY total DESC LIMIT 5
        """, engine)
        return f"""
        Total pedidos: {pedidos['total'][0]}
        Productos más vendidos:
        {productos.to_string(index=False)}
        """
    except Exception as e:
        return f"Sin datos aún: {str(e)}"

def consultar_prophet(pregunta: str):
    resumen = cargar_datos()
    return {
        "respuesta": f"[Prophet] Análisis numérico: {resumen}",
        "fuente": "prophet"
    }

def consultar_gemini(pregunta: str):
    client = genai.Client(api_key=GEMINI_API_KEY)
    resumen = cargar_datos()
    prompt = f"""Eres un asistente de análisis de datos para el restaurante Familia Remi.
    Datos actuales: {resumen}
    Pregunta: {pregunta}
    Responde en español, corto y útil."""
    respuesta = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return {
        "respuesta": respuesta.text,
        "fuente": "gemini"
    }

def consultar(pregunta: str):
    try:
        count = get_request_count()
        if count >= GEMINI_DAILY_LIMIT:
            return consultar_prophet(pregunta)
        increment_counter()
        return consultar_gemini(pregunta)
    except Exception as e:
        print(f"ERROR GEMINI: {str(e)}")
        return consultar_prophet(pregunta)