from fastapi import FastAPI, Request, Query, HTTPException, Response
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from geopy.distance import geodesic
import folium
from folium import plugins
import osmnx as ox
import networkx as nx
from datetime import datetime
import json
import matplotlib.pyplot as plt
import plotly.express as px
import os
import time
from functools import lru_cache
from rtree import index
import gc
import shutil
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

app = FastAPI(title="falcao-maps API", description="Store locator and route planning API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for files
os.makedirs('temp', exist_ok=True)

# Custom JSON encoder for NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

# Load and prepare the store data
stores_df = pd.read_csv('dataset of 50 stores.csv')

# Define Pydantic models for API responses
class Location(BaseModel):
    lat: float
    lon: float

class Store(BaseModel):
    store_name: str
    address: str
    contact: str
    distance: float
    estimated_delivery_time: int
    product_categories: str
    location: Location

class StoresResponse(BaseModel):
    status: str
    stores: List[Store]

class ErrorResponse(BaseModel):
    status: str
    message: str

class StoreLocator:
    def __init__(self, stores_dataframe):
        self.stores_df = stores_dataframe
        self.network_graph = None
        self.graph_cache = {}  # Cache for network graphs
        self.spatial_index = self._build_spatial_index()

    @lru_cache(maxsize=50)     
    def initialize_graph(self, center_point, dist=30000):  # Reduced distance for memory optimization
        """Initialize road network graph with caching"""
        cache_key = f"{center_point[0]}_{center_point[1]}"
        if cache_key in self.graph_cache:
            self.network_graph = self.graph_cache[cache_key]
            return True
        try:
            # Use simplify=True and increased tolerance for lower memory usage
            self.network_graph = ox.graph_from_point(
                center_point, 
                dist=dist, 
                network_type="drive",
                simplify=True,
                retain_all=False
            )
            self.network_graph = ox.add_edge_speeds(self.network_graph)
            self.network_graph = ox.add_edge_travel_times(self.network_graph)
            
            # Store in cache
            self.graph_cache[cache_key] = self.network_graph
            
            # Force garbage collection
            gc.collect()
            
            return True
        except Exception as e:
            print(f"Error initializing graph: {str(e)}")
            return False
        
    def _build_spatial_index(self):
        idx = index.Index()
        for i, row in self.stores_df.iterrows():
            idx.insert(i, (row['Latitude'], row['Longitude'], 
                          row['Latitude'], row['Longitude']))
        return idx

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate direct distance between two points"""
        return geodesic((lat1, lon1), (lat2, lon2)).kilometers

    def estimate_delivery_time(self, distance, current_time=None):
        """Estimate delivery time based on distance and current time"""
        if current_time is None:
            current_time = datetime.now()

        # Base time: 5 mins base + 2 mins per km
        base_minutes = 5 + (distance * 2)
        
        # Apply traffic multiplier based on time of day
        hour = current_time.hour
        if hour in [8, 9, 10, 17, 18, 19]:  # Peak hours
            multiplier = 1.5
        elif hour in [23, 0, 1, 2, 3, 4]:   # Off-peak hours
            multiplier = 0.8
        else:                                # Normal hours
            multiplier = 1.0
            
        return round(base_minutes * multiplier)

    def find_nearby_stores(self, lat, lon, radius=5):
        """Find stores within radius using spatial index"""
        nearby_stores = []
        bbox = (lat - radius/111.0, lon - radius/111.0, 
               lat + radius/111.0, lon + radius/111.0)
        
        for store_id in self.spatial_index.intersection(bbox):
            store = self.stores_df.iloc[store_id]
            distance = self.calculate_distance(lat, lon, 
                                            store['Latitude'], 
                                            store['Longitude'])
            if distance <= radius:
                delivery_time = self.estimate_delivery_time(distance)
                nearby_stores.append({
                    'store_name': store['Store Name'],
                    'address': store['Address'],
                    'contact': str(store['Contact Number']),  # Convert to string to avoid int64 issues
                    'distance': round(distance, 2),
                    'estimated_delivery_time': int(delivery_time),  # Ensure integer type
                    'product_categories': store['Product Categories'],
                    'location': {
                        'lat': float(store['Latitude']),  # Ensure float type
                        'lon': float(store['Longitude'])  # Ensure float type
                    }
                })
        
        return sorted(nearby_stores, key=lambda x: x['distance'])

    def create_store_map(self, center_lat, center_lon, radius=5):
        """Create an interactive map with store locations - optimized for memory"""
        # Create base map
        m = folium.Map(
            location=[center_lat, center_lon], 
            zoom_start=13,
            tiles="cartodbpositron"
        )
        
        # Create marker cluster for better performance with many markers
        marker_cluster = plugins.MarkerCluster().add_to(m)
        
        # Add stores to map
        nearby_stores = self.find_nearby_stores(center_lat, center_lon, radius)
        
        # Limit the number of stores to reduce memory usage
        max_stores = min(len(nearby_stores), 50)  # Cap at 50 stores
        
        for store in nearby_stores[:max_stores]:
            # Prepare popup content
            popup_content = f"""
            <div style='width: 200px'>
                <b>{store['store_name']}</b><br>
                Address: {store['address']}<br>
                Distance: {store['distance']} km<br>
                Est. Delivery: {store['estimated_delivery_time']} mins<br>
                Categories: {store['product_categories']}
            </div>
            """
            
            # Add store marker
            folium.Marker(
                location=[store['location']['lat'], store['location']['lon']],
                popup=folium.Popup(popup_content, max_width=300),
                icon=folium.Icon(color='red', icon='info-sign')
            ).add_to(marker_cluster)
            
            # Add line to show distance from center (only for closer stores)
            if store['distance'] <= nearby_stores[min(9, len(nearby_stores)-1)]['distance']:
                folium.PolyLine(
                    locations=[[center_lat, center_lon], 
                            [store['location']['lat'], store['location']['lon']]],
                    weight=2,
                    color='blue',
                    opacity=0.3
                ).add_to(m)
        
        # Add current location marker
        folium.Marker(
            location=[center_lat, center_lon],
            popup='Your Location',
            icon=folium.Icon(color='green', icon='home')
        ).add_to(m)
        
        # Add layer control only
        folium.LayerControl().add_to(m)
        
        return m

# Initialize store locator
store_locator = StoreLocator(stores_df)

# Helper functions for cleaning temporary files
def cleanup_temp_files():
    temp_dir = 'temp'
    if os.path.exists(temp_dir):
        for file in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, file)
            try:
                if os.path.isfile(file_path) and file.endswith('.html'):
                    # Delete files older than 1 hour
                    if os.path.getmtime(file_path) < time.time() - 3600:
                        os.remove(file_path)
            except Exception as e:
                print(f"Error cleaning up temp files: {e}")

# Register cleanup on startup and shutdown
@app.on_event("startup")
async def startup_event():
    cleanup_temp_files()

@app.on_event("shutdown")
async def shutdown_event():
    # Clean up all temporary files on shutdown
    try:
        shutil.rmtree('temp')
    except Exception as e:
        print(f"Error cleaning up temp directory: {e}")

# Routes
@app.get("/", response_class=HTMLResponse)
async def home():
    """API Documentation Homepage"""
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>falcao-maps API Documentation</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
            }}
            h1, h2 {{
                color: #333;
            }}
            pre {{
                background-color: #f4f4f4;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }}
        </style>
    </head>
    <body>
        <h1>Welcome to falcao-maps</h1>
        <p>Based on your uploaded dataset and deployed API, here are example API calls for your client:</p>

        <h2>1. Find Nearby Stores (JSON Response)</h2>
        <pre>
/api/stores/nearby?lat=18.9695&lon=72.8320&radius=1
        </pre>
        <p>Use this to get store details near Market Road area within 1km</p>

        <h2>2. View Basic Store Map</h2>
        <pre>
/api/stores/map?lat=18.9701&lon=72.8330&radius=0.5
        </pre>
        <p>Shows map centered at Main Street with 500m radius</p>

        <h2>3. View All Store Locations with Color Coding</h2>
        <pre>
/api/stores/locations?lat=18.9685&lon=72.8325&radius=2
        </pre>
        <p>Shows detailed map with color-coded stores within 2km</p>

        <h2>4. Get Route Between Points</h2>
        <p>Example routes:</p>
        <pre>
# Route from Park Avenue to Hill Road stores (use simple visualization for memory optimization)
/api/stores/route?user_lat=18.9710&user_lon=72.8335&store_lat=18.9705&store_lon=72.8345&viz_type=simple

# Route from Main Street to Market Road stores
/api/stores/route?user_lat=18.9701&user_lon=72.8330&store_lat=18.9695&store_lon=72.8320&viz_type=simple
        </pre>

        <h2>Key Location Points in Dataset:</h2>
        <ul>
            <li>Main Street Area: 18.9701, 72.8330</li>
            <li>Park Avenue: 18.9710, 72.8335</li>
            <li>Market Road: 18.9695, 72.8320</li>
            <li>Shopping Center: 18.9670, 72.8300</li>
            <li>Commercial Street: 18.9690, 72.8340</li>
        </ul>
        
        <h2>API Documentation</h2>
        <p>You can view the interactive API documentation at: <a href="/docs">/docs</a></p>
    </body>
    </html>
    """
    return html_content

@app.get("/api/stores/nearby", response_model=StoresResponse, responses={400: {"model": ErrorResponse}})
async def get_nearby_stores(
    lat: float = Query(..., description="Latitude of user location"),
    lon: float = Query(..., description="Longitude of user location"),
    radius: float = Query(5.0, description="Search radius in kilometers")
):
    """Get nearby stores based on user location"""
    try:
        nearby_stores = store_locator.find_nearby_stores(lat, lon, radius)
        return {"status": "success", "stores": nearby_stores}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/stores/map", response_class=HTMLResponse, responses={400: {"model": ErrorResponse}})
async def get_stores_map(
    lat: float = Query(..., description="Latitude of center point"),
    lon: float = Query(..., description="Longitude of center point"),
    radius: float = Query(5.0, description="Search radius in kilometers")
):
    """Get HTML map with store locations"""
    try:
        # Clean up temp files before creating new ones
        cleanup_temp_files()
        
        store_map = store_locator.create_store_map(lat, lon, radius)
        
        # Create complete HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <title>Stores Map</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                }}
                #map {{
                    width: 100%;
                    height: 100%;
                }}
            </style>
        </head>
        <body>
            {store_map.get_root().render()}
            <script>
                window.onload = function() {{
                    setTimeout(function() {{
                        window.dispatchEvent(new Event('resize'));
                    }}, 1000);
                }};
            </script>
        </body>
        </html>
        """
        
        # Save the HTML to a file
        file_path = 'temp/stores_map.html'
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Return the file as HTML response
        return html_content
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/stores/route", response_class=HTMLResponse, responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
async def get_store_route(
    user_lat: float = Query(..., description="User location latitude"),
    user_lon: float = Query(..., description="User location longitude"),
    store_lat: float = Query(..., description="Store location latitude"),
    store_lon: float = Query(..., description="Store location longitude"),
    viz_type: str = Query("simple", description="Visualization type (simple or advanced)")
):
    """Get route between user and store locations with visualization"""
    try:
        # Clean up temp files before creating new ones
        cleanup_temp_files()
        
        # Initialize graph if not already initialized
        # Use a smaller distance to reduce memory usage
        if store_locator.network_graph is None:
            success = store_locator.initialize_graph((user_lat, user_lon), dist=10000)
            if not success:
                raise HTTPException(status_code=400, detail="Unable to initialize graph, try a different location")
        
        # Get nearest nodes
        start_node = ox.distance.nearest_nodes(
            store_locator.network_graph, user_lon, user_lat)
        end_node = ox.distance.nearest_nodes(
            store_locator.network_graph, store_lon, store_lat)
        
        try:
            # Calculate path using the travel_time weight
            path_time = nx.shortest_path(
                store_locator.network_graph, 
                start_node, 
                end_node, 
                weight='travel_time'
            )
            
            if viz_type == "simple":
                # Create a simple folium map for low-resource environments
                m = folium.Map(
                    location=[(user_lat + store_lat) / 2, (user_lon + store_lon) / 2],
                    zoom_start=15,
                    tiles="cartodbpositron"
                )
                
                # Add markers for start and end points
                folium.Marker(
                    [user_lat, user_lon],
                    popup='Your Location',
                    icon=folium.Icon(color='green', icon='home')
                ).add_to(m)
                
                folium.Marker(
                    [store_lat, store_lon],
                    popup='Store Location',
                    icon=folium.Icon(color='red', icon='info-sign')
                ).add_to(m)
                
                # Extract coordinates from the path
                path_coords = []
                for node in path_time:
                    x = store_locator.network_graph.nodes[node]['x']
                    y = store_locator.network_graph.nodes[node]['y']
                    path_coords.append([y, x])  # Note the y, x order for folium
                
                # Add the route line
                folium.PolyLine(
                    locations=path_coords,
                    weight=5,
                    color='blue',
                    opacity=0.7
                ).add_to(m)
                
                # Add distance and time estimate
                total_distance = 0
                total_time = 0
                
                for i in range(len(path_time) - 1):
                    a, b = path_time[i], path_time[i + 1]
                    total_distance += store_locator.network_graph.edges[(a, b, 0)]['length']
                    total_time += store_locator.network_graph.edges[(a, b, 0)]['travel_time']
                
                # Convert to km and minutes
                total_distance_km = round(total_distance / 1000, 2)
                total_time_min = round(total_time / 60, 1)
                
                # Add info box
                html_content = f"""
                <div style="position: fixed; top: 10px; left: 50px; z-index: 9999; 
                            background-color: white; padding: 10px; border-radius: 5px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.3);">
                    <h4 style="margin: 0 0 5px 0;">Route Information</h4>
                    <p><b>Distance:</b> {total_distance_km} km<br>
                       <b>Est. Time:</b> {total_time_min} minutes</p>
                </div>
                """
                
                m.get_root().html.add_child(folium.Element(html_content))
                
                # Add layer control
                folium.LayerControl().add_to(m)
                
                # Create complete HTML content
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <title>Simple Route Map</title>
                    <style>
                        body {{
                            margin: 0;
                            padding: 0;
                            width: 100vw;
                            height: 100vh;
                            overflow: hidden;
                        }}
                        #map {{
                            width: 100%;
                            height: 100%;
                        }}
                    </style>
                </head>
                <body>
                    {m.get_root().render()}
                    <script>
                        window.onload = function() {{
                            setTimeout(function() {{
                                window.dispatchEvent(new Event('resize'));
                            }}, 1000);
                        }};
                    </script>
                </body>
                </html>
                """
                
                # Save the HTML to a file
                file_path = 'temp/simple_route_map.html'
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                # Return the HTML content
                return html_content
                
            else:
                # WARNING: Advanced visualization - may cause memory issues on limited resources
                
                # Limit the path nodes to reduce memory usage
                # Only include every Nth node
                step = max(1, len(path_time) // 30)  # Maximum 30 points
                simplified_path = path_time[::step]
                if path_time[-1] not in simplified_path:
                    simplified_path.append(path_time[-1])
                
                # Create animation data (simplified)
                lst_start, lst_end = [], []
                start_x, start_y = [], []
                end_x, end_y = [], []
                lst_length, lst_time = [], []

                for a, b in zip(simplified_path[:-1], simplified_path[1:]):
                    lst_start.append(a)
                    lst_end.append(b)
                    
                    # Calculate accumulated length and time between simplified points
                    segment_length = 0
                    segment_time = 0
                    path_segment = nx.shortest_path(
                        store_locator.network_graph, a, b, weight='travel_time')
                    
                    for i in range(len(path_segment) - 1):
                        u, v = path_segment[i], path_segment[i + 1]
                        segment_length += store_locator.network_graph.edges[(u, v, 0)]['length']
                        segment_time += store_locator.network_graph.edges[(u, v, 0)]['travel_time']
                    
                    lst_length.append(round(segment_length))
                    lst_time.append(round(segment_time))
                    start_x.append(store_locator.network_graph.nodes[a]['x'])
                    start_y.append(store_locator.network_graph.nodes[a]['y'])
                    end_x.append(store_locator.network_graph.nodes[b]['x'])
                    end_y.append(store_locator.network_graph.nodes[b]['y'])

                df = pd.DataFrame(
                    list(zip(lst_start, lst_end, start_x, start_y, end_x, end_y, 
                            lst_length, lst_time)),
                    columns=["start", "end", "start_x", "start_y",
                            "end_x", "end_y", "length", "travel_time"]
                ).reset_index().rename(columns={"index": "id"})

                # Create animation using plotly (reduced complexity)
                df_start = df[df["start"] == lst_start[0]]
                df_end = df[df["end"] == lst_end[-1]]

                fig = px.scatter_mapbox(
                    data_frame=df, 
                    lon="start_x", 
                    lat="start_y",
                    zoom=15, 
                    width=800,  # Reduced size
                    height=600,  # Reduced size
                    animation_frame="id",
                    mapbox_style="carto-positron"
                )

                # Basic visualization elements only
                fig.data[0].marker = {"size": 12}
                
                # Add start point
                fig.add_trace(
                    px.scatter_mapbox(
                        data_frame=df_start, 
                        lon="start_x", 
                        lat="start_y"
                    ).data[0]
                )
                fig.data[1].marker = {"size": 15, "color": "red"}

                # Add end point
                fig.add_trace(
                    px.scatter_mapbox(
                        data_frame=df_end, 
                        lon="start_x", 
                        lat="start_y"
                    ).data[0]
                )
                fig.data[2].marker = {"size": 15, "color": "green"}

                # Add route
                fig.add_trace(
                    px.line_mapbox(
                        data_frame=df, 
                        lon="start_x", 
                        lat="start_y"
                    ).data[0]
                )

                # Simplified layout with fewer options to reduce complexity
                fig.update_layout(
                    showlegend=False,
                    margin={"r":0,"t":0,"l":0,"b":0},
                    autosize=True,
                    height=None
                )

                # Create complete HTML content
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <title>Route Map</title>
                    <style>
                        body {{
                            margin: 0;
                            padding: 0;
                            width: 100vw;
                            height: 100vh;
                            overflow: hidden;
                        }}
                        #map-container {{
                            width: 100%;
                            height: 100%;
                        }}
                    </style>
                </head>
                <body>
                    <div id="map-container">
                        {fig.to_html(include_plotlyjs=True, full_html=False, config={'staticPlot': True})}
                    </div>
                    <script>
                        window.onload = function() {{
                            setTimeout(function() {{
                                window.dispatchEvent(new Event('resize'));
                            }}, 1000);
                        }};
                    </script>
                </body>
                </html>
                """
                
                # Save the HTML to a file
                file_path = 'temp/route_map.html'
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                # Return the HTML content
                return html_content

        except nx.NetworkXNoPath:
            raise HTTPException(status_code=404, detail="No route found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/stores/locations", response_class=HTMLResponse, responses={400: {"model": ErrorResponse}})
async def get_all_store_locations(
    lat: float = Query(..., description="Latitude of center point"),
    lon: float = Query(..., description="Longitude of center point"),
    radius: float = Query(10.0, description="Search radius in kilometers")
):
    """Get a map showing all stores in the given radius with colors based on distance"""
    try:
        # Clean up temp files before creating new ones
        cleanup_temp_files()
        
        # Get nearby stores
        nearby_stores = store_locator.find_nearby_stores(lat, lon, radius)
        
        # Limit number of stores for memory optimization
        max_stores = min(len(nearby_stores), 50)
        nearby_stores = nearby_stores[:max_stores]
        
        # Create base map centered on user location
        m = folium.Map(
            location=[lat, lon],
            zoom_start=12,
            tiles="cartodbpositron"
        )
        
        # Add user location marker
        folium.Marker(
            [lat, lon],
            popup='Your Location',
            icon=folium.Icon(color='green', icon='home')
        ).add_to(m)
        
        # Add markers for each store with color coding based on distance
        for store in nearby_stores:
            # Color code based on distance
            if store['distance'] <= 2:
                color = 'red'  # Very close
            elif store['distance'] <= 5:
                color = 'orange'  # Moderate distance
            else:
                color = 'blue'  # Further away
                
            # Create simplified popup content
            popup_content = f"""
            <div style='width: 200px; font-size: 14px;'>
                <h4 style='color: {color}; margin: 0 0 8px 0;'>{store['store_name']}</h4>
                <b>Distance:</b> {store['distance']} km<br>
                <b>Est. Delivery:</b> {store['estimated_delivery_time']} mins<br>
                <b>Categories:</b> {store['product_categories']}<br>
                <button onclick="window.location.href='/api/stores/route?user_lat={lat}&user_lon={lon}&store_lat={store['location']['lat']}&store_lon={store['location']['lon']}&viz_type=simple'" 
                        style='margin-top: 8px; padding: 8px; width: 100%; background-color: #007bff; color: white; border: none; border-radius: 4px;'>
                    Get Route
                </button>
            </div>
            """
            
            # Add store marker
            folium.Marker(
                location=[store['location']['lat'], store['location']['lon']],
                popup=folium.Popup(popup_content, max_width=300),
                icon=folium.Icon(color=color, icon='info-sign'),
                tooltip=f"{store['store_name']} ({store['distance']} km)"
            ).add_to(m)
            
            # Add circle to show distance - only for closer stores to reduce complexity
            if store['distance'] <= 5:
                folium.Circle(
                    location=[store['location']['lat'], store['location']['lon']],
                    radius=store['distance'] * 100,
                    color=color,
                    fill=True,
                    opacity=0.1
                ).add_to(m)
        
        # Add distance circles from user location - reduced to save memory
        for circle_radius, color in [(2000, 'red'), (5000, 'orange')]:
            folium.Circle(
                location=[lat, lon],
                radius=circle_radius,
                color=color,
                fill=False,
                weight=1,dash_array='5, 5'
            ).add_to(m)
        
        # Create mobile-friendly HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <title>Nearby Stores</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                }}
                #map {{
                    width: 100%;
                    height: 100%;
                }}
                .legend {{
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    font-size: 12px;
                    z-index: 1000;
                }}
                .info-box {{
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: white;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    font-size: 12px;
                    z-index: 1000;
                }}
            </style>
        </head>
        <body>
            {m.get_root().render()}
            <div class="legend">
                <b>Distance Zones</b><br>
                <span style="color: red;">●</span> &lt; 2 km<br>
                <span style="color: orange;">●</span> 2-5 km<br>
                <span style="color: blue;">●</span> &gt; 5 km
            </div>
            <div class="info-box">
                <b>Search Radius:</b> {radius} km<br>
                <b>Stores Found:</b> {len(nearby_stores)}
            </div>
            <script>
                window.onload = function() {{
                    setTimeout(function() {{
                        window.dispatchEvent(new Event('resize'));
                    }}, 1000);
                }};
            </script>
        </body>
        </html>
        """
        
        # Save and return the file
        file_path = 'temp/locations_map.html'
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Return the HTML content
        return html_content
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Add endpoint to serve static files directly
@app.get("/temp/{file_path:path}", response_class=FileResponse)
async def get_temp_file(file_path: str):
    """Serve temporary files like HTML maps"""
    full_path = os.path.join("temp", file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)

# Add memory monitoring and management middleware
@app.middleware("http")
async def add_memory_management(request: Request, call_next):
    # Cleanup before processing request
    cleanup_temp_files()
    
    # Process the request
    response = await call_next(request)
    
    # Cleanup after processing request
    gc.collect()
    
    return response

# For running the application directly (development mode)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)