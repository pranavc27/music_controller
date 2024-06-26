from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import REDIRECT_URI , CLIENT_ID , CLIENT_SECRET
from requests import post , put , get
import logging
from requests import RequestException

BASE_URL = "https://api.spotify.com/v1/me/"

logger = logging.getLogger(__name__)

def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user = session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)

    if expires_in is not None:
        expires_in = timezone.now() + timedelta(seconds=expires_in)
    else:
        logger.error("expires_in is None for session_id: %s", session_id)
        raise ValueError("expires_in is None")

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token,
                              token_type=token_type, expires_in=expires_in)
        tokens.save()



def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    return False


def refresh_spotify_token(session_id):
    try:
        refresh_token = get_user_tokens(session_id).refresh_token
        response = post('https://accounts.spotify.com/api/token', data={
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        })

        response_data = response.json()

        access_token = response_data.get('access_token')
        token_type = response_data.get('token_type')
        expires_in = response_data.get('expires_in')

        if not all([access_token, token_type, expires_in]):
            logger.error("Missing fields in Spotify token response: %s", response_data)
            raise ValueError("Missing fields in Spotify token response")

        update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)
    except RequestException as e:
        logger.error("Error refreshing Spotify token: %s", e)
        raise
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        raise
    

def execute_spotify_api_request(session_id , endpoint , post_ = False , put_= False):
    tokens = get_user_tokens(session_id)
    header = {'Content-Type': 'application/json' , 'Authorization': "Bearer " + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint , headers=header)
    if put_:
        put(BASE_URL + endpoint , headers=header)
    
    response = get(BASE_URL + endpoint , {} , headers=header)

    try:
        return response.json()
    except:
        return {'Error' : 'Issue with Request'}
    

def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)

def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id , "player/next" , post_=True)