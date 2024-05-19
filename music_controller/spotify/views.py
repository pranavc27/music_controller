from django.shortcuts import render , redirect
from .credentials import REDIRECT_URI , CLIENT_ID , CLIENT_SECRET
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status 
from rest_framework.response import Response
from .util import *
import requests
from api.models import Room
# Create your views here.

class AuthURL(APIView):
    def get(self , request , format = None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET' , 'https://accounts.spotify.com/authorize' , params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url} , status = status.HTTP_200_OK)
    
def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        print(f"Error during Spotify callback: {error}")
        return redirect('/')

    response = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    })

    response_data = response.json()

    access_token = response_data.get('access_token')
    token_type = response_data.get('token_type')
    expires_in = response_data.get('expires_in')
    refresh_token = response_data.get('refresh_token')

    if not all([access_token, token_type, expires_in, refresh_token]):
        print(f"Missing tokens in Spotify response: {response_data}")
        return redirect('/')

    session_id = request.session.session_key
    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)

    return redirect('/')

class IsAuthenticated(APIView):
    def get(self, request , format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated} , status=status.HTTP_200_OK)



class CurrentSong(APIView):
    def get(self, request,format=None):
        room_code = self.request.session.get('room_code')
        if not room_code:
            return Response({"error": "Room code not found in session."}, status=status.HTTP_400_BAD_REQUEST)
        
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({} , status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host , endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({"error": "No currently playing song found."} , status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artists = item.get('artists', [])
        artists_string = ", ".join([artist.get('name', 'Unknown Artist') for artist in artists])

        song = {
            'title': item.get('name'),
            'artist': artists_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing, 
            'votes': 0,
            'id': song_id
        }


        return Response(song, status=status.HTTP_200_OK)


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)
    

class SkipSong(APIView):
    def post(self,request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({'Error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.session.session_key == room.host:
            skip_song(room.host)
        else:
            pass

        return Response({} , status=status.HTTP_204_NO_CONTENT)
