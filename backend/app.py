from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS
from math import radians, cos, sin, asin, sqrt

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "dbname": "gisdb",
    "user": "admin",
    "password": "admin",
    "host": "localhost",  
    "port": "5432"
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def create_places_table():
    """Creates the 'places' table if it doesn't already exist."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'places'
            );
        """)
        table_exists = cur.fetchone()[0]

        if not table_exists:
            cur.execute("""
                CREATE TABLE places (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT,
                    latitude DOUBLE PRECISION NOT NULL,
                    longitude DOUBLE PRECISION NOT NULL,
                    geom GEOMETRY(Point, 4326)
                );
            """)
            conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating table: {e}")

@app.route('/insert_place', methods=['POST'])
def insert_place():
    try:
        data = request.json
        name = data.get("name")
        place_type = data.get("type")
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        if not name or latitude is None or longitude is None:
            return jsonify({"error": "Missing required fields"}), 400
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO places (name, type, latitude, longitude, geom)
            VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));
        """, (name, place_type, latitude, longitude, longitude, latitude))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Place added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    



@app.route('/nearby_places', methods=['GET'])
def find_nearby_places():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        radius = float(request.args.get('radius'))  
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
        SELECT * FROM (
            SELECT id, name, type, latitude, longitude,
                   (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) * 
                   cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * 
                   sin(radians(latitude)))) AS distance
            FROM places
        ) AS subquery
        WHERE distance <= %s
        ORDER BY distance;
        """
        cur.execute(query, (lat, lon, lat, radius))
        places = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify({"places": [{"id": p[0], "name": p[1], "type": p[2], "latitude": p[3], "longitude": p[4], "distance_km": round(p[5], 2)} for p in places]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/nearest_place', methods=['GET'])
def find_nearest_place():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
        SELECT id, name, type, latitude, longitude,
               (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) * 
               cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * 
               sin(radians(latitude)))) AS distance
        FROM places
        ORDER BY distance ASC
        LIMIT 1;
        """
        cur.execute(query, (lat, lon, lat))
        place = cur.fetchone()
        cur.close()
        conn.close()
        if place:
            return jsonify({
                "place": {
                    "id": place[0],
                    "name": place[1],
                    "type": place[2],
                    "latitude": place[3],
                    "longitude": place[4],
                    "distance_km": round(place[5], 2)
                }
            })
        else:
            return jsonify({"error": "No places found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/distance', methods=['GET'])
def calculate_distance():
    try:
        lat1 = float(request.args.get('lat1'))
        lon1 = float(request.args.get('lon1'))
        lat2 = float(request.args.get('lat2'))
        lon2 = float(request.args.get('lon2'))
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c
        distance = haversine(lat1, lon1, lat2, lon2)
        return jsonify({"distance_km": round(distance, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# @app.route('/delete_place/<int:place_id>', methods=['DELETE'])
# def delete_place(place_id):
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT * FROM places WHERE id = %s", (place_id,))
#         place = cur.fetchone()
#         if not place:
#             cur.close()
#             conn.close()
#             return jsonify({"error": "Place not found"}), 404
#         cur.execute("DELETE FROM places WHERE id = %s", (place_id,))
#         conn.commit()
#         cur.close()
#         conn.close()
#         return jsonify({"message": f"Place with ID {place_id} deleted successfully!"}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
@app.route('/insert_bulk_places', methods=['POST'])
def insert_bulk_places():
    try:
        places = [
            {"name": "Statue of Liberty", "type": "Monument", "latitude": 40.6892, "longitude": -74.0445},
            {"name": "Times Square", "type": "Landmark", "latitude": 40.7580, "longitude": -73.9855},
            {"name": "Empire State Building", "type": "Skyscraper", "latitude": 40.748817, "longitude": -73.985428},
            {"name": "Brooklyn Bridge", "type": "Bridge", "latitude": 40.7061, "longitude": -73.9969},
            {"name": "Central Park", "type": "Park", "latitude": 40.785091, "longitude": -73.968285},
            {"name": "Madison Square Garden", "type": "Arena", "latitude": 40.7505, "longitude": -73.9934},
            {"name": "One World Trade Center", "type": "Skyscraper", "latitude": 40.712743, "longitude": -74.013379},
            {"name": "Chrysler Building", "type": "Skyscraper", "latitude": 40.7516, "longitude": -73.9755},
            {"name": "Yankee Stadium", "type": "Stadium", "latitude": 40.8296, "longitude": -73.9262},
            {"name": "MetLife Stadium", "type": "Stadium", "latitude": 40.8135, "longitude": -74.0745},
            {"name": "Rockefeller Center", "type": "Complex", "latitude": 40.7587, "longitude": -73.9787},
            {"name": "Museum of Modern Art", "type": "Museum", "latitude": 40.7614, "longitude": -73.9776},
            {"name": "Guggenheim Museum", "type": "Museum", "latitude": 40.7830, "longitude": -73.9590},
            {"name": "Fifth Avenue", "type": "Shopping Street", "latitude": 40.7743, "longitude": -73.9653},
            {"name": "Wall Street", "type": "Financial District", "latitude": 40.7074, "longitude": -74.0113},
            {"name": "Grand Central Terminal", "type": "Train Station", "latitude": 40.7527, "longitude": -73.9772},
            {"name": "Broadway", "type": "Theater District", "latitude": 40.7590, "longitude": -73.9845},
            {"name": "Coney Island", "type": "Beach", "latitude": 40.5755, "longitude": -73.9707},
            {"name": "Battery Park", "type": "Park", "latitude": 40.7033, "longitude": -74.0170},
            {"name": "JFK Airport", "type": "Airport", "latitude": 40.6413, "longitude": -73.7781}
        ]

        conn = get_db_connection()
        cur = conn.cursor()

        for place in places:
            cur.execute("""
                INSERT INTO places (name, type, latitude, longitude, geom)
                VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
            """, (place["name"], place["type"], place["latitude"], place["longitude"], place["longitude"], place["latitude"]))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "20 places added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500




create_places_table()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
