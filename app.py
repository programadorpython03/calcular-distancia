import os
import googlemaps
import requests

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Obter a chave da API do Google Maps de uma variável de ambiente
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not API_KEY:
    raise ValueError("A chave da API do Google Maps não foi encontrada. Configure a variável de ambiente 'GOOGLE_MAPS_API_KEY'.")

gmaps = googlemaps.Client(key=API_KEY)

# Função para obter as marcas de veículos da API da FIPE
def obter_marcas():
    url = "https://parallelum.com.br/fipe/api/v1/carros/marcas"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Erro ao obter marcas: {e}")
        return []

# Função para obter os modelos de veículos da API da FIPE
def obter_modelos(codigo_marca):
    url = f"https://parallelum.com.br/fipe/api/v1/carros/marcas/{codigo_marca}/modelos"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json().get("modelos", [])
    except requests.RequestException as e:
        print(f"Erro ao obter modelos: {e}")
        return []

# Função para obter os anos de um modelo de veículo da API da FIPE
def obter_anos(codigo_marca, codigo_modelo):
    url = f"https://parallelum.com.br/fipe/api/v1/carros/marcas/{codigo_marca}/modelos/{codigo_modelo}/anos"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Erro ao obter anos: {e}")
        return []

@app.route("/", methods=["GET", "POST"])
def index():
    distancia = None
    custo = None
    marcas = obter_marcas()
    
    if request.method == "POST":
        try:
            origem = request.form["origem"].strip()
            destino = request.form["destino"].strip()
            marca = request.form["marca"]
            modelo = request.form["modelo"]
            ano = request.form["ano"]
            consumo = float(request.form["consumo"])
            preco_gasolina = float(request.form["combustivel"])

            if not origem or not destino or consumo <= 0 or preco_gasolina <= 0:
                raise ValueError("Dados inválidos fornecidos no formulário.")

            # Obter direções da API do Google Maps
            directions_result = gmaps.directions(origem, destino)

            if not directions_result:
                raise ValueError("Não foi possível obter direções para os locais fornecidos.")

            # Calcular a distância em quilômetros
            distancia = directions_result[0]["legs"][0]["distance"]["value"] / 1000

            # Calcular o custo da viagem
            custo = (distancia / consumo) * preco_gasolina

        except Exception as e:
            return render_template("index.html", error=str(e), marcas=marcas)

    return render_template("index.html", distancia=distancia, custo=custo, marcas=marcas)

@app.route("/modelos/<codigo_marca>")
def obter_modelos_para_marca(codigo_marca):
    modelos = obter_modelos(codigo_marca)
    return jsonify(modelos)

@app.route("/anos/<codigo_marca>/<codigo_modelo>")
def obter_anos_para_modelo(codigo_marca, codigo_modelo):
    anos = obter_anos(codigo_marca, codigo_modelo)
    return jsonify(anos)

@app.route("/calcular_rota", methods=["POST"])
def calcular_rota():
    try:
        origem = request.form["origem"].strip()
        destino = request.form["destino"].strip()
        consumo = float(request.form["consumo"])
        preco_gasolina = float(request.form["combustivel"])

        if not origem or not destino or consumo <= 0 or preco_gasolina <= 0:
            raise ValueError("Dados inválidos fornecidos no formulário.")

        # Obter direções da API do Google Maps
        directions_result = gmaps.directions(origem, destino)

        if not directions_result:
            raise ValueError("Não foi possível obter direções para os locais fornecidos.")

        # Calcular a distância em quilômetros
        distancia = directions_result[0]["legs"][0]["distance"]["value"] / 1000

        # Calcular o custo da viagem
        custo = (distancia / consumo) * preco_gasolina

        return jsonify({"distancia": distancia, "custo": custo})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
